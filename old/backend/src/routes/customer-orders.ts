import { Router, Request, Response } from 'express'
import { db } from '../db.js'
import { body, validationResult } from 'express-validator'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permissions.js'
import { getClientIP } from '../utils/ip.js'

const router: Router = Router()

// 客訂單驗證規則
const customerOrderValidation = [
  body('order_date')
    .notEmpty()
    .withMessage('訂單日期不能為空'),
  
  body('products')
    .notEmpty()
    .withMessage('商品不能為空')
    .isLength({ max: 300 })
    .withMessage('商品描述不能超過300字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_,.!?@#$%&*()\[\]{}+=/:;'"<>]*$/)
    .withMessage('商品描述包含不允許的字符'),
  
  body('customer_name')
    .notEmpty()
    .withMessage('取件名稱不能為空')
    .isLength({ max: 50 })
    .withMessage('取件名稱不能超過50字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s]*$/)
    .withMessage('取件名稱只能包含字母、數字、中文和空格'),
  
  body('customer_phone')
    .notEmpty()
    .withMessage('取件電話不能為空')
    .isLength({ min: 10, max: 15 })
    .withMessage('電話號碼長度必須在10-15字符之間')
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('電話號碼格式不正確'),
  
  body('payment_status')
    .isIn(['已付款', '未付款'])
    .withMessage('付款狀況必須是：已付款、未付款'),
  
  body('logistics')
    .notEmpty()
    .withMessage('物流資訊不能為空')
    .isLength({ max: 150 })
    .withMessage('物流資訊不能超過150字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_,.]*$/)
    .withMessage('物流資訊包含不允許的字符'),
  
  body('remarks')
    .optional()
    .isLength({ max: 200 })
    .withMessage('備註不能超過200字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_,.!?@#$%&*()\[\]{}+=/:;'"<>]*$/)
    .withMessage('備註包含不允許的字符'),
  
  body('amount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('金額必須是非負整數'),
  
  body('store_id')
    .isInt({ min: 1 })
    .withMessage('分店ID必須是正整數')
]

// 處理驗證錯誤的中介軟體
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: '驗證失敗',
      errors: errors.array().map((error: any) => ({
        field: error.param,
        message: error.msg
      }))
    })
    return
  }
  next()
}

// 新增客訂單
router.post('/', authenticate, customerOrderValidation, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const username = (req as any).user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }
    
    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    // 檢查分店權限
    const requestedStoreId = req.body.store_id
    let userAccessibleStores: number[] = []
    
    if (user.accessible_stores && user.accessible_stores.length > 0) {
      userAccessibleStores = user.accessible_stores
    } else if (user.store_id) {
      userAccessibleStores = [user.store_id]
    } else if (user.role === 'admin') {
      userAccessibleStores = []
    } else {
      res.status(403).json({ message: '您沒有權限在任何分店建立客訂單' })
      return
    }
    
    if (user.role !== 'admin' && userAccessibleStores.length > 0) {
      if (!userAccessibleStores.includes(requestedStoreId)) {
        const store = await db.getStoreById(requestedStoreId)
        const storeName = store ? store.name : `分店ID ${requestedStoreId}`
        res.status(403).json({ 
          message: `您沒有權限在 ${storeName} 建立客訂單`,
          code: 'STORE_ACCESS_DENIED'
        })
        return
      }
    }

    const orderInput = {
      order_date: req.body.order_date,
      products: req.body.products,
      customer_name: req.body.customer_name,
      customer_phone: req.body.customer_phone,
      payment_status: req.body.payment_status,
      logistics: req.body.logistics,
      remarks: req.body.remarks,
      amount: req.body.amount,
      store_id: requestedStoreId,
      created_by: username
    }

    const order = await db.createCustomerOrder(orderInput)
    
    // 記錄審計日誌
    try {
      const store = await db.getStoreById(orderInput.store_id)
      const storeCode = store ? store.code : orderInput.store_id.toString()
      
      await db.createAuditLog({
        user_id: user?.id || null,
        username: username,
        action: 'create',
        resource_type: 'system',
        resource_id: order.id.toString(),
        details: `新增客訂單：${order.customer_name} - ${order.products}, 分店=${storeCode}`,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent')
      })
    } catch (logError) {
      console.error('Error creating audit log:', logError)
    }
    
    res.status(201).json({
      message: '客訂單已成功建立',
      order: order
    })
  } catch (error) {
    console.error('Error creating customer order:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 獲取所有客訂單 - 需要權限
router.get('/', authenticate, requirePermission('view_payments'), async (req: Request, res: Response) => {
  try {
    const username = (req as any).user?.username
    if (!username) {
      res.status(401).json({ message: '用戶未認證' })
      return
    }
    
    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    let orders: any[] = []

    if (user.role === 'admin') {
      // 管理員可以看到所有客訂單
      orders = await db.getAllCustomerOrders()
    } else {
      // 非管理員只能看到自己分店的客訂單
      let userAccessibleStores: number[] = []
      
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      }
      
      if (userAccessibleStores.length > 0) {
        // 獲取所有可訪問分店的客訂單
        const storeOrders = await Promise.all(
          userAccessibleStores.map(storeId => db.getCustomerOrdersByStore(storeId))
        )
        orders = storeOrders.flat()
        // 按創建時間排序
        orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }
    }
    
    res.json({
      orders: orders,
      total: orders.length
    })
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 獲取特定客訂單
router.get('/:id', authenticate, requirePermission('view_payments'), async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id)
    if (isNaN(orderId)) {
      res.status(400).json({ message: '無效的客訂單ID' })
      return
    }

    const order = await db.getCustomerOrderById(orderId)
    if (!order) {
      res.status(404).json({ message: '找不到指定的客訂單' })
      return
    }

    // 檢查權限 - 用戶只能查看自己分店的客訂單
    const username = (req as any).user?.username
    const user = await db.getUserByUsername(username)
    
    if (user && user.role !== 'admin') {
      let userAccessibleStores: number[] = []
      
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      }
      
      if (userAccessibleStores.length > 0 && !userAccessibleStores.includes(order.store_id)) {
        res.status(403).json({ message: '您沒有權限查看此客訂單' })
        return
      }
    }
    
    res.json(order)
  } catch (error) {
    console.error('Error fetching customer order:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 更新客訂單狀態（完成/進行中）
router.patch('/:id/status', authenticate, requirePermission('edit_payments'), async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id)
    if (isNaN(orderId)) {
      res.status(400).json({ message: '無效的客訂單ID' })
      return
    }

    const { status } = req.body
    if (!status || !['進行中', '已完成'].includes(status)) {
      res.status(400).json({ message: '狀態必須是：進行中 或 已完成' })
      return
    }

    const existingOrder = await db.getCustomerOrderById(orderId)
    if (!existingOrder) {
      res.status(404).json({ message: '找不到指定的客訂單' })
      return
    }

    // 檢查權限
    const username = (req as any).user?.username
    const user = await db.getUserByUsername(username)
    
    if (user && user.role !== 'admin') {
      let userAccessibleStores: number[] = []
      
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      }
      
      if (userAccessibleStores.length > 0 && !userAccessibleStores.includes(existingOrder.store_id)) {
        res.status(403).json({ message: '您沒有權限修改此客訂單' })
        return
      }
    }

    const updatedOrder = await db.updateCustomerOrderStatus(orderId, status)
    
    // 記錄審計日誌
    try {
      await db.createAuditLog({
        user_id: user?.id || null,
        username: username || 'unknown',
        action: 'update',
        resource_type: 'system',
        resource_id: orderId.toString(),
        details: `更新客訂單狀態：${existingOrder.customer_name} - 狀態從 ${existingOrder.status} 改為 ${status}`,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent')
      })
    } catch (logError) {
      console.error('Error creating audit log:', logError)
    }
    
    res.json({
      message: '客訂單狀態已更新',
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error updating customer order status:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 更新客訂單（支援所有欄位的編輯）
router.patch('/:id', authenticate, requirePermission('edit_payments'), [
  body('order_date').optional()
    .notEmpty()
    .withMessage('訂單日期不能為空'),
  
  body('products').optional()
    .notEmpty()
    .withMessage('商品不能為空')
    .isLength({ max: 300 })
    .withMessage('商品描述不能超過300字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_,.!?@#$%&*()\[\]{}+=/:;'"<>]*$/)
    .withMessage('商品描述包含不允許的字符'),
  
  body('customer_name').optional()
    .notEmpty()
    .withMessage('取件名稱不能為空')
    .isLength({ max: 50 })
    .withMessage('取件名稱不能超過50字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s]*$/)
    .withMessage('取件名稱只能包含字母、數字、中文和空格'),
  
  body('customer_phone').optional()
    .notEmpty()
    .withMessage('取件電話不能為空')
    .isLength({ min: 10, max: 15 })
    .withMessage('電話號碼長度必須在10-15字符之間')
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('電話號碼格式不正確'),
  
  body('payment_status').optional()
    .isIn(['已付款', '未付款'])
    .withMessage('付款狀況必須是：已付款、未付款'),
  
  body('status').optional()
    .isIn(['進行中', '已完成'])
    .withMessage('狀態必須是：進行中、已完成'),
  
  body('logistics').optional()
    .notEmpty()
    .withMessage('物流資訊不能為空')
    .isLength({ max: 150 })
    .withMessage('物流資訊不能超過150字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_,.]*$/)
    .withMessage('物流資訊包含不允許的字符'),
  
  body('remarks').optional()
    .isLength({ max: 200 })
    .withMessage('備註不能超過200字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_,.!?@#$%&*()\[\]{}+=/:;'"<>]*$/)
    .withMessage('備註包含不允許的字符'),
  
  body('amount').optional()
    .isInt({ min: 0 })
    .withMessage('金額必須是非負整數'),
  
  body('store_id').optional()
    .isInt({ min: 1 })
    .withMessage('分店ID必須是正整數')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: '驗證失敗',
        errors: errors.array().map((error: any) => ({
          field: error.param,
          message: error.msg
        }))
      })
      return
    }

    const orderId = parseInt(req.params.id)
    if (isNaN(orderId)) {
      res.status(400).json({ message: '無效的客訂單ID' })
      return
    }

    const existingOrder = await db.getCustomerOrderById(orderId)
    if (!existingOrder) {
      res.status(404).json({ message: '找不到指定的客訂單' })
      return
    }

    // 檢查權限
    const username = (req as any).user?.username
    const user = await db.getUserByUsername(username)
    
    if (user && user.role !== 'admin') {
      let userAccessibleStores: number[] = []
      
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      }
      
      if (userAccessibleStores.length > 0 && !userAccessibleStores.includes(existingOrder.store_id)) {
        res.status(403).json({ message: '您沒有權限修改此客訂單' })
        return
      }

      // 檢查新分店權限（如果要修改分店）
      if (req.body.store_id && req.body.store_id !== existingOrder.store_id) {
        if (!userAccessibleStores.includes(req.body.store_id)) {
          const store = await db.getStoreById(req.body.store_id)
          const storeName = store ? store.name : `分店ID ${req.body.store_id}`
          res.status(403).json({ 
            message: `您沒有權限將客訂單轉移到 ${storeName}`,
            code: 'STORE_ACCESS_DENIED'
          })
          return
        }
      }
    }

    // 構建更新對象，只包含提供的欄位
    const updateData: any = {}
    const allowedFields = [
      'order_date', 'products', 'customer_name', 'customer_phone', 
      'payment_status', 'status', 'logistics', 'remarks', 'amount', 'store_id'
    ]
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    })

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: '沒有提供要更新的欄位' })
      return
    }

    const updatedOrder = await db.updateCustomerOrder(orderId, updateData)
    
    // 記錄審計日誌
    try {
      const changedFields = Object.keys(updateData).map(field => {
        const oldValue = (existingOrder as any)[field]
        const newValue = updateData[field]
        return `${field}: ${oldValue} → ${newValue}`
      }).join(', ')
      
      await db.createAuditLog({
        user_id: user?.id || null,
        username: username || 'unknown',
        action: 'update',
        resource_type: 'system',
        resource_id: orderId.toString(),
        details: `更新客訂單：${existingOrder.customer_name} - ${changedFields}`,
        ip_address: getClientIP(req),
        user_agent: req.get('User-Agent')
      })
    } catch (logError) {
      console.error('Error creating audit log:', logError)
    }
    
    res.json({
      message: '客訂單已更新',
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error updating customer order:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 刪除客訂單
router.delete('/:id', authenticate, requirePermission('delete_payments'), async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id)
    if (isNaN(orderId)) {
      res.status(400).json({ message: '無效的客訂單ID' })
      return
    }

    const existingOrder = await db.getCustomerOrderById(orderId)
    if (!existingOrder) {
      res.status(404).json({ message: '找不到指定的客訂單' })
      return
    }

    // 檢查權限
    const username = (req as any).user?.username
    const user = await db.getUserByUsername(username)
    
    if (user && user.role !== 'admin') {
      let userAccessibleStores: number[] = []
      
      if (user.accessible_stores && user.accessible_stores.length > 0) {
        userAccessibleStores = user.accessible_stores
      } else if (user.store_id) {
        userAccessibleStores = [user.store_id]
      }
      
      if (userAccessibleStores.length > 0 && !userAccessibleStores.includes(existingOrder.store_id)) {
        res.status(403).json({ message: '您沒有權限刪除此客訂單' })
        return
      }
    }

    const deleted = await db.deleteCustomerOrder(orderId)
    
    if (deleted) {
      // 記錄審計日誌
      try {
        await db.createAuditLog({
          user_id: user?.id || null,
          username: username || 'unknown',
          action: 'delete',
          resource_type: 'system',
          resource_id: orderId.toString(),
          details: `刪除客訂單：${existingOrder.customer_name} - ${existingOrder.products}`,
          ip_address: getClientIP(req),
          user_agent: req.get('User-Agent')
        })
      } catch (logError) {
        console.error('Error creating audit log:', logError)
      }
      
      res.json({ message: '客訂單已成功刪除' })
    } else {
      res.status(500).json({ message: '刪除客訂單失敗' })
    }
  } catch (error) {
    console.error('Error deleting customer order:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

export default router