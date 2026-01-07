import { Request, Response, NextFunction } from 'express'
import { db } from '../db.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    username: string
    role: 'admin' | 'user'
    permissions: string[]
    store_id?: number | null
  }
}

// 檢查用戶是否有指定權限
export const requirePermissions = (requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const username = (req as any).user?.username
      if (!username) {
        return res.status(401).json({ message: '用戶未認證' })
      }

      const user = await db.getUserByUsername(username)
      if (!user) {
        return res.status(401).json({ message: '用戶不存在' })
      }

      if (!user.is_active) {
        return res.status(403).json({ message: '用戶帳戶已停用' })
      }

      // 管理員擁有所有權限
      if (user.role === 'admin') {
        req.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          permissions: user.permissions,
          store_id: user.store_id
        }
        return next()
      }

      // 檢查用戶是否有所需權限
      const hasPermission = requiredPermissions.every(permission => 
        user.permissions.includes(permission)
      )

      if (!hasPermission) {
        // 🔒 安全性改進：移除 current 權限，避免資訊洩漏
        // 只在開發環境顯示 required，生產環境只顯示通用訊息
        if (process.env.NODE_ENV === 'production') {
          return res.status(403).json({ message: '權限不足' })
        }
        return res.status(403).json({
          message: '權限不足',
          required: requiredPermissions
        })
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        store_id: user.store_id
      }

      next()
    } catch (error) {
      console.error('Permission check error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  }
}

// 檢查單一權限的便利函數
export const requirePermission = (permission: string) => {
  return requirePermissions([permission])
}