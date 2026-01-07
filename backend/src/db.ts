import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import NodeCache from 'node-cache'

// 匯入 Repository 類別
import {
  StoreRepository,
  UserRepository,
  PaymentRepository,
  AuditRepository,
  CustomerOrderRepository
} from './repositories/index.js'

// 重新匯出 Repository 類別供外部使用
export {
  StoreRepository,
  UserRepository,
  PaymentRepository,
  AuditRepository,
  CustomerOrderRepository
} from './repositories/index.js'

// ==================== 介面定義 ====================

export interface StoreRecord {
  id: number
  name: string
  code: string
  address?: string
  phone?: string
  manager?: string
  is_active: boolean
  created_at: string
}

export interface StoreInput {
  name: string
  code: string
  address?: string
  phone?: string
  manager?: string
}

export interface PaymentRecord {
  uuid: string
  paid_at: string
  payment_method: string
  last_five?: string | null
  amount: number
  note?: string
  status: '未確認' | '已入帳' | '未入帳'
  store_id: number
  processed_by?: string | undefined
  created_at: string
}

export interface PaymentInput {
  paid_at: string
  payment_method: string
  last_five?: string | null
  amount: number
  note?: string
  store_id: number
  processed_by?: string
  status?: '未確認' | '已入帳' | '未入帳'
}

export interface UserRecord {
  id: number
  username: string
  password_hash: string
  role: 'admin' | 'user'
  permissions: string[]
  store_id?: number | null
  accessible_stores?: number[]
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface UserInput {
  username: string
  password: string
  role: 'admin' | 'user'
  permissions?: string[]
  store_id?: number | null
  accessible_stores?: number[]
}

export interface AuditLogRecord {
  id: number
  user_id: number | null
  username: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout'
  resource_type: 'payment' | 'user' | 'store' | 'system'
  resource_id?: string | null
  details: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface AuditLogInput {
  user_id: number | null
  username: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view'
  resource_type: 'payment' | 'user' | 'store' | 'system'
  resource_id?: string | null
  details: string
  ip_address?: string | undefined
  user_agent?: string | undefined
}

export interface CustomerOrderRecord {
  id: number
  order_date: string
  products: string
  customer_name: string
  customer_phone: string
  payment_status: '已付款' | '未付款'
  logistics: string
  remarks?: string
  amount?: number
  status: '進行中' | '已完成' | '已刪除'
  store_id: number
  created_by: string
  created_at: string
  updated_at: string
  store_name?: string
  store_code?: string
}

export interface CustomerOrderInput {
  order_date: string
  products: string
  customer_name: string
  customer_phone: string
  payment_status: '已付款' | '未付款'
  logistics: string
  remarks?: string
  amount?: number
  store_id: number
  created_by: string
}

// ==================== 輔助函數 ====================

// 🔒 安全性改進：轉義 SQL LIKE 通配符防止注入
function escapeLikePattern(pattern: string): string {
  return pattern
    .replace(/\\/g, '\\\\')  // 先轉義反斜線
    .replace(/%/g, '\\%')    // 轉義 %
    .replace(/_/g, '\\_')    // 轉義 _
}

// ==================== 資料庫管理類別 ====================

class DatabaseManager {
  private pool: Pool
  private cache: NodeCache

  // Repository 實例
  public readonly stores: StoreRepository
  public readonly users: UserRepository
  public readonly payments: PaymentRepository
  public readonly audit: AuditRepository
  public readonly customerOrders: CustomerOrderRepository

