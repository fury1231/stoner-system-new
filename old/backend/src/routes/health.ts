import { Router, Request, Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const health = await db.healthCheck()
    const statusCode = health.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      details: {
        type: 'error',
        error: String(error)
      }
    })
  }
})

export default router
