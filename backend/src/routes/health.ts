import { Router, Request, Response } from 'express'
import { db } from '../db.js'
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// 🔒 安全性改進：公開健康檢查只返回基本狀態（供負載均衡器/監控使用）
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = await db.healthCheck()
    const statusCode = health.status === 'healthy' ? 200 : 503
    // 只返回基本狀態，不暴露內部統計數據
    res.status(statusCode).json({
      status: health.status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    })
  }
})

// 🔒 詳細健康檢查僅供管理員使用
router.get('/detailed', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 驗證管理員權限
    const user = await db.getUserByUsername(req.user.username)
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: '權限不足' })
      return
    }

    const health = await db.healthCheck()
    const statusCode = health.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    // 🔒 安全性改進：不洩漏錯誤詳情
    console.error('Health check error:', error)
    res.status(503).json({
      status: 'unhealthy',
      details: {
        type: 'error'
        // 不返回原始錯誤訊息，防止敏感資訊洩漏
      }
    })
  }
})

export default router