  constructor() {
    // 🔒 安全性改進：生產環境必須設定 PG_PASSWORD
    const pgPassword = process.env.PG_PASSWORD
    if (!pgPassword && process.env.NODE_ENV === 'production') {
      throw new Error('PG_PASSWORD environment variable is required in production')
    }
    if (!pgPassword) {
      console.warn('⚠️  WARNING: Using default database password. Set PG_PASSWORD in production!')
    }

    this.pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT || '5432'),
      database: process.env.PG_DATABASE || 'stoner_system',
      user: process.env.PG_USERNAME || 'stoner',
      password: pgPassword || 'StonerDB2024!',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.cache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL || '300'),
      checkperiod: 60,
      useClones: false
    })

    // 初始化 Repository 實例
    this.stores = new StoreRepository(this.pool)
    this.users = new UserRepository(this.pool)
    this.payments = new PaymentRepository(this.pool)
    this.audit = new AuditRepository(this.pool)
    this.customerOrders = new CustomerOrderRepository(this.pool)
  }

  // 取得 PostgreSQL 連線池（用於直接查詢）
  getPool(): Pool {
    return this.pool
  }

  // ==================== 初始化 ====================

  async initialize(retries: number = 3, delay: number = 1000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.pool.query('SELECT NOW()')
        await this.createTables()
        await this.createIndexes()
        await this.initializeDefaultStores()
        console.log(`✅ Database initialized successfully${attempt > 1 ? ` (attempt ${attempt})` : ''}`)
        return
      } catch (error) {
        console.error(`❌ Database initialization attempt ${attempt}/${retries} failed:`, error)
        if (attempt === retries) {
          throw new Error(`Database initialization failed after ${retries} attempts: ${error}`)
        }
        const waitTime = delay * attempt
        console.log(`⏳ Retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  private async createTables(): Promise<void> {
    // stores 表
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        manager TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // users 表
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        permissions JSONB DEFAULT '[]'::jsonb,
        store_id INTEGER REFERENCES stores(id),
        accessible_stores JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `)

    // payments 表
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        uuid TEXT PRIMARY KEY,
        paid_at TIMESTAMP NOT NULL,
        payment_method TEXT NOT NULL,
        last_five TEXT,
        amount INTEGER NOT NULL,
        note TEXT,
        status TEXT NOT NULL DEFAULT '已入帳',
        store_id INTEGER REFERENCES stores(id),
        processed_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // audit_logs 表
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // customer_orders 表
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS customer_orders (
        id SERIAL PRIMARY KEY,
        order_date TEXT NOT NULL,
        products TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT '未付款',
        logistics TEXT,
        remarks TEXT,
        amount INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT '進行中',
        store_id INTEGER REFERENCES stores(id),
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  private async createIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code)',
      'CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at)',
      'CREATE INDEX IF NOT EXISTS idx_payments_store_id ON payments(store_id)',
      'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
      'CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method)',
      'CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount)',
      'CREATE INDEX IF NOT EXISTS idx_payments_store_status ON payments(store_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_payments_store_paid_at ON payments(store_id, paid_at)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type)',
      'CREATE INDEX IF NOT EXISTS idx_customer_orders_store_id ON customer_orders(store_id)',
      'CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_customer_orders_created_at ON customer_orders(created_at)',
    ]

    for (const idx of indexes) {
      await this.pool.query(idx)
    }
  }

  private async initializeDefaultStores(): Promise<void> {
    const result = await this.pool.query('SELECT COUNT(*) as count FROM stores')
    if (parseInt(result.rows[0].count) === 0) {
      console.log('Default stores created successfully')
      const defaultStores = [
        { name: '大安店', code: 'DA' },
        { name: '益民店', code: 'YM' },
        { name: '逢甲店', code: 'FC' },
        { name: '漢神店', code: 'HS' },
      ]

      for (const store of defaultStores) {
        await this.pool.query(
          'INSERT INTO stores (name, code) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
          [store.name, store.code]
        )
      }
    }
  }

  // ==================== 分店操作 ====================

  async getAllStores(): Promise<StoreRecord[]> {
    const cacheKey = 'all_stores'
    const cached = this.cache.get<StoreRecord[]>(cacheKey)
    if (cached) return cached

    const result = await this.pool.query('SELECT * FROM stores ORDER BY id')
    const stores = result.rows.map(row => ({
      ...row,
      is_active: Boolean(row.is_active)
    }))
    this.cache.set(cacheKey, stores, 600)
    return stores
  }

  async getStoreById(id: number): Promise<StoreRecord | null> {
    const result = await this.pool.query('SELECT * FROM stores WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    return { ...result.rows[0], is_active: Boolean(result.rows[0].is_active) }
  }

  async createStore(store: StoreInput): Promise<StoreRecord> {
    const result = await this.pool.query(
      `INSERT INTO stores (name, code, address, phone, manager)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [store.name, store.code, store.address || null, store.phone || null, store.manager || null]
    )
    this.cache.del('all_stores')
    return { ...result.rows[0], is_active: Boolean(result.rows[0].is_active) }
  }

  async updateStore(id: number, updates: Partial<StoreInput> & { is_active?: boolean }): Promise<StoreRecord | null> {
    // 白名單驗證：只允許更新這些欄位
    const allowedFields = ['name', 'code', 'address', 'phone', 'manager', 'is_active']
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    values.push(id)
    const result = await this.pool.query(
      `UPDATE stores SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    this.cache.del('all_stores')
    if (result.rows.length === 0) return null
    return { ...result.rows[0], is_active: Boolean(result.rows[0].is_active) }
  }

  async deleteStore(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM stores WHERE id = $1', [id])
    this.cache.del('all_stores')
    return (result.rowCount ?? 0) > 0
  }

  invalidateStoreCache(): void {
    this.cache.del('all_stores')
  }

  // ==================== 用戶操作 ====================

  async getAllUsers(): Promise<UserRecord[]> {
    const result = await this.pool.query('SELECT * FROM users ORDER BY id')
    return result.rows.map(row => ({
      ...row,
      permissions: row.permissions || [],
      accessible_stores: row.accessible_stores || [],
      is_active: Boolean(row.is_active)
    }))
  }

  async getUserById(id: number): Promise<UserRecord | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      ...row,
      permissions: row.permissions || [],
      accessible_stores: row.accessible_stores || [],
      is_active: Boolean(row.is_active)
    }
  }

  async getUserByUsername(username: string): Promise<UserRecord | null> {
    const cacheKey = `user:${username}`
    const cached = this.cache.get<UserRecord>(cacheKey)
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`)
      return cached
    }

    console.log(`❌ Cache miss: ${cacheKey}`)
    const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username])
    if (result.rows.length === 0) return null

    const row = result.rows[0]
    const user: UserRecord = {
      ...row,
      permissions: row.permissions || [],
      accessible_stores: row.accessible_stores || [],
      is_active: Boolean(row.is_active)
    }

    this.cache.set(cacheKey, user)
    return user
  }

  // 🔒 安全性改進：使用 UNIQUE 約束防止競態條件造成的重複用戶
  async createUser(user: UserInput): Promise<UserRecord> {
    const passwordHash = await bcrypt.hash(user.password, 10)

    try {
      const result = await this.pool.query(
        `INSERT INTO users (username, password_hash, role, permissions, store_id, accessible_stores)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          user.username,
          passwordHash,
          user.role,
          JSON.stringify(user.permissions || []),
          user.store_id || null,
          JSON.stringify(user.accessible_stores || [])
        ]
      )

      const row = result.rows[0]
      return {
        ...row,
        permissions: row.permissions || [],
        accessible_stores: row.accessible_stores || [],
        is_active: Boolean(row.is_active)
      }
    } catch (error: any) {
      // 🔒 處理唯一約束衝突（防止 TOCTOU 競態條件）
      if (error.code === '23505' && error.constraint?.includes('username')) {
        throw new Error('USERNAME_EXISTS')
      }
      throw error
    }
  }

  async updateUser(id: number, updates: Partial<UserInput> & { is_active?: boolean }): Promise<UserRecord | null> {
    const existingUser = await this.getUserById(id)
    if (!existingUser) return null

    // 白名單驗證：只允許更新這些欄位
    const allowedFields = ['username', 'password', 'role', 'permissions', 'store_id', 'accessible_stores', 'is_active']
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const values: any[] = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && allowedFields.includes(key)) {
        if (key === 'password') {
          fields.push(`password_hash = $${paramCount}`)
          values.push(await bcrypt.hash(value as string, 10))
        } else if (key === 'permissions' || key === 'accessible_stores') {
          fields.push(`${key} = $${paramCount}`)
          values.push(JSON.stringify(value))
        } else {
          fields.push(`${key} = $${paramCount}`)
          values.push(value)
        }
        paramCount++
      }
    }

    values.push(id)
    const result = await this.pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    this.cache.del(`user:${existingUser.username}`)

    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      ...row,
      permissions: row.permissions || [],
      accessible_stores: row.accessible_stores || [],
      is_active: Boolean(row.is_active)
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      const userResult = await client.query('SELECT username FROM users WHERE id = $1', [id])
      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return false
      }

      const username = userResult.rows[0].username

      await client.query('UPDATE audit_logs SET user_id = NULL WHERE user_id = $1', [id])
      await client.query('DELETE FROM users WHERE id = $1', [id])

      await client.query('COMMIT')
      this.cache.del(`user:${username}`)
      return true
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  invalidateUserCache(username: string): void {
    this.cache.del(`user:${username}`)
  }

  // ==================== 付款操作 ====================

  async createPayment(payment: PaymentInput): Promise<PaymentRecord> {
    const uuid = uuidv4()
    const result = await this.pool.query(
      `INSERT INTO payments (uuid, paid_at, payment_method, last_five, amount, note, status, store_id, processed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        uuid,
        payment.paid_at,
        payment.payment_method,
        payment.last_five || null,
        payment.amount,
        payment.note || null,
        payment.status || '已入帳',
        payment.store_id,
        payment.processed_by || null
      ]
    )
    return result.rows[0]
  }

  async getPaymentByUuid(uuid: string): Promise<PaymentRecord | null> {
    const result = await this.pool.query('SELECT * FROM payments WHERE uuid = $1', [uuid])
    return result.rows.length > 0 ? result.rows[0] : null
  }

  async getPaymentsByUuids(uuids: string[]): Promise<PaymentRecord[]> {
    if (uuids.length === 0) return []
    const placeholders = uuids.map((_, i) => `$${i + 1}`).join(', ')
    const result = await this.pool.query(
      `SELECT * FROM payments WHERE uuid IN (${placeholders})`,
      uuids
    )
    return result.rows
  }

  async getPaymentsByStore(storeId: number): Promise<PaymentRecord[]> {
    const result = await this.pool.query(
      'SELECT * FROM payments WHERE store_id = $1 ORDER BY paid_at DESC',
      [storeId]
    )
    return result.rows
  }

  async getPaymentsPaginated(
    offset: number,
    limit: number,
    filters?: {
      store_id?: number
      status?: string
      payment_method?: string
      start_date?: string
      end_date?: string
      search?: string
      accessible_stores?: number[]
    }
  ): Promise<{ payments: PaymentRecord[]; total: number }> {
    let whereConditions: string[] = []
    let params: any[] = []
    let paramCount = 1

    if (filters?.store_id) {
      whereConditions.push(`store_id = $${paramCount}`)
      params.push(filters.store_id)
      paramCount++
    }

    if (filters?.accessible_stores && filters.accessible_stores.length > 0) {
      const placeholders = filters.accessible_stores.map((_, i) => `$${paramCount + i}`).join(', ')
      whereConditions.push(`store_id IN (${placeholders})`)
      params.push(...filters.accessible_stores)
      paramCount += filters.accessible_stores.length
    }

    if (filters?.status) {
      whereConditions.push(`status = $${paramCount}`)
      params.push(filters.status)
      paramCount++
    }

    if (filters?.payment_method) {
      whereConditions.push(`payment_method = $${paramCount}`)
      params.push(filters.payment_method)
      paramCount++
    }

    if (filters?.start_date) {
      // 開始日期：台灣時間該日 00:00:00 = UTC 前一天 16:00:00
      const startDate = new Date(`${filters.start_date}T00:00:00+08:00`)
      whereConditions.push(`paid_at >= $${paramCount}`)
      params.push(startDate.toISOString())
      paramCount++
    }

    if (filters?.end_date) {
      // 結束日期：台灣時間該日 23:59:59 = UTC 當天 15:59:59
      const endDate = new Date(`${filters.end_date}T23:59:59.999+08:00`)
      whereConditions.push(`paid_at <= $${paramCount}`)
      params.push(endDate.toISOString())
      paramCount++
    }

    if (filters?.search) {
      // 🔒 安全性改進：轉義 LIKE 通配符防止搜索注入
      const escapedSearch = escapeLikePattern(filters.search)
      whereConditions.push(`(note ILIKE $${paramCount} OR last_five ILIKE $${paramCount})`)
      params.push(`%${escapedSearch}%`)
      paramCount++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 使用 CTE 優化：一次查詢獲取資料和計數
    const query = `
      WITH filtered AS (
        SELECT * FROM payments ${whereClause}
      ),
      counted AS (
        SELECT COUNT(*) as total FROM filtered
      )
      SELECT f.*, c.total
      FROM filtered f, counted c
      ORDER BY f.paid_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `

    params.push(limit, offset)
    const result = await this.pool.query(query, params)

    const total = result.rows.length > 0 ? parseInt(result.rows[0].total) : 0
    const payments = result.rows.map(({ total, ...payment }) => payment)

    return { payments, total }
  }

  async updatePayment(uuid: string, updates: Partial<PaymentInput>): Promise<PaymentRecord | null> {
    // 白名單驗證：只允許更新這些欄位
    const allowedFields = ['paid_at', 'payment_method', 'last_five', 'amount', 'note', 'status', 'store_id', 'processed_by']
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    values.push(uuid)
    const result = await this.pool.query(
      `UPDATE payments SET ${fields.join(', ')} WHERE uuid = $${paramCount} RETURNING *`,
      values
    )

    return result.rows.length > 0 ? result.rows[0] : null
  }

  async deletePayment(uuid: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM payments WHERE uuid = $1', [uuid])
    return (result.rowCount ?? 0) > 0
  }

  async batchDeletePayments(uuids: string[]): Promise<number> {
    if (uuids.length === 0) return 0

    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const placeholders = uuids.map((_, i) => `$${i + 1}`).join(', ')
      const result = await client.query(
        `DELETE FROM payments WHERE uuid IN (${placeholders})`,
        uuids
      )
      await client.query('COMMIT')
      return result.rowCount ?? 0
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // 🔒 安全性改進：原子化的批量刪除（帶分店權限檢查）
  // 解決 TOCTOU 競態條件：在單一事務中同時檢查權限和刪除
  async batchDeletePaymentsWithStoreCheck(uuids: string[], allowedStoreIds: number[]): Promise<number> {
    if (uuids.length === 0 || allowedStoreIds.length === 0) return 0

    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // 在同一事務中刪除，只刪除屬於允許分店的記錄
      const uuidPlaceholders = uuids.map((_, i) => `$${i + 1}`).join(', ')
      const storeIdPlaceholders = allowedStoreIds.map((_, i) => `$${uuids.length + i + 1}`).join(', ')

      const result = await client.query(
        `DELETE FROM payments WHERE uuid IN (${uuidPlaceholders}) AND store_id IN (${storeIdPlaceholders})`,
        [...uuids, ...allowedStoreIds]
      )

      await client.query('COMMIT')
      return result.rowCount ?? 0
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // ==================== 現金統計 ====================

  async getCashStatistics(storeId?: number): Promise<{
    cashIncome: number
    employeeCashIncome: number
    transferIncome: number
    employeeTransferIncome: number
    electronicIncome: number
    electronicJkoPay: number
    electronicLinePay: number
    electronicCreditCard: number
    electronicTapPay: number
    electronicOther: number
    employeeElectronicIncome: number
    customerOrder: number
    withdrawal: number
    storeExpense: number
    cashBalance: number
    totalIncome: number
    totalExpense: number
  }> {
    const whereClause = storeId ? 'WHERE store_id = $1' : ''
    const params = storeId ? [storeId] : []

    const result = await this.pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN payment_method = '現金' THEN amount ELSE 0 END), 0) as cash_income,
        COALESCE(SUM(CASE WHEN payment_method = '員工購物-現金' THEN amount ELSE 0 END), 0) as employee_cash_income,
        COALESCE(SUM(CASE WHEN payment_method = '匯款' THEN amount ELSE 0 END), 0) as transfer_income,
        COALESCE(SUM(CASE WHEN payment_method = '員工購物-匯款' THEN amount ELSE 0 END), 0) as employee_transfer_income,
        COALESCE(SUM(CASE WHEN payment_method LIKE '電子支付%' AND payment_method NOT LIKE '員工購物%' THEN amount ELSE 0 END), 0) as electronic_income,
        COALESCE(SUM(CASE WHEN payment_method = '電子支付-街口支付' THEN amount ELSE 0 END), 0) as electronic_jko_pay,
        COALESCE(SUM(CASE WHEN payment_method = '電子支付-LINE PAY' THEN amount ELSE 0 END), 0) as electronic_line_pay,
        COALESCE(SUM(CASE WHEN payment_method = '電子支付-刷卡' THEN amount ELSE 0 END), 0) as electronic_credit_card,
        COALESCE(SUM(CASE WHEN payment_method = '電子支付-TAP PAY' THEN amount ELSE 0 END), 0) as electronic_tap_pay,
        COALESCE(SUM(CASE WHEN payment_method = '電子支付' THEN amount ELSE 0 END), 0) as electronic_other,
        COALESCE(SUM(CASE WHEN payment_method = '員工購物-電子支付' THEN amount ELSE 0 END), 0) as employee_electronic_income,
        COALESCE(SUM(CASE WHEN payment_method = '客訂單' THEN amount ELSE 0 END), 0) as customer_order,
        COALESCE(SUM(CASE WHEN payment_method = '提領' THEN amount ELSE 0 END), 0) as withdrawal,
        COALESCE(SUM(CASE WHEN payment_method = '店內支出' THEN amount ELSE 0 END), 0) as store_expense
      FROM payments
      ${whereClause}
    `, params)

    const row = result.rows[0]
    const cashIncome = parseInt(row.cash_income) || 0
    const employeeCashIncome = parseInt(row.employee_cash_income) || 0
    const withdrawal = parseInt(row.withdrawal) || 0
    const storeExpense = parseInt(row.store_expense) || 0
    const electronicIncome = parseInt(row.electronic_income) || 0
    const employeeElectronicIncome = parseInt(row.employee_electronic_income) || 0
    const transferIncome = parseInt(row.transfer_income) || 0
    const employeeTransferIncome = parseInt(row.employee_transfer_income) || 0
    const customerOrder = parseInt(row.customer_order) || 0

    const cashBalance = cashIncome + employeeCashIncome - withdrawal - storeExpense

    return {
      cashIncome,
      employeeCashIncome,
      transferIncome,
      employeeTransferIncome,
      electronicIncome,
      electronicJkoPay: parseInt(row.electronic_jko_pay) || 0,
      electronicLinePay: parseInt(row.electronic_line_pay) || 0,
      electronicCreditCard: parseInt(row.electronic_credit_card) || 0,
      electronicTapPay: parseInt(row.electronic_tap_pay) || 0,
      electronicOther: parseInt(row.electronic_other) || 0,
      employeeElectronicIncome,
      customerOrder,
      withdrawal,
      storeExpense,
      cashBalance,
      totalIncome: cashIncome + employeeCashIncome + transferIncome + employeeTransferIncome + electronicIncome + employeeElectronicIncome + customerOrder,
      totalExpense: withdrawal + storeExpense
    }
  }

  async getAllStoresCashStatistics(): Promise<Array<{
    storeId: number
    storeName: string
    storeCode: string
    cashIncome: number
    withdrawal: number
    storeExpense: number
    cashBalance: number
  }>> {
    const result = await this.pool.query(`
      SELECT
        s.id as store_id,
        s.name as store_name,
        s.code as store_code,
        COALESCE(SUM(CASE WHEN p.payment_method IN ('現金', '員工購物-現金') THEN p.amount ELSE 0 END), 0) as cash_income,
        COALESCE(SUM(CASE WHEN p.payment_method = '提領' THEN p.amount ELSE 0 END), 0) as withdrawal,
        COALESCE(SUM(CASE WHEN p.payment_method = '店內支出' THEN p.amount ELSE 0 END), 0) as store_expense
      FROM stores s
      LEFT JOIN payments p ON s.id = p.store_id
      WHERE s.is_active = true
      GROUP BY s.id, s.name, s.code
      ORDER BY s.id
    `)

    return result.rows.map(row => ({
      storeId: row.store_id,
      storeName: row.store_name,
      storeCode: row.store_code,
      cashIncome: parseInt(row.cash_income) || 0,
      withdrawal: parseInt(row.withdrawal) || 0,
      storeExpense: parseInt(row.store_expense) || 0,
      cashBalance: (parseInt(row.cash_income) || 0) - (parseInt(row.withdrawal) || 0) - (parseInt(row.store_expense) || 0)
    }))
  }

  // ==================== 審計日誌 ====================

  async createAuditLog(log: AuditLogInput): Promise<AuditLogRecord> {
    const result = await this.pool.query(
      `INSERT INTO audit_logs (user_id, username, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        log.user_id,
        log.username,
        log.action,
        log.resource_type,
        log.resource_id || null,
        log.details,
        log.ip_address || null,
        log.user_agent || null
      ]
    )
    return result.rows[0]
  }

  async getAllAuditLogs(limit: number = 100, offset: number = 0, action?: string, resourceType?: string): Promise<AuditLogRecord[]> {
    let whereConditions: string[] = []
    let params: any[] = []
    let paramCount = 1

    if (action) {
      whereConditions.push(`action = $${paramCount}`)
      params.push(action)
      paramCount++
    }

    if (resourceType) {
      whereConditions.push(`resource_type = $${paramCount}`)
      params.push(resourceType)
      paramCount++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    params.push(limit, offset)

    const result = await this.pool.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    )
    return result.rows
  }

  async getAuditLogsByUser(userId: number, limit: number = 50): Promise<AuditLogRecord[]> {
    const result = await this.pool.query(
      'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    )
    return result.rows
  }

  async getAuditLogsByResource(resourceType: string, resourceId?: string, limit: number = 50): Promise<AuditLogRecord[]> {
    if (resourceId) {
      const result = await this.pool.query(
        'SELECT * FROM audit_logs WHERE resource_type = $1 AND resource_id = $2 ORDER BY created_at DESC LIMIT $3',
        [resourceType, resourceId, limit]
      )
      return result.rows
    } else {
      const result = await this.pool.query(
        'SELECT * FROM audit_logs WHERE resource_type = $1 ORDER BY created_at DESC LIMIT $2',
        [resourceType, limit]
      )
      return result.rows
    }
  }

  // ==================== 客訂單操作 ====================

  async createCustomerOrder(order: CustomerOrderInput): Promise<CustomerOrderRecord> {
    const result = await this.pool.query(
      `INSERT INTO customer_orders (order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, store_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        order.order_date,
        order.products,
        order.customer_name,
        order.customer_phone,
        order.payment_status,
        order.logistics,
        order.remarks || null,
        order.amount || 0,
        order.store_id,
        order.created_by
      ]
    )
    return result.rows[0]
  }

  async getAllCustomerOrders(): Promise<CustomerOrderRecord[]> {
    const result = await this.pool.query(`
      SELECT co.*, s.name as store_name, s.code as store_code
      FROM customer_orders co
      LEFT JOIN stores s ON co.store_id = s.id
      WHERE co.status != '已刪除'
      ORDER BY co.created_at DESC
    `)
    return result.rows
  }

  async getCustomerOrderById(id: number): Promise<CustomerOrderRecord | null> {
    const result = await this.pool.query(`
      SELECT co.*, s.name as store_name, s.code as store_code
      FROM customer_orders co
      LEFT JOIN stores s ON co.store_id = s.id
      WHERE co.id = $1
    `, [id])
    return result.rows.length > 0 ? result.rows[0] : null
  }

  async getCustomerOrdersByStore(storeId: number): Promise<CustomerOrderRecord[]> {
    const result = await this.pool.query(`
      SELECT co.*, s.name as store_name, s.code as store_code
      FROM customer_orders co
      LEFT JOIN stores s ON co.store_id = s.id
      WHERE co.store_id = $1 AND co.status != '已刪除'
      ORDER BY co.created_at DESC
    `, [storeId])
    return result.rows
  }

  async getCustomerOrdersByStoreIds(storeIds: number[]): Promise<CustomerOrderRecord[]> {
    if (storeIds.length === 0) return []
    const placeholders = storeIds.map((_, i) => `$${i + 1}`).join(', ')
    const result = await this.pool.query(`
      SELECT co.*, s.name as store_name, s.code as store_code
      FROM customer_orders co
      LEFT JOIN stores s ON co.store_id = s.id
      WHERE co.store_id IN (${placeholders}) AND co.status != '已刪除'
      ORDER BY co.created_at DESC
    `, storeIds)
    return result.rows
  }

  async updateCustomerOrder(id: number, updates: Partial<CustomerOrderInput>): Promise<CustomerOrderRecord | null> {
    // 白名單驗證：只允許更新這些欄位
    const allowedFields = ['order_date', 'products', 'customer_name', 'customer_phone', 'payment_status', 'logistics', 'remarks', 'amount', 'store_id', 'status']
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const values: any[] = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    values.push(id)
    const result = await this.pool.query(
      `UPDATE customer_orders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    return result.rows.length > 0 ? result.rows[0] : null
  }

  async updateCustomerOrderStatus(id: number, status: '進行中' | '已完成' | '已刪除'): Promise<CustomerOrderRecord | null> {
    const result = await this.pool.query(
      `UPDATE customer_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    )
    return result.rows.length > 0 ? result.rows[0] : null
  }

  async deleteCustomerOrder(id: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE customer_orders SET status = '已刪除', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    )
    return (result.rowCount ?? 0) > 0
  }

  // ==================== 快取管理 ====================

  clearCache(key: string): void {
    this.cache.del(key)
  }

  clearAllCache(): void {
    this.cache.flushAll()
  }

  // ==================== 健康檢查 ====================

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded'
    details: {
      type: string
      totalPayments?: number
      totalUsers?: number
      totalStores?: number
      cacheHitRate?: number
    }
  }> {
    try {
      const stats = this.cache.getStats()
      const cacheHitRate = stats.hits + stats.misses > 0
        ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(1)
        : '0'

      const paymentsResult = await this.pool.query('SELECT COUNT(*) as count FROM payments')
      const usersResult = await this.pool.query('SELECT COUNT(*) as count FROM users')
      const storesResult = await this.pool.query('SELECT COUNT(*) as count FROM stores')

      return {
        status: 'healthy',
        details: {
          type: 'PostgreSQL',
          totalPayments: parseInt(paymentsResult.rows[0].count),
          totalUsers: parseInt(usersResult.rows[0].count),
          totalStores: parseInt(storesResult.rows[0].count),
          cacheHitRate: parseFloat(cacheHitRate)
        }
      }
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        status: 'unhealthy',
        details: { type: 'PostgreSQL' }
      }
    }
  }

  // ==================== 匯入用 Upsert 方法 ====================

  async createOrUpdateStore(store: {
    id: number
    name: string
    code: string
    address?: string
    phone?: string
    manager?: string
    is_active: boolean
  }): Promise<void> {
    await this.pool.query(`
      INSERT INTO stores (id, name, code, address, phone, manager, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        code = EXCLUDED.code,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        manager = EXCLUDED.manager,
        is_active = EXCLUDED.is_active
    `, [store.id, store.name, store.code, store.address || null, store.phone || null, store.manager || null, store.is_active])

    // 重置序列
    await this.pool.query(`SELECT setval('stores_id_seq', GREATEST((SELECT MAX(id) FROM stores), 1))`)
    this.cache.del('all_stores')
  }

  async createOrUpdateUser(user: {
    id: number
    username: string
    password_hash: string
    role: string
    permissions: string[]
    store_id: number | null
    accessible_stores: number[]
    is_active: boolean
  }): Promise<void> {
    await this.pool.query(`
      INSERT INTO users (id, username, password_hash, role, permissions, store_id, accessible_stores, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        store_id = EXCLUDED.store_id,
        accessible_stores = EXCLUDED.accessible_stores,
        is_active = EXCLUDED.is_active
    `, [
      user.id,
      user.username,
      user.password_hash,
      user.role,
      JSON.stringify(user.permissions),
      user.store_id,
      JSON.stringify(user.accessible_stores),
      user.is_active
    ])

    // 重置序列
    await this.pool.query(`SELECT setval('users_id_seq', GREATEST((SELECT MAX(id) FROM users), 1))`)
    this.cache.del(`user:${user.username}`)
  }

  async createOrUpdatePayment(payment: {
    uuid: string
    paid_at: string
    payment_method: string
    last_five: string | null
    amount: number
    note?: string
    status: string
    store_id: number
    processed_by?: string
    created_at: string
  }): Promise<void> {
    await this.pool.query(`
      INSERT INTO payments (uuid, paid_at, payment_method, last_five, amount, note, status, store_id, processed_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (uuid) DO UPDATE SET
        paid_at = EXCLUDED.paid_at,
        payment_method = EXCLUDED.payment_method,
        last_five = EXCLUDED.last_five,
        amount = EXCLUDED.amount,
        note = EXCLUDED.note,
        status = EXCLUDED.status,
        store_id = EXCLUDED.store_id,
        processed_by = EXCLUDED.processed_by
    `, [
      payment.uuid,
      payment.paid_at,
      payment.payment_method,
      payment.last_five,
      payment.amount,
      payment.note || null,
      payment.status,
      payment.store_id,
      payment.processed_by || null,
      payment.created_at
    ])
  }

  async createOrUpdateAuditLog(log: {
    id: number
    user_id: number | null
    username: string
    action: string
    resource_type: string
    resource_id: string | null
    details: string
    ip_address?: string
    user_agent?: string
    created_at: string
  }): Promise<void> {
    await this.pool.query(`
      INSERT INTO audit_logs (id, user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
    `, [
      log.id,
      log.user_id,
      log.username,
      log.action,
      log.resource_type,
      log.resource_id,
      log.details,
      log.ip_address || null,
      log.user_agent || null,
      log.created_at
    ])

    // 重置序列
    await this.pool.query(`SELECT setval('audit_logs_id_seq', GREATEST((SELECT MAX(id) FROM audit_logs), 1))`)
  }

  async createOrUpdateCustomerOrder(order: {
    id: number
    order_date: string
    products: string
    customer_name: string
    customer_phone: string
    payment_status: string
    logistics?: string
    remarks?: string
    amount: number
    status: string
    store_id: number
    created_by?: string
  }): Promise<void> {
    await this.pool.query(`
      INSERT INTO customer_orders (id, order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, status, store_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        order_date = EXCLUDED.order_date,
        products = EXCLUDED.products,
        customer_name = EXCLUDED.customer_name,
        customer_phone = EXCLUDED.customer_phone,
        payment_status = EXCLUDED.payment_status,
        logistics = EXCLUDED.logistics,
        remarks = EXCLUDED.remarks,
        amount = EXCLUDED.amount,
        status = EXCLUDED.status,
        store_id = EXCLUDED.store_id,
        created_by = EXCLUDED.created_by
    `, [
      order.id,
      order.order_date,
      order.products,
      order.customer_name,
      order.customer_phone,
      order.payment_status,
      order.logistics || null,
      order.remarks || null,
      order.amount,
      order.status,
      order.store_id,
      order.created_by || null
    ])

    // 重置序列
    await this.pool.query(`SELECT setval('customer_orders_id_seq', GREATEST((SELECT MAX(id) FROM customer_orders), 1))`)
  }

  // ==================== 清空數據 ====================

  async clearAllData(): Promise<{ payments: number; customer_orders: number; audit_logs: number }> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // 記錄刪除前的數量
      const paymentsCount = await client.query('SELECT COUNT(*) as count FROM payments')
      const ordersCount = await client.query('SELECT COUNT(*) as count FROM customer_orders')
      const logsCount = await client.query('SELECT COUNT(*) as count FROM audit_logs')

      // 刪除數據 (按外鍵依賴順序)
      await client.query('DELETE FROM audit_logs')
      await client.query('DELETE FROM customer_orders')
      await client.query('DELETE FROM payments')

      await client.query('COMMIT')

      // 清除緩存
      this.cache.flushAll()

      return {
        payments: parseInt(paymentsCount.rows[0].count),
        customer_orders: parseInt(ordersCount.rows[0].count),
        audit_logs: parseInt(logsCount.rows[0].count)
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // ==================== 關閉連線 ====================

  async close(): Promise<void> {
    await this.pool.end()
  }
}

// ==================== 匯出 ====================

export const db = new DatabaseManager()

export const initializeDatabase = async (): Promise<void> => {
  await db.initialize()

  // 創建或載入管理員用戶
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const existingAdmin = await db.getUserByUsername(adminUsername)

    if (!existingAdmin) {
      // 🔒 安全性改進：生產環境必須設定 ADMIN_PASSWORD
      const adminPassword = process.env.ADMIN_PASSWORD
      if (!adminPassword && process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_PASSWORD environment variable is required in production')
      }
      if (!adminPassword) {
        console.warn('⚠️  WARNING: Using default admin password. Set ADMIN_PASSWORD in production!')
      }
      const finalPassword = adminPassword || 'admin123'

      await db.createUser({
        username: adminUsername,
        password: finalPassword,
        role: 'admin',
        permissions: ['manage_users', 'manage_stores', 'view_payments', 'edit_payments', 'delete_payments', 'view_reports', 'system_admin']
      })
      console.log(`✅ Default admin user created: ${adminUsername}`)
      console.log(`ℹ️  Initial password: ${finalPassword.replace(/./g, '*')}`)
      console.log(`💡 Please change the password after first login via Admin Dashboard`)
      console.log(`💡 If you forget the password, use: npm run reset-password`)
    } else {
      console.log(`✅ Admin user loaded: ${adminUsername}`)

      const forceResetPassword = process.env.FORCE_RESET_ADMIN_PASSWORD === 'true'

      if (forceResetPassword) {
        const adminPassword = process.env.ADMIN_PASSWORD
        if (adminPassword) {
          await db.updateUser(existingAdmin.id, { password: adminPassword } as any)
          console.log(`⚠️  Admin password has been force reset from .env`)
          console.log(`⚠️  Remember to set FORCE_RESET_ADMIN_PASSWORD=false after restart`)
        }
      } else {
        console.log(`💡 Database password is the source of truth`)
        console.log(`💡 To reset password: npm run reset-password`)
        console.log(`💡 For emergency reset: set FORCE_RESET_ADMIN_PASSWORD=true in .env and restart`)
      }
    }
  } catch (error) {
    console.error('Error creating/loading admin user:', error)
    throw error
  }
}
