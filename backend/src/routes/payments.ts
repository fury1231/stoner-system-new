import { Router, Response } from 'express'
import { db } from '../db.js'
import { paymentValidation, paymentUpdateValidation, handleValidationErrors } from '../middleware/validation.js'
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permissions.js'
import { bulkOperationRateLimit } from '../middleware/security.js'
import { getClientIP } from '../utils/ip.js'
import { safeAuditLog } from '../utils/audit-logger.js'
import { getUserAccessibleStores, canAccessStore } from '../utils/store-permissions.js'
import bcrypt from 'bcryptjs'

const router: Router = Router()

// UUID 格式驗證（v4 格式）
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isValidUUID = (uuid: string): boolean => {
  return UUID_REGEX.test(uuid)
}

// 批量刪除最大數量限制
const MAX_BATCH_DELETE = 100
const MAX_BULK_IMPORT = 500

router.post('/', authenticate, paymentValidation, handleValidationErrors, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }
    
    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    // 🔒 分店權限檢查：確保用戶只能提交到有權限的分店
    const requestedStoreId = req.body.store_id || 1
    let userAccessibleStores: number[] = []
    
    // 優先級：1. accessible_stores（可訪問多個分店）2. store_id（僅限單一分店）
    if (user.accessible_stores && user.accessible_stores.length > 0) {
      userAccessibleStores = user.accessible_stores
    } else if (user.store_id) {
      userAccessibleStores = [user.store_id]
    } else if (user.role === 'admin') {
      // 管理員可以提交到任何分店
      userAccessibleStores = [] // 空數組表示無限制
    } else {
      res.status(403).json({ message: '您沒有權限提交匯款記錄到任何分店' })
      return
    }
    
    // 如果不是管理員且有分店限制，檢查權限
    if (user.role !== 'admin' && userAccessibleStores.length > 0) {
      if (!userAccessibleStores.includes(requestedStoreId)) {
        const store = await db.getStoreById(requestedStoreId)
        const storeName = store ? store.name : `分店ID ${requestedStoreId}`
        res.status(403).json({ 
          message: `您沒有權限提交匯款記錄到 ${storeName}`,
          code: 'STORE_ACCESS_DENIED'
        })
        return
      }
    }

    const paymentInput = {
      paid_at: req.body.paid_at,
      payment_method: req.body.payment_method,
      last_five: req.body.last_five || null,
      amount: req.body.amount,
      note: req.body.note,
      store_id: requestedStoreId,
      processed_by: req.body.processed_by,
      // 匯款和員工購物-匯款需要確認，其他方式自動設為已入帳
      status: (req.body.payment_method === '匯款' || req.body.payment_method === '員工購物-匯款' ? '未確認' : '已入帳') as '未確認' | '已入帳' | '未入帳'
    }

    const payment = await db.createPayment(paymentInput)

    // 🔒 記錄審計日誌（使用安全函數）
    const store = await db.getStoreById(paymentInput.store_id)
    const storeCode = store ? store.code : paymentInput.store_id.toString()

    await safeAuditLog({
      user_id: user.id,
      username: req.user.username,
      action: 'create',
      resource_type: 'payment',
      resource_id: payment.uuid,
      details: `新增收款記錄：${paymentInput.payment_method} $${paymentInput.amount}, 分店=${storeCode}`,
      ip_address: getClientIP(req),
      user_agent: req.get('User-Agent')
    }, 'create-payment')
    
    res.status(201).json({
      message: '付款資訊已成功提交',
      uuid: payment.uuid
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 🔢 現金統計 API - 直接在資料庫計算，支援百萬筆資料
router.get('/statistics/cash', authenticate, requirePermission('view_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }

    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    // 解析分店ID參數
    const storeId = req.query.store_id ? parseInt(req.query.store_id as string) : undefined

    // 權限檢查：非管理員只能查看有權限的分店
    if (storeId && user.role !== 'admin') {
      let userAccessibleStores: number[] = []
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      }

      if (userAccessibleStores.length > 0 && !userAccessibleStores.includes(storeId)) {
        res.status(403).json({ message: '您沒有權限查看此分店的統計' })
        return
      }
    }

    const statistics = await db.getCashStatistics(storeId)
    res.json(statistics)
  } catch (error) {
    console.error('Error getting cash statistics:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 🏪 各分店現金統計 API - 一次取得所有分店資料
router.get('/statistics/cash/stores', authenticate, requirePermission('view_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }

    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    const allStoresStats = await db.getAllStoresCashStatistics()

    // 權限過濾：非管理員只返回有權限的分店
    if (user.role !== 'admin') {
      let userAccessibleStores: number[] = []
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      }

      if (userAccessibleStores.length > 0) {
        const filteredStats = allStoresStats.filter(stat => userAccessibleStores.includes(stat.storeId))
        res.json(filteredStats)
        return
      }
    }

    res.json(allStoresStats)
  } catch (error) {
    console.error('Error getting all stores cash statistics:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 查看匯款記錄列表 - 需要 view_payments 權限（支援分頁和篩選）
router.get('/', authenticate, requirePermission('view_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }
    
    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    // 解析查詢參數
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    // 🔧 優化：限制單次查詢最大筆數，從環境變數讀取（預設 1000）
    const maxLimit = parseInt(process.env.MAX_QUERY_LIMIT || '1000')
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || 50))
    const offset = (page - 1) * limit

    // 解析篩選條件
    const filters: any = {}
    
    if (req.query.status && typeof req.query.status === 'string') {
      if (['未確認', '已入帳', '未入帳'].includes(req.query.status)) {
        filters.status = req.query.status
      }
    }
    
    // 允許的付款方式列表
    const validPaymentMethods = [
      '現金', '匯款', '電子支付', '店內支出', '提領',
      '電子支付-街口支付', '電子支付-LINE PAY', '電子支付-刷卡', '電子支付-TAP PAY',
      '員工購物-現金', '員工購物-匯款', '員工購物-電子支付'
    ]

    // 单选付款方式（向后兼容）
    if (req.query.payment_method && typeof req.query.payment_method === 'string') {
      if (validPaymentMethods.includes(req.query.payment_method)) {
        filters.payment_method = req.query.payment_method
      }
    }

    // 多选付款方式
    if (req.query.payment_methods) {
      let methods: string[] = []
      if (typeof req.query.payment_methods === 'string') {
        methods = req.query.payment_methods.split(',')
      } else if (Array.isArray(req.query.payment_methods)) {
        methods = req.query.payment_methods as string[]
      }

      const filteredMethods = methods.filter(method =>
        validPaymentMethods.includes(method)
      )

      if (filteredMethods.length > 0) {
        filters.payment_methods = filteredMethods
      }
    }
    
    // 单选分店（向后兼容）
    if (req.query.store_id && typeof req.query.store_id === 'string') {
      const storeId = parseInt(req.query.store_id)
      if (!isNaN(storeId) && storeId > 0) {
        filters.store_id = storeId
      }
    }
    
    // 多选分店（先解析前端傳入的參數，稍後在權限檢查中處理）
    let requestedStoreIds: number[] = []
    if (req.query.store_ids) {
      if (typeof req.query.store_ids === 'string') {
        requestedStoreIds = req.query.store_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)
      } else if (Array.isArray(req.query.store_ids)) {
        requestedStoreIds = (req.query.store_ids as string[]).map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0)
      }
    }
    
    if (req.query.start_date && typeof req.query.start_date === 'string') {
      filters.start_date = req.query.start_date
    }
    
    if (req.query.end_date && typeof req.query.end_date === 'string') {
      filters.end_date = req.query.end_date
    }
    
    if (req.query.search && typeof req.query.search === 'string') {
      // 清理搜尋字串以防止注入
      filters.search = req.query.search.trim().substring(0, 100)
    }

    // 權限檢查和分店篩選處理
    if (user.role === 'admin') {
      // 管理員可以訪問所有分店，但需要處理前端的分店篩選
      if (requestedStoreIds.length > 0) {
        // 前端指定了分店篩選，直接應用
        filters.store_ids = requestedStoreIds
      }
      // 如果沒有指定分店篩選，顯示所有分店的記錄（不設置篩選條件）
    } else {
      // 非管理員的權限檢查 - 明確定義優先級
      // 優先級：1. accessible_stores（可訪問多個分店）2. store_id（僅限單一分店）
      let userAccessibleStores: number[] = []
      
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        // 優先使用 accessible_stores（支援多分店訪問）
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        // 如果沒有 accessible_stores，則使用 store_id（單分店模式）
        userAccessibleStores = [user.store_id]
      } else {
        // 用戶沒有任何分店權限
        res.json({
          data: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0
          }
        })
        return
      }
      
      // 處理前端的分店篩選請求
      if (filters.store_id) {
        // 如果指定了單個分店ID，檢查是否有權限
        if (!userAccessibleStores.includes(filters.store_id)) {
          res.status(403).json({ message: '權限不足：無法訪問指定分店' })
          return
        }
        // 保留原有的 store_id 篩選
      } else if (requestedStoreIds.length > 0) {
        // 前端指定了多個分店，檢查權限並過濾
        const allowedStoreIds = requestedStoreIds.filter(id => userAccessibleStores.includes(id))
        if (allowedStoreIds.length === 0) {
          res.status(403).json({ message: '權限不足：沒有可訪問的分店' })
          return
        }
        filters.store_ids = allowedStoreIds
      } else {
        // 沒有指定分店ID，顯示所有有權限的分店記錄
        filters.store_ids = userAccessibleStores
      }
    }

    // 執行分頁查詢
    const { payments, total } = await db.getPaymentsPaginated(offset, limit, filters)
    
    res.json({
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: req.query // 回傳當前的篩選條件
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 查看特定匯款記錄 - 需要 view_payments 權限
router.get('/:uuid', authenticate, requirePermission('view_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uuid = req.params.uuid
    if (!uuid) {
      res.status(400).json({ message: 'UUID 參數是必需的' })
      return
    }

    // UUID 格式驗證
    if (!isValidUUID(uuid)) {
      res.status(400).json({ message: 'UUID 格式無效' })
      return
    }

    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }

    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    const payment = await db.getPaymentByUuid(uuid)

    if (!payment) {
      res.status(404).json({ message: '找不到指定的匯款記錄' })
      return
    }

    // 統一權限檢查：使用 canAccessStore 函數
    if (!canAccessStore(user, payment.store_id)) {
      res.status(403).json({ message: '權限不足：無法查看此分店的記錄' })
      return
    }

    res.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 修改匯款記錄（狀態、備註等）- 需要 edit_payments 權限
router.put('/:uuid', authenticate, requirePermission('edit_payments'), paymentUpdateValidation, handleValidationErrors, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uuid = req.params.uuid
    if (!uuid) {
      res.status(400).json({ message: 'UUID 參數是必需的' })
      return
    }

    // UUID 格式驗證
    if (!isValidUUID(uuid)) {
      res.status(400).json({ message: 'UUID 格式無效' })
      return
    }

    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }

    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    const oldPayment = await db.getPaymentByUuid(uuid)

    if (!oldPayment) {
      res.status(404).json({ message: '找不到指定的匯款記錄' })
      return
    }

    // 統一權限檢查：使用 canAccessStore 函數
    if (!canAccessStore(user, oldPayment.store_id)) {
      res.status(403).json({ message: '權限不足：無法編輯此分店的記錄' })
      return
    }

    const updates = {
      ...(req.body.status && { status: req.body.status }),
      ...(req.body.note !== undefined && { note: req.body.note }),
      ...(req.body.payment_method && { payment_method: req.body.payment_method }),
      ...(req.body.last_five !== undefined && { last_five: req.body.last_five }),
      ...(req.body.amount !== undefined && { amount: req.body.amount }),
      ...(req.body.paid_at && { paid_at: req.body.paid_at }),
      ...(req.body.store_id !== undefined && { store_id: req.body.store_id })
    }

    // 如果用戶嘗試修改分店，檢查權限
    if (req.body.store_id !== undefined && req.body.store_id !== oldPayment.store_id) {
      // 非管理員用戶不能修改分店
      if (user.role !== 'admin') {
        res.status(403).json({ message: '權限不足：只有管理員可以修改分店' })
        return
      }
    }
    
    const updatedPayment = await db.updatePayment(uuid, updates)

    if (!updatedPayment) {
      res.status(404).json({ message: '更新失敗' })
      return
    }

    // 🔒 記錄審計日誌（使用安全函數）
    const updatesRecord = updates as Record<string, unknown>
    const changedFields = Object.keys(updates).filter(key =>
      oldPayment[key as keyof typeof oldPayment] !== updatesRecord[key]
    )

    if (changedFields.length > 0) {
      // 獲取分店信息以顯示代號
      const store = await db.getStoreById(oldPayment.store_id)
      const storeCode = store ? store.code : oldPayment.store_id.toString()

      const fieldChanges = await Promise.all(changedFields.map(async (field) => {
        const oldValue = oldPayment[field as keyof typeof oldPayment]
        const newValue = updatesRecord[field]

        // 如果是 store_id 欄位，顯示分店代號而不是ID
        if (field === 'store_id') {
          const newStore = updates.store_id ? await db.getStoreById(updates.store_id as number) : null
          const newStoreCode = newStore ? newStore.code : updates.store_id
          return `${field}: ${storeCode} → ${newStoreCode}`
        }

        return `${field}: ${oldValue} → ${newValue}`
      }))

      await safeAuditLog({
        user_id: user.id,
        username: user.username,
        action: 'update',
        resource_type: 'payment',
        resource_id: uuid,
        details: `更新收款記錄: ${fieldChanges.join(', ')}, 分店=${storeCode}`,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent')
      }, 'update-payment')
    }
    
    res.json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 刪除單筆匯款記錄 - 需要 delete_payments 權限
router.delete('/:uuid', authenticate, requirePermission('delete_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uuid = req.params.uuid
    if (!uuid) {
      res.status(400).json({ message: 'UUID 參數是必需的' })
      return
    }

    // UUID 格式驗證
    if (!isValidUUID(uuid)) {
      res.status(400).json({ message: 'UUID 格式無效' })
      return
    }

    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }

    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    const payment = await db.getPaymentByUuid(uuid)

    if (!payment) {
      res.status(404).json({ message: '找不到指定的匯款記錄' })
      return
    }

    // 統一權限檢查：使用 canAccessStore 函數
    if (!canAccessStore(user, payment.store_id)) {
      res.status(403).json({ message: '權限不足：無法刪除此分店的記錄' })
      return
    }
    
    const deleted = await db.deletePayment(uuid)

    if (!deleted) {
      res.status(500).json({ message: '刪除失敗' })
      return
    }

    // 🔒 記錄審計日誌（使用安全函數）
    const store = await db.getStoreById(payment.store_id)
    const storeCode = store ? store.code : payment.store_id.toString()

    await safeAuditLog({
      user_id: user.id,
      username: user.username,
      action: 'delete',
      resource_type: 'payment',
      resource_id: uuid,
      details: `刪除收款記錄: 金額=${payment.amount}, 分店=${storeCode}, 狀態=${payment.status}`,
      ip_address: getClientIP(req),
      user_agent: req.get('User-Agent')
    }, 'delete-payment')
    
    res.json({ message: '匯款記錄已成功刪除' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 批量刪除匯款記錄 - 需要 delete_payments 權限
router.delete('/', authenticate, requirePermission('delete_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uuids } = req.body

    if (!Array.isArray(uuids) || uuids.length === 0) {
      res.status(400).json({ message: '請提供要刪除的記錄 UUID 列表' })
      return
    }

    // 批量刪除大小限制
    if (uuids.length > MAX_BATCH_DELETE) {
      res.status(400).json({ message: `批量刪除最多 ${MAX_BATCH_DELETE} 筆記錄` })
      return
    }

    // UUID 格式驗證
    const invalidUUIDs = uuids.filter(uuid => typeof uuid !== 'string' || !isValidUUID(uuid))
    if (invalidUUIDs.length > 0) {
      res.status(400).json({ message: `包含無效的 UUID 格式（共 ${invalidUUIDs.length} 筆）` })
      return
    }

    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }
    
    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }
    
    // 非管理員需要檢查每個記錄是否屬於他們有權限的分店
    if (user.role !== 'admin') {
      // 獲取用戶可訪問的分店列表（使用和查詢相同的邏輯）
      let userAccessibleStores: number[] = []

      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      } else {
        res.status(403).json({ message: '權限不足，沒有可刪除的記錄' })
        return
      }

      // 🔒 安全性改進：使用原子化刪除，解決 TOCTOU 競態條件
      // 在單一事務中同時檢查分店權限和刪除，避免權限檢查和刪除之間的競態條件
      const deletedCount = await db.batchDeletePaymentsWithStoreCheck(uuids, userAccessibleStores)

      if (deletedCount === 0) {
        res.status(403).json({ message: '權限不足，沒有可刪除的記錄' })
        return
      }

      // 🔒 記錄審計日誌（使用安全函數）
      await safeAuditLog({
        user_id: user.id,
        username: user.username,
        action: 'delete',
        resource_type: 'payment',
        resource_id: null,
        details: `批量刪除 ${deletedCount} 筆付款記錄（用戶權限限制）`,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent')
      }, 'batch-delete-payment')
      
      res.json({ 
        message: `成功刪除 ${deletedCount} 筆匯款記錄（總共請求刪除 ${uuids.length} 筆）`,
        deletedCount,
        requestedCount: uuids.length
      })
    } else {
      // 管理員可以刪除所有記錄
      const deletedCount = await db.batchDeletePayments(uuids)

      // 🔒 記錄審計日誌（使用安全函數）
      await safeAuditLog({
        user_id: user.id,
        username: user.username,
        action: 'delete',
        resource_type: 'payment',
        resource_id: null,
        details: `批量刪除 ${deletedCount} 筆付款記錄（管理員權限）`,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent')
      }, 'batch-delete-payment-admin')
      
      res.json({ 
        message: `成功刪除 ${deletedCount} 筆匯款記錄`,
        deletedCount 
      })
    }
  } catch (error) {
    console.error('Error batch deleting payments:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 批量匯入匯款記錄 - 需要 manage_payments 權限
// 🔒 安全性改進：添加速率限制防止資源耗盡攻擊
router.post('/bulk-import', bulkOperationRateLimit, authenticate, requirePermission('manage_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { payments, password } = req.body

    if (!Array.isArray(payments) || payments.length === 0) {
      res.status(400).json({ message: '請提供要匯入的匯款記錄列表' })
      return
    }

    // 🔒 安全性改進：限制批量匯入數量，防止 DoS 攻擊
    if (payments.length > MAX_BULK_IMPORT) {
      res.status(400).json({ message: `批量匯入最多 ${MAX_BULK_IMPORT} 筆記錄` })
      return
    }

    const username = req.user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }

    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    // 🔒 安全性改進：驗證用戶密碼（移除前端硬編碼密碼）
    if (!password) {
      res.status(400).json({ message: '請提供密碼以確認匯入操作' })
      return
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      res.status(401).json({ message: '密碼錯誤' })
      return
    }
    
    const errors: string[] = []
    const successfulImports: any[] = []
    
    // 逐筆驗證和匯入
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i]
      
      try {
        // 基本驗證
        if (!payment.paid_at) {
          errors.push(`第 ${i + 1} 筆：付款時間不能為空`)
          continue
        }
        
        if (!payment.payment_method) {
          errors.push(`第 ${i + 1} 筆：付款方式不能為空`)
          continue
        }
        
        if (payment.amount === undefined || payment.amount === null || payment.amount < 0) {
          errors.push(`第 ${i + 1} 筆：金額不能為空或負數（贈品/公關品可設為 0）`)
          continue
        }
        
        // 如果是匯款方式，檢查後五碼
        if (payment.payment_method === '匯款' && (!payment.last_five || payment.last_five.length !== 5)) {
          errors.push(`第 ${i + 1} 筆：匯款方式需要提供5位數的後五碼`)
          continue
        }
        
        // 驗證日期格式
        const paidAt = new Date(payment.paid_at)
        if (isNaN(paidAt.getTime())) {
          errors.push(`第 ${i + 1} 筆：日期格式無效`)
          continue
        }
        
        // 準備匯入資料
        let storeId = payment.store_id
        
        // 如果用戶不是總部用戶，強制使用他們的分店ID
        if (user.store_id !== null && user.store_id !== undefined) {
          storeId = user.store_id
        } else if (!storeId) {
          // 總部用戶且沒有指定分店ID時，預設第一個分店
          storeId = 1
        }
        
        const paymentInput = {
          paid_at: payment.paid_at,
          payment_method: payment.payment_method,
          last_five: payment.last_five || null,
          amount: parseInt(payment.amount),
          note: payment.note || '',
          status: payment.status || (payment.payment_method === '匯款' || payment.payment_method === '員工購物-匯款' ? '未確認' : '已入帳'),
          store_id: storeId
        }
        
        // 創建匯款記錄
        const createdPayment = await db.createPayment(paymentInput)
        
        // 如果有狀態且不是預設狀態，則更新狀態
        if (payment.status && payment.status !== '未確認') {
          await db.updatePayment(createdPayment.uuid, { status: payment.status })
        }
        
        successfulImports.push(createdPayment)
        
      } catch (error) {
        console.error(`Error importing payment ${i + 1}:`, error)
        errors.push(`第 ${i + 1} 筆：匯入失敗 - ${error instanceof Error ? error.message : '未知錯誤'}`)
      }
    }
    
    // 如果有錯誤但也有成功匯入的記錄，返回部分成功
    if (errors.length > 0 && successfulImports.length > 0) {
      res.status(207).json({
        message: `部分匯入成功：${successfulImports.length} 筆成功，${errors.length} 筆失敗`,
        imported: successfulImports.length,
        errors: errors
      })
    } else if (errors.length > 0) {
      // 全部失敗
      res.status(400).json({
        message: '匯入失敗',
        imported: 0,
        errors: errors
      })
    } else {
      // 全部成功
      res.status(201).json({
        message: `成功匯入 ${successfulImports.length} 筆匯款記錄`,
        imported: successfulImports.length,
        errors: []
      })
    }
    
    // 🔒 記錄審計日誌（如果有成功匯入的記錄，使用安全函數）
    if (successfulImports.length > 0) {
      await safeAuditLog({
        user_id: user.id,
        username: user.username,
        action: 'create',
        resource_type: 'payment',
        resource_id: null,
        details: `批量匯入 ${successfulImports.length} 筆付款記錄${errors.length > 0 ? `，${errors.length} 筆失敗` : ''}`,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent')
      }, 'bulk-import-payment')
    }
    
  } catch (error) {
    console.error('Error bulk importing payments:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 測試數據生成端點（僅用於開發環境）
// 🔒 生產環境禁用此端點
if (process.env.NODE_ENV !== 'production') {
router.post('/generate-test-data/:storeId', authenticate, requirePermission('edit_payments'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId)
    const count = parseInt(req.body.count) || 20
    
    if (isNaN(storeId)) {
      res.status(400).json({ message: '無效的分店ID' })
      return
    }
    
    // 檢查分店是否存在
    const store = await db.getStoreById(storeId)
    if (!store) {
      res.status(404).json({ message: '分店不存在' })
      return
    }
    
    const testPayments = []
    const now = new Date()
    
    for (let i = 0; i < count; i++) {
      // 生成隨機日期（過去30天內）
      const randomDays = Math.floor(Math.random() * 30)
      const paymentDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
      
      // 隨機時間
      const randomHour = Math.floor(Math.random() * 24)
      const randomMinute = Math.floor(Math.random() * 60)
      paymentDate.setHours(randomHour, randomMinute, 0, 0)
      
      const payment = {
        last_five: Math.floor(10000 + Math.random() * 90000).toString(),
        paid_at: paymentDate.toISOString(),
        payment_method: '匯款',
        amount: Math.floor(500 + Math.random() * 5000), // 500-5500之間
        note: `測試數據 ${i + 1} - ${store.name}`,
        status: ['未確認', '已入帳', '未入帳'][Math.floor(Math.random() * 3)] as '未確認' | '已入帳' | '未入帳',
        store_id: storeId
      }
      
      testPayments.push(payment)
    }
    
    // 批量插入
    const insertPromises = testPayments.map(payment => db.createPayment(payment))
    const results = await Promise.all(insertPromises)
    
    console.log(`Generated ${results.length} test payments for store ${store.name} (ID: ${storeId})`)
    
    res.json({ 
      message: `成功為 ${store.name} 生成 ${results.length} 筆測試數據`,
      count: results.length,
      store: store.name
    })
  } catch (error) {
    console.error('Error generating test data:', error)
    res.status(500).json({ message: '生成測試數據失敗' })
  }
})
} // 結束 NODE_ENV !== 'production' 條件

export { router as paymentRoutes }