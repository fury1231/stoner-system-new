import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requirePermissions } from '../middleware/permissions.js'
import { db } from '../db.js'

const router = Router()

// 獲取所有審計日誌（僅限管理員）
router.get('/', authenticate, requirePermissions(['system_admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const offset = (page - 1) * limit
    const action = req.query.action as string
    const resourceType = req.query.resource_type as string

    const logs = await db.getAllAuditLogs(limit, offset, action, resourceType)
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total: logs.length
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({
      success: false,
      message: '取得審計日誌失敗'
    })
  }
})

// 獲取特定用戶的審計日誌
router.get('/user/:userId', authenticate, requirePermissions(['system_admin']), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const limit = parseInt(req.query.limit as string) || 50

    const logs = await db.getAuditLogsByUser(userId, limit)
    
    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Error fetching user audit logs:', error)
    res.status(500).json({
      success: false,
      message: '取得用戶審計日誌失敗'
    })
  }
})

// 獲取特定資源的審計日誌
router.get('/resource/:resourceType', authenticate, requirePermissions(['system_admin']), async (req, res) => {
  try {
    const { resourceType } = req.params
    const resourceId = req.query.resourceId as string
    const limit = parseInt(req.query.limit as string) || 50

    const logs = await db.getAuditLogsByResource(resourceType, resourceId, limit)
    
    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Error fetching resource audit logs:', error)
    res.status(500).json({
      success: false,
      message: '取得資源審計日誌失敗'
    })
  }
})

export { router as auditRoutes }