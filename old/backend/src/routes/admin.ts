import { Router, Request, Response } from 'express'
import { adminLoginValidation, handleValidationErrors } from '../middleware/validation.js'
import { validateCredentials, generateToken, authenticate } from '../middleware/auth.js'
import { db } from '../db.js'
import { getClientIP } from '../utils/ip.js'

const router: Router = Router()

router.post('/login', adminLoginValidation, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    console.log('Admin login attempt:', username, 'password length:', password ? password.length : 'undefined')
    
    const isValid = await validateCredentials(username, password)
    console.log('Credential validation result:', isValid)
    
    if (!isValid) {
      console.log('Login failed for user:', username)
      res.status(401).json({ message: '用戶名或密碼錯誤' })
      return
    }
    
    const token = generateToken(username)
    
    // 記錄登入審計日誌
    try {
      const user = await db.getUserByUsername(username)
      if (user) {
        await db.createAuditLog({
          user_id: user.id,
          username: user.username,
          action: 'login',
          resource_type: 'system',
          resource_id: null,
          details: `用戶登入系統`,
          ip_address: getClientIP(req),
          user_agent: req.get('User-Agent')
        })
      }
    } catch (logError) {
      console.error('Error creating login audit log:', logError)
      // 不影響登入流程，只記錄錯誤
    }
    
    res.json({
      message: '登入成功',
      token,
      user: { username }
    })
  } catch (error) {
    console.error('Error during admin login:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

router.post('/logout', authenticate, async (req: any, res: Response) => {
  try {
    // 記錄登出審計日誌
    try {
      const user = await db.getUserByUsername(req.user.username)
      if (user) {
        await db.createAuditLog({
          user_id: user.id,
          username: user.username,
          action: 'logout',
          resource_type: 'system',
          resource_id: null,
          details: `用戶登出系統`,
          ip_address: getClientIP(req),
          user_agent: req.get('User-Agent')
        })
      }
    } catch (logError) {
      console.error('Error creating logout audit log:', logError)
      // 不影響登出流程，只記錄錯誤
    }
    
    res.json({ message: '登出成功' })
  } catch (error) {
    console.error('Error during logout:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 獲取當前用戶信息的 API
router.get('/me', authenticate, async (req: any, res: Response) => {
  try {
    const user = await db.getUserByUsername(req.user.username)
    if (!user) {
      res.status(404).json({ message: '用戶不存在' })
      return
    }
    
    // 不返回密碼哈希
    const { password_hash, ...safeUser } = user
    
    // 如果是 admin 用戶，確保擁有所有權限
    if (safeUser.role === 'admin') {
      safeUser.permissions = [
        'manage_users',
        'manage_stores', 
        'manage_payments',
        'view_payments',
        'edit_payments',
        'delete_payments',
        'view_reports',
        'system_admin'
      ]
    }
    
    res.json(safeUser)
  } catch (error) {
    console.error('Error fetching current user:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

export { router as adminRoutes }