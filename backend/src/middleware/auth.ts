import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '../db.js'

// 🔒 導出認證請求介面，供其他路由使用（避免 as any 類型轉換）
// 注意：user 設為可選是為了與 Express 類型系統相容
// 在 authenticate 中間件之後的路由中，user 保證存在
export interface AuthenticatedRequest extends Request {
  user?: { username: string }
}

// 類型守衛：確保 user 存在
export function assertAuthenticated(req: AuthenticatedRequest): asserts req is AuthenticatedRequest & { user: { username: string } } {
  if (!req.user) {
    throw new Error('User not authenticated')
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 🔒 安全性改進：優先從 HttpOnly Cookie 讀取 JWT，向後兼容 Authorization header
    let token: string | undefined

    // 1. 嘗試從 HttpOnly Cookie 讀取
    if (req.cookies?.auth_token) {
      token = req.cookies.auth_token
    }
    // 2. 向後兼容：從 Authorization header 讀取
    else {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      res.status(401).json({
        message: '未提供認證令牌',
        code: 'NO_TOKEN'
      })
      return
    }

    // 檢查 JWT_SECRET 是否為預設值
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret || jwtSecret === 'default-secret') {
      console.error('⚠️  SECURITY WARNING: Using default JWT secret!')
      res.status(500).json({
        message: '系統配置錯誤',
        code: 'SYSTEM_ERROR'
      })
      return
    }

    const decoded = jwt.verify(token, jwtSecret) as { username: string, iat: number, exp: number }

    // 檢查用戶是否仍然存在且活躍
    const user = await db.getUserByUsername(decoded.username)
    if (!user || !user.is_active) {
      res.status(401).json({
        message: '用戶不存在或已被停用',
        code: 'USER_INACTIVE'
      })
      return
    }

    // 檢查 token 是否即將過期（少於1小時）
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = decoded.exp - now

    if (timeUntilExpiry < 3600) { // 少於1小時
      res.setHeader('X-Token-Expiry-Warning', 'true')
      res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString())
    }

    (req as AuthenticatedRequest).user = decoded
    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        message: '認證令牌已過期',
        code: 'TOKEN_EXPIRED'
      })
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        message: '無效的認證令牌',
        code: 'INVALID_TOKEN'
      })
    } else {
      console.error('Authentication error:', error)
      res.status(500).json({ 
        message: '認證過程發生錯誤',
        code: 'AUTH_ERROR'
      })
    }
  }
}

export const validateCredentials = async (username: string, password: string): Promise<boolean> => {
  try {
    // 🔒 安全性修復：移除環境變數回退邏輯
    // 資料庫是唯一的認證來源，initializeDatabase() 已確保管理員用戶存在
    const user = await db.getUserByUsername(username)

    // 用戶不存在
    if (!user) {
      console.log(`Login attempt for non-existent user: ${username}`)
      return false
    }

    // 檢查用戶是否已停用
    if (!user.is_active) {
      console.log(`Login attempt for inactive user: ${username}`)
      return false
    }

    // 驗證密碼（使用 bcrypt 時間安全比較）
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      console.log(`Failed password attempt for user: ${username}`)
    }

    return passwordMatch
  } catch (error) {
    console.error('Error validating credentials:', error)
    return false
  }
}

export const generateToken = (username: string): string => {
  const jwtSecret = process.env.JWT_SECRET
  
  if (!jwtSecret || jwtSecret === 'default-secret') {
    throw new Error('JWT_SECRET not properly configured')
  }
  
  return jwt.sign(
    { username },
    jwtSecret,
    { expiresIn: '8h' }
  )
}