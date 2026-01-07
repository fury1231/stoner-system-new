import { Router, Request, Response } from 'express'
import { db } from '../db.js'
import { authenticate } from '../middleware/auth.js'

// 權限檢查中間件
const requireStorePermission = (permission: string) => {
  return async (req: any, res: Response, next: any) => {
    try {
      if (!req.user?.username) {
        return res.status(401).json({ message: '用戶未認證' })
      }
      
      const user = await db.getUserByUsername(req.user.username)
      if (!user) {
        return res.status(401).json({ message: '用戶不存在' })
      }
      
      // 管理員擁有所有權限
      if (user.role === 'admin') {
        return next()
      }
      
      // 檢查特定權限
      const userPermissions = Array.isArray(user.permissions) ? user.permissions : []
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ message: '權限不足' })
      }
      
      next()
    } catch (error) {
      console.error('Permission check error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  }
}

const router: Router = Router()

// 公開的分店列表 - 用於前端表單選擇分店
router.get('/public', async (req: Request, res: Response) => {
  try {
    const stores = await db.getAllStores()
    // 只返回啟用的分店和基本資訊
    const publicStores = stores.filter(store => store.is_active).map(store => ({
      id: store.id,
      name: store.name,
      code: store.code,
      is_active: store.is_active,
      created_at: store.created_at
    }))
    res.json(publicStores)
  } catch (error) {
    console.error('Error fetching public stores:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 獲取所有分店 - 需要管理員權限
router.get('/', authenticate, requireStorePermission('manage_stores'), async (req: Request, res: Response) => {
  try {
    const stores = await db.getAllStores()
    res.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 獲取特定分店
router.get('/:id', authenticate, requireStorePermission('manage_stores'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id
    if (!idParam) {
      res.status(400).json({ message: '分店ID是必需的' })
      return
    }
    
    const id = parseInt(idParam)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的分店ID' })
      return
    }
    
    const store = await db.getStoreById(id)
    if (!store) {
      res.status(404).json({ message: '找不到指定的分店' })
      return
    }
    
    res.json(store)
  } catch (error) {
    console.error('Error fetching store:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 新增分店
router.post('/', authenticate, requireStorePermission('manage_stores'), async (req: Request, res: Response) => {
  try {
    const { name, code, address, phone, manager } = req.body
    
    // 基本驗證
    if (!name || !code) {
      res.status(400).json({ message: '分店名稱和代碼為必填項' })
      return
    }
    
    const storeInput = {
      name,
      code,
      address,
      phone,
      manager
    }
    
    const store = await db.createStore(storeInput)
    res.status(201).json(store)
  } catch (error) {
    console.error('Error creating store:', error)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ message: '分店代碼已存在' })
    } else {
      res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
    }
  }
})

// 更新分店
router.put('/:id', authenticate, requireStorePermission('manage_stores'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id
    if (!idParam) {
      res.status(400).json({ message: '分店ID是必需的' })
      return
    }
    
    const id = parseInt(idParam)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的分店ID' })
      return
    }
    
    const { name, code, address, phone, manager } = req.body
    const updates: any = {}
    
    if (name !== undefined) updates.name = name
    if (code !== undefined) updates.code = code
    if (address !== undefined) updates.address = address
    if (phone !== undefined) updates.phone = phone
    if (manager !== undefined) updates.manager = manager
    
    const store = await db.updateStore(id, updates)
    if (!store) {
      res.status(404).json({ message: '找不到指定的分店' })
      return
    }
    
    res.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ message: '分店代碼已存在' })
    } else {
      res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
    }
  }
})

// 刪除分店
router.delete('/:id', authenticate, requireStorePermission('manage_stores'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id
    if (!idParam) {
      res.status(400).json({ message: '分店ID是必需的' })
      return
    }
    
    const id = parseInt(idParam)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的分店ID' })
      return
    }
    
    // 檢查是否有相關的匯款記錄
    const payments = await db.getPaymentsByStore(id)
    if (payments.length > 0) {
      res.status(400).json({ message: '無法刪除有匯款記錄的分店' })
      return
    }
    
    const deleted = await db.deleteStore(id)
    if (!deleted) {
      res.status(404).json({ message: '找不到指定的分店' })
      return
    }
    
    res.json({ message: '分店已成功刪除' })
  } catch (error) {
    console.error('Error deleting store:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

// 獲取分店的匯款記錄
router.get('/:id/payments', authenticate, async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id
    if (!idParam) {
      res.status(400).json({ message: '分店ID是必需的' })
      return
    }
    
    const id = parseInt(idParam)
    if (isNaN(id)) {
      res.status(400).json({ message: '無效的分店ID' })
      return
    }
    
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
    
    // 權限檢查：總部用戶可以看所有分店，分店用戶只能看自己的
    if (user.store_id !== null && user.store_id !== id) {
      res.status(403).json({ message: '權限不足' })
      return
    }
    
    const payments = await db.getPaymentsByStore(id)
    res.json(payments)
  } catch (error) {
    console.error('Error fetching store payments:', error)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

export { router as storeRoutes }