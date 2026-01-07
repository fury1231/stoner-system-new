import { Router, Request, Response, CookieOptions } from 'express'
import { adminLoginValidation, handleValidationErrors } from '../middleware/validation.js'
import { validateCredentials, generateToken, authenticate } from '../middleware/auth.js'
import { db } from '../db.js'
import { getClientIP } from '../utils/ip.js'
import bcrypt from 'bcryptjs'

const router: Router = Router()

router.post('/login', adminLoginValidation, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    console.log('Admin login attempt:', username)

    const isValid = await validateCredentials(username, password)
    
    if (!isValid) {
      console.log('Login failed for user:', username)
      res.status(401).json({ message: '用戶名或密碼錯誤' })
      return
    }
    
    const token = generateToken(username)

    // 🔒 安全性改進：使用 HttpOnly Cookie 存儲 JWT
    const cookieOptions: CookieOptions = {
      httpOnly: true,  // 防止 JavaScript 讀取（防 XSS）
      secure: process.env.NODE_ENV === 'production', // 生產環境使用 HTTPS
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8小時
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined
    }

    res.cookie('auth_token', token, cookieOptions)

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
    
    // 🔒 安全性改進：不在回應中返回 token（token 已存儲在 HttpOnly Cookie）
    res.json({
      message: '登入成功',
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

    // 🔒 清除 HttpOnly Cookie
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined
    }

    res.clearCookie('auth_token', cookieOptions)

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

// 清空數據 API (僅用於測試環境)
router.post('/clear-data', authenticate, async (req: any, res: Response) => {
  try {
    // 🔒 安全性改進：生產環境禁用此端點
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ success: false, message: '此功能在生產環境中已禁用' })
      return
    }

    const { password } = req.body
    const username = req.user?.username

    if (!username) {
      res.status(401).json({ success: false, message: '未授權' })
      return
    }

    // 驗證是否為管理員
    const user = await db.getUserByUsername(username)
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, message: '權限不足，僅管理員可執行此操作' })
      return
    }

    // 驗證密碼
    if (!password) {
      res.status(400).json({ success: false, message: '請提供密碼' })
      return
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: '密碼錯誤' })
      return
    }

    console.log(`⚠️ 用戶 ${username} 開始清空數據...`)

    // 執行清空操作
    const deleted = await db.clearAllData()

    // 記錄審計日誌
    await db.createAuditLog({
      user_id: user.id,
      username: user.username,
      action: 'delete',
      resource_type: 'system',
      resource_id: null,
      details: `清空所有數據 - 刪除: ${deleted.payments} 筆收款記錄, ${deleted.customer_orders} 筆客訂單, ${deleted.audit_logs} 筆審計日誌`,
      ip_address: getClientIP(req),
      user_agent: req.get('User-Agent')
    })

    console.log(`✅ 數據清空完成 - payments: ${deleted.payments}, customer_orders: ${deleted.customer_orders}, audit_logs: ${deleted.audit_logs}`)

    res.json({
      success: true,
      message: '數據清空完成',
      deleted
    })
  } catch (error) {
    console.error('Error clearing data:', error)
    res.status(500).json({ success: false, message: '清空數據失敗，請稍後再試' })
  }
})

export { router as adminRoutes }