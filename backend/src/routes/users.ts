import { Router, Response } from 'express'
import { db } from '../db.js'
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permissions.js'
import { passwordOperationRateLimit } from '../middleware/security.js'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'

const router: Router = Router()

// 驗證規則
const userValidation = [
  body('username')
    .isLength({ min: 3 }).withMessage('用戶名稱字數過少，至少需要3個字符')
    .isLength({ max: 20 }).withMessage('用戶名稱字數過多，最多20個字符'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('密碼長度必須在8-128個字符之間')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]/)
    .withMessage('密碼必須包含至少一個小寫字母、一個大寫字母、一個數字和一個特殊字符(@$!%*?&#+\-_=)'),
  body('role').isIn(['admin', 'user']).withMessage('角色必須選擇管理員或一般用戶'),
  body('permissions').optional().isArray().withMessage('權限設定格式錯誤'),
  body('store_id').optional().custom(value => {
    // 允許的值：null, undefined, 空字符串，或正整數
    if (value === null || value === undefined || value === '') return true
    if (value === 0 || value === '0') return false // 明確拒絕 0
    const numValue = Number(value)
    if (isNaN(numValue)) return false
    return Number.isInteger(numValue) && numValue > 0
  }).withMessage('請選擇有效的分店或留空'),
  body('accessible_stores').optional().isArray().withMessage('可訪問分店設定格式錯誤')
]

const userUpdateValidation = [
  body('username').optional()
    .isLength({ min: 3 }).withMessage('用戶名稱字數過少，至少需要3個字符')
    .isLength({ max: 20 }).withMessage('用戶名稱字數過多，最多20個字符'),
  body('password').optional().custom(value => {
    if (!value || value === '') return true  // 空密碼表示不修改
    if (value.length < 8 || value.length > 128) return false
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]/.test(value)
  }).withMessage('密碼必須包含至少8個字符，包括大小寫字母、數字和特殊字符(@$!%*?&#+\-_=)'),
  body('role').optional().isIn(['admin', 'user']).withMessage('角色必須選擇管理員或一般用戶'),
  body('permissions').optional().isArray().withMessage('權限設定格式錯誤'),
  body('store_id').optional().custom(value => {
    // 允許的值：null, undefined, 空字符串，或正整數
    if (value === null || value === undefined || value === '') return true
    if (value === 0 || value === '0') return false // 明確拒絕 0
    const numValue = Number(value)
    if (isNaN(numValue)) return false
    return Number.isInteger(numValue) && numValue > 0
  }).withMessage('請選擇有效的分店或留空'),
  body('accessible_stores').optional().isArray().withMessage('可訪問分店設定格式錯誤'),
  body('is_active').optional().isBoolean().withMessage('帳戶狀態設定錯誤')
]

// 獲取所有用戶
router.get('/', authenticate, requirePermission('manage_users'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await db.getAllUsers()
    // 不返回密碼哈希
    const safeUsers = users.map(({ password_hash, ...user }) => user)
    res.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 獲取特定用戶
router.get('/:id', authenticate, requirePermission('manage_users'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id!)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的用戶ID' })
      return
    }
    
    const user = await db.getUserById(id)
    if (!user) {
      res.status(404).json({ message: '找不到指定用戶' })
      return
    }
    
    // 不返回密碼哈希
    const { password_hash, ...safeUser } = user
    res.json(safeUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 創建新用戶
// 🔒 安全性改進：移除 TOCTOU 易受攻擊的檢查-後-創建模式
// 現在依賴資料庫的 UNIQUE 約束來防止重複用戶
router.post('/', authenticate, requirePermission('manage_users'), userValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors for user creation:', errors.array())
      console.log('Request body:', JSON.stringify(req.body, null, 2))
      res.status(400).json({
        message: '驗證失敗',
        errors: errors.array(),
        received: req.body
      })
      return
    }

    const { username, password, role, permissions, store_id, accessible_stores } = req.body

    const user = await db.createUser({
      username,
      password,
      role,
      permissions: permissions || [],
      store_id: store_id || null,
      accessible_stores: accessible_stores || []
    })

    // 不返回密碼哈希
    const { password_hash, ...safeUser } = user
    res.status(201).json(safeUser)
  } catch (error: any) {
    console.error('Error creating user:', error)
    // 🔒 處理資料庫唯一約束錯誤（由 db.createUser 拋出）
    if (error.message === 'USERNAME_EXISTS') {
      res.status(400).json({ message: '用戶名已存在' })
      return
    }
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 更新用戶
router.put('/:id', authenticate, requirePermission('manage_users'), userUpdateValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors for user update:', errors.array())
      console.log('Request body:', JSON.stringify(req.body, null, 2))
      res.status(400).json({ 
        message: '驗證失敗',
        errors: errors.array(),
        received: req.body
      })
      return
    }
    
    const id = parseInt(req.params.id!)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的用戶ID' })
      return
    }
    
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      res.status(404).json({ message: '找不到指定用戶' })
      return
    }
    
    // 防止修改admin帳戶的權限和角色
    if (existingUser.username === 'admin') {
      const { username, password, is_active, store_id, accessible_stores } = req.body
      
      // 只允許修改這些欄位，不允許修改role和permissions
      if (req.body.role !== undefined && req.body.role !== existingUser.role) {
        res.status(400).json({ message: '禁止修改 admin 帳戶的角色' })
        return
      }
      
      if (req.body.permissions !== undefined && JSON.stringify(req.body.permissions) !== JSON.stringify(existingUser.permissions)) {
        res.status(400).json({ message: '禁止修改 admin 帳戶的權限' })
        return
      }
      
      // 對於admin帳戶，只處理允許的欄位
      const updatedUser = await db.updateUser(id, {
        username,
        password,
        is_active,
        store_id,
        accessible_stores
      })
      
      if (!updatedUser) {
        res.status(404).json({ message: '更新失敗' })
        return
      }
      
      // 不返回密碼哈希
      const { password_hash, ...safeUser } = updatedUser
      res.json(safeUser)
      return
    }
    
    const { username, password, role, permissions, is_active, store_id, accessible_stores } = req.body
    
    // 防止管理員停用自己
    if (typeof is_active !== 'undefined' && is_active === false && req.user.username === existingUser.username) {
      res.status(400).json({ message: '無法停用自己的帳戶' })
      return
    }
    
    // 防止非管理員停用管理員帳戶
    const currentUser = await db.getUserByUsername(req.user.username)
    if (typeof is_active !== 'undefined' && is_active === false && existingUser.role === 'admin' && currentUser?.role !== 'admin') {
      res.status(403).json({ message: '權限不足：無法停用管理員帳戶' })
      return
    }

    // 🔒 安全性改進：移除 TOCTOU 檢查，依賴資料庫 UNIQUE 約束
    // 原本的檢查-後-更新模式存在競態條件漏洞

    const updatedUser = await db.updateUser(id, {
      username,
      password,
      role,
      permissions,
      is_active,
      store_id,
      accessible_stores
    })

    if (!updatedUser) {
      res.status(404).json({ message: '更新失敗' })
      return
    }

    // 不返回密碼哈希
    const { password_hash, ...safeUser } = updatedUser
    res.json(safeUser)
  } catch (error: any) {
    console.error('Error updating user:', error)
    // 🔒 處理資料庫唯一約束錯誤
    if (error.code === '23505' && error.constraint?.includes('username')) {
      res.status(400).json({ message: '用戶名已存在' })
      return
    }
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 刪除用戶
router.delete('/:id', authenticate, requirePermission('manage_users'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id!)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的用戶ID' })
      return
    }
    
    const user = await db.getUserById(id)
    if (!user) {
      res.status(404).json({ message: '找不到指定用戶' })
      return
    }
    
    // 防止刪除admin帳戶
    if (user.username === 'admin') {
      res.status(400).json({ message: '禁止刪除 admin 帳戶' })
      return
    }
    
    // 防止用戶刪除自己
    if (req.user.username === user.username) {
      res.status(400).json({ message: '無法刪除自己的帳戶' })
      return
    }
    
    // 防止非管理員刪除管理員帳戶
    const currentUser = await db.getUserByUsername(req.user.username)
    if (user.role === 'admin' && currentUser?.role !== 'admin') {
      res.status(403).json({ message: '權限不足：無法刪除管理員帳戶' })
      return
    }
    
    const deleted = await db.deleteUser(id)
    if (!deleted) {
      res.status(500).json({ message: '刪除失敗' })
      return
    }
    
    res.json({ message: '用戶已成功刪除' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 管理員重設用戶密碼
// 🔒 安全性改進：添加密碼操作速率限制
router.post('/:id/admin-reset-password', passwordOperationRateLimit, authenticate, requirePermission('manage_users'), [
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('新密碼長度必須在8-128個字符之間')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]/)
    .withMessage('新密碼必須包含至少一個小寫字母、一個大寫字母、一個數字和一個特殊字符(@$!%*?&#+\-_=)')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0]?.msg || 'Validation error' })
      return
    }
    
    const id = parseInt(req.params.id!)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的用戶ID' })
      return
    }
    
    const { newPassword } = req.body
    
    // 獲取目標用戶信息
    const targetUser = await db.getUserById(id)
    if (!targetUser) {
      res.status(404).json({ message: '用戶不存在' })
      return
    }
    
    // 更新密碼（updateUser 會自動加密）
    const updated = await db.updateUser(id, { password: newPassword } as any)
    if (!updated) {
      res.status(500).json({ message: '重設密碼失敗' })
      return
    }
    
    res.json({ message: '密碼重設成功' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 更改密碼
// 🔒 安全性改進：添加密碼操作速率限制
router.post('/change-password', passwordOperationRateLimit, authenticate, [
  body('currentPassword').notEmpty().withMessage('目前密碼是必填的'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('新密碼長度必須在8-128個字符之間')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]/)
    .withMessage('新密碼必須包含至少一個小寫字母、一個大寫字母、一個數字和一個特殊字符(@$!%*?&#+\-_=)')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0]?.msg || 'Validation error' })
      return
    }

    const { currentPassword, newPassword } = req.body
    const username = req.user.username

    // 獲取用戶信息
    const user = await db.getUserByUsername(username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    // 驗證目前密碼（🔒 安全：不記錄密碼到日誌）
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isCurrentPasswordValid) {
      res.status(400).json({ message: '目前密碼不正確' })
      return
    }

    // 更新密碼（updateUser 會自動加密）
    const updated = await db.updateUser(user.id, { password: newPassword } as any)
    if (!updated) {
      res.status(500).json({ message: '更改密碼失敗' })
      return
    }

    res.json({ message: '密碼更改成功' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

export { router as userRoutes }