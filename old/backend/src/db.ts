import Database from 'better-sqlite3'
import { Client, Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import NodeCache from 'node-cache'

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
  accessible_stores?: number[] // 新增：可訪問的分店ID列表
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
  accessible_stores?: number[] // 新增：可訪問的分店ID列表
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
  status: '進行中' | '已完成'
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

class DatabaseManager {
  private sqliteDb?: Database.Database
  private pgPool?: Pool
  private usePostgres: boolean
  private cache: NodeCache

  constructor() {
    this.usePostgres = process.env.USE_PG === 'true'
    this.cache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL || '300'),  // 從環境變數讀取，預設 5 分鐘
      checkperiod: 60,       // 每分鐘檢查過期項目
      useClones: false       // 效能優化：不複製物件
    })
  }

  async initialize(): Promise<void> {
    if (this.usePostgres) {
      await this.initializePostgres()
    } else {
      this.initializeSQLite()
    }
  }

  private initializeSQLite(): void {
    // Use data directory in production for persistence
    const dbDir = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'data')
      : process.cwd()

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    const dbPath = path.join(dbDir, 'database.sqlite')
    this.sqliteDb = new Database(dbPath)

    // 創建分店表
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        manager TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 🚀 性能索引：分店表
      CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code);
      CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active);
    `)
    
    // 創建匯款記錄表
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        uuid TEXT PRIMARY KEY,
        paid_at TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        last_five TEXT,
        amount INTEGER NOT NULL,
        note TEXT,
        status TEXT DEFAULT '未確認',
        store_id INTEGER NOT NULL,
        processed_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id)
      );

      -- 🚀 性能索引：匯款記錄表（關鍵查詢優化）
      CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);
      CREATE INDEX IF NOT EXISTS idx_payments_store_id ON payments(store_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
      CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
      -- 複合索引（常見查詢組合）
      CREATE INDEX IF NOT EXISTS idx_payments_store_status ON payments(store_id, status);
      CREATE INDEX IF NOT EXISTS idx_payments_store_paid_at ON payments(store_id, paid_at DESC);
    `)
    
    // 創建用戶表
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        permissions TEXT NOT NULL DEFAULT '[]',
        store_id INTEGER,
        accessible_stores TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (store_id) REFERENCES stores(id)
      );

      -- 🚀 性能索引：用戶表
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    `)
    
    // 創建客訂單表
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS customer_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_date TEXT NOT NULL,
        products TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT '未付款',
        logistics TEXT NOT NULL,
        remarks TEXT,
        amount INTEGER,
        status TEXT NOT NULL DEFAULT '進行中',
        store_id INTEGER NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id)
      );

      -- 🚀 性能索引：客訂單表
      CREATE INDEX IF NOT EXISTS idx_customer_orders_store_id ON customer_orders(store_id);
      CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);
      CREATE INDEX IF NOT EXISTS idx_customer_orders_created_at ON customer_orders(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_customer_orders_order_date ON customer_orders(order_date DESC);
      CREATE INDEX IF NOT EXISTS idx_customer_orders_payment_status ON customer_orders(payment_status);
      -- 複合索引（常見查詢組合）
      CREATE INDEX IF NOT EXISTS idx_customer_orders_store_status ON customer_orders(store_id, status);
    `)
    
    // 創建審計日誌表
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- 🚀 性能索引：審計日誌表
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
    `)
    
    // 檢查並更新現有資料表結構
    this.updateExistingTables()
    
    // 初始化預設分店
    this.initializeDefaultStores()
  }
  
  private updateExistingTables(): void {
    if (!this.sqliteDb) return
    
    try {
      // 檢查 payments 表欄位
      const paymentColumns = this.sqliteDb.prepare("PRAGMA table_info(payments)").all()
      const hasStoreId = paymentColumns.some((col: any) => col.name === 'store_id')
      const hasPaymentMethod = paymentColumns.some((col: any) => col.name === 'payment_method')
      const hasAmount = paymentColumns.some((col: any) => col.name === 'amount')
      
      if (!hasStoreId) {
        // 添加 store_id 欄位，預設值為 1（假設第一個分店）
        this.sqliteDb.exec(`ALTER TABLE payments ADD COLUMN store_id INTEGER DEFAULT 1`)
        this.sqliteDb.exec(`ALTER TABLE payments ADD COLUMN processed_by TEXT`)
      }
      
      if (!hasPaymentMethod) {
        // 添加 payment_method 欄位，預設為匯款
        this.sqliteDb.exec(`ALTER TABLE payments ADD COLUMN payment_method TEXT DEFAULT '匯款'`)
      }
      
      if (!hasAmount) {
        // 添加 amount 欄位，預設為0（需要後續手動更新）
        this.sqliteDb.exec(`ALTER TABLE payments ADD COLUMN amount INTEGER DEFAULT 0`)
      }
      
      // 檢查 users 表是否需要添加 store_id 欄位
      const userColumns = this.sqliteDb.prepare("PRAGMA table_info(users)").all()
      const hasUserStoreId = userColumns.some((col: any) => col.name === 'store_id')
      
      if (!hasUserStoreId) {
        // 添加 store_id 欄位，預設值為 NULL（總部用戶）
        this.sqliteDb.exec(`ALTER TABLE users ADD COLUMN store_id INTEGER`)
      }
      
      // 檢查 users 表是否需要添加 accessible_stores 欄位
      const hasAccessibleStores = userColumns.some((col: any) => col.name === 'accessible_stores')
      
      if (!hasAccessibleStores) {
        // 添加 accessible_stores 欄位，預設值為空陣列
        this.sqliteDb.exec(`ALTER TABLE users ADD COLUMN accessible_stores TEXT DEFAULT '[]'`)
      }
      
      // 檢查 audit_logs 表的 user_id 欄位是否允許 NULL
      const auditLogTableInfo = this.sqliteDb.prepare("PRAGMA table_info(audit_logs)").all()
      const userIdColumn = auditLogTableInfo.find((col: any) => col.name === 'user_id') as any

      if (userIdColumn && userIdColumn.notnull === 1) {
        console.log('Updating audit_logs table to allow NULL user_id...')
        
        // 由於 SQLite 不支持直接修改列約束，需要重建表
        this.sqliteDb.exec(`
          -- 創建新的 audit_logs 表
          CREATE TABLE audit_logs_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            action TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_id TEXT,
            details TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
          
          -- 複製現有數據
          INSERT INTO audit_logs_new 
          SELECT * FROM audit_logs;
          
          -- 刪除舊表
          DROP TABLE audit_logs;
          
          -- 重命名新表
          ALTER TABLE audit_logs_new RENAME TO audit_logs;
        `)
        
        console.log('audit_logs table updated successfully')
      }
    } catch (error) {
      console.error('Error updating existing tables:', error)
    }
  }
  
  private initializeDefaultStores(): void {
    if (!this.sqliteDb) return
    
    try {
      // 檢查是否已有分店資料
      const storeCount = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM stores').get() as { count: number }
      
      if (storeCount.count === 0) {
        // 創建預設分店
        const defaultStores = [
          { name: '大安店', code: 'DA', address: '台北市大安區', manager: '店長A' },
          { name: '益民店', code: 'YM', address: '台中市北區益民路', manager: '店長B' },
          { name: '逢甲店', code: 'FC', address: '台中市西屯區逢甲路', manager: '店長C' },
          { name: '漢神店', code: 'HS', address: '高雄市前金區成功一路', manager: '店長D' }
        ]
        
        const insertStore = this.sqliteDb.prepare(`
          INSERT INTO stores (name, code, address, manager) VALUES (?, ?, ?, ?)
        `)
        
        for (const store of defaultStores) {
          insertStore.run(store.name, store.code, store.address, store.manager)
        }
        
        console.log('Default stores created successfully')
      }
    } catch (error) {
      console.error('Error initializing default stores:', error)
    }
  }

  private async initializePostgres(): Promise<void> {
    this.pgPool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT || '5432'),
      database: process.env.PG_DATABASE || 'payment_notifier',
      user: process.env.PG_USERNAME || 'postgres',
      password: process.env.PG_PASSWORD || 'password',
      max: 20,                    // 最大連接數
      idleTimeoutMillis: 30000,   // 閒置連接超時 (30秒)
      connectionTimeoutMillis: 2000, // 連接超時 (2秒)
    })

    // 測試連接
    try {
      const client = await this.pgPool.connect()
      console.log('✅ PostgreSQL connection pool initialized')
      client.release()
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error)
      throw error
    }

    // 創建分店表
    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        manager TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // 創建匯款記錄表
    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        uuid TEXT PRIMARY KEY,
        paid_at TIMESTAMP NOT NULL,
        payment_method TEXT NOT NULL,
        last_five TEXT,
        amount INTEGER NOT NULL,
        note TEXT,
        status TEXT DEFAULT '未確認',
        store_id INTEGER NOT NULL REFERENCES stores(id),
        processed_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // 創建用戶表
    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        permissions JSONB NOT NULL DEFAULT '[]',
        store_id INTEGER REFERENCES stores(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `)
    
    // 創建客訂單表
    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS customer_orders (
        id SERIAL PRIMARY KEY,
        order_date TEXT NOT NULL,
        products TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT '未付款',
        logistics TEXT NOT NULL,
        remarks TEXT,
        amount INTEGER,
        status TEXT NOT NULL DEFAULT '進行中',
        store_id INTEGER NOT NULL REFERENCES stores(id),
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // 創建審計日誌表
    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // 創建性能索引
    await this.createPerformanceIndexes()
    
    // 初始化預設分店
    await this.initializeDefaultStoresPostgres()
  }

  // 創建性能索引
  private async createPerformanceIndexes(): Promise<void> {
    if (!this.pgPool) return
    
    try {
      // payments 表的關鍵索引
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_payments_store_id ON payments(store_id)',
        'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
        'CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method)',
        'CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount DESC)',
        
        // 複合索引用於常見查詢
        'CREATE INDEX IF NOT EXISTS idx_payments_store_status ON payments(store_id, status)',
        'CREATE INDEX IF NOT EXISTS idx_payments_store_paid_at ON payments(store_id, paid_at DESC)',
        
        // users 表索引
        'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
        'CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id)',
        'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)',
        
        // audit_logs 表索引
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type)',
        
        // stores 表索引
        'CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code)',
        'CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active)',

        // customer_orders 表索引
        'CREATE INDEX IF NOT EXISTS idx_customer_orders_store_id ON customer_orders(store_id)',
        'CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status)',
        'CREATE INDEX IF NOT EXISTS idx_customer_orders_created_at ON customer_orders(created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_customer_orders_order_date ON customer_orders(order_date DESC)',
        'CREATE INDEX IF NOT EXISTS idx_customer_orders_payment_status ON customer_orders(payment_status)',
        'CREATE INDEX IF NOT EXISTS idx_customer_orders_store_status ON customer_orders(store_id, status)'
      ]
      
      for (const indexQuery of indexes) {
        await this.pgPool.query(indexQuery)
      }
      
      console.log('✅ Performance indexes created successfully')
    } catch (error) {
      console.error('Error creating performance indexes:', error)
    }
  }
  
  private async initializeDefaultStoresPostgres(): Promise<void> {
    if (!this.pgPool) return
    
    try {
      // 檢查是否已有分店資料
      const result = await this.pgPool.query('SELECT COUNT(*) as count FROM stores')
      const storeCount = parseInt(result.rows[0].count)
      
      if (storeCount === 0) {
        // 創建預設分店
        const defaultStores = [
          { name: '大安店', code: 'DA', address: '台北市大安區', manager: '店長A' },
          { name: '益民店', code: 'YM', address: '台中市北區益民路', manager: '店長B' },
          { name: '逢甲店', code: 'FC', address: '台中市西屯區逢甲路', manager: '店長C' },
          { name: '漢神店', code: 'HS', address: '高雄市前金區成功一路', manager: '店長D' }
        ]
        
        for (const store of defaultStores) {
          await this.pgPool.query(
            'INSERT INTO stores (name, code, address, manager) VALUES ($1, $2, $3, $4)',
            [store.name, store.code, store.address, store.manager]
          )
        }
        
        console.log('Default stores created successfully')
      }
    } catch (error) {
      console.error('Error initializing default stores:', error)
    }
  }

  async createPayment(payment: PaymentInput): Promise<PaymentRecord> {
    const uuid = uuidv4()
    const now = new Date().toISOString()
    
    const record: PaymentRecord = {
      uuid,
      paid_at: payment.paid_at,
      payment_method: payment.payment_method,
      last_five: payment.last_five || null,
      amount: payment.amount,
      note: payment.note || '',
      status: payment.status || '未確認',
      store_id: payment.store_id,
      processed_by: payment.processed_by,
      created_at: now
    }

    try {
      if (this.usePostgres && this.pgPool) {
        await this.pgPool.query(
          `INSERT INTO payments (uuid, paid_at, payment_method, last_five, amount, note, status, store_id, processed_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [record.uuid, record.paid_at, record.payment_method, record.last_five, record.amount, record.note, record.status, record.store_id, record.processed_by, record.created_at]
        )
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(
          `INSERT INTO payments (uuid, paid_at, payment_method, last_five, amount, note, status, store_id, processed_by, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        stmt.run(record.uuid, record.paid_at, record.payment_method, record.last_five, record.amount, record.note, record.status, record.store_id, record.processed_by, record.created_at)
      } else {
        throw new Error('資料庫未初始化')
      }

      return record
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  }

  /**
   * 取得所有付款記錄
   * @deprecated 此方法會載入所有記錄，請使用 getPaymentsPaginated() 代替
   * @see getPaymentsPaginated
   */
  async getAllPayments(): Promise<PaymentRecord[]> {
    console.warn('⚠️ getAllPayments() is deprecated. Use getPaymentsPaginated() instead.')

    if (this.usePostgres && this.pgPool) {
      // 限制最多返回 1000 筆
      const result = await this.pgPool.query(
        'SELECT * FROM payments ORDER BY paid_at DESC, created_at DESC LIMIT 1000'
      )
      return result.rows
    } else if (this.sqliteDb) {
      // 限制最多返回 1000 筆
      const stmt = this.sqliteDb.prepare(
        'SELECT * FROM payments ORDER BY paid_at DESC, created_at DESC LIMIT 1000'
      )
      return stmt.all() as PaymentRecord[]
    }
    return []
  }

  // 分頁查詢付款記錄
  async getPaymentsPaginated(
    offset: number = 0, 
    limit: number = 50, 
    filters?: {
      store_id?: number
      store_ids?: number[]
      status?: string
      payment_method?: string
      payment_methods?: string[]
      start_date?: string
      end_date?: string
      search?: string
    }
  ): Promise<{ payments: PaymentRecord[], total: number }> {
    try {
      let baseQuery = 'FROM payments p LEFT JOIN stores s ON p.store_id = s.id'
      let countQuery = 'SELECT COUNT(*) as total ' + baseQuery
      let selectQuery = 'SELECT p.*, s.name as store_name, s.code as store_code ' + baseQuery
      
      const params: any[] = []
      const whereConditions: string[] = []
      let paramIndex = 1

      // 構建 WHERE 條件
      // 分店过滤（单选）
      if (filters?.store_id) {
        whereConditions.push(`p.store_id = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        params.push(filters.store_id)
      }
      
      // 分店过滤（多选）
      if (filters?.store_ids && filters.store_ids.length > 0) {
        const placeholders = filters.store_ids.map(() => this.usePostgres ? `$${paramIndex++}` : '?').join(', ')
        whereConditions.push(`p.store_id IN (${placeholders})`)
        params.push(...filters.store_ids)
      }
      
      if (filters?.status) {
        whereConditions.push(`p.status = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        params.push(filters.status)
      }
      
      // 付款方式过滤（单选）
      if (filters?.payment_method) {
        whereConditions.push(`p.payment_method = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        params.push(filters.payment_method)
      }
      
      // 付款方式过滤（多选）
      if (filters?.payment_methods && filters.payment_methods.length > 0) {
        const placeholders = filters.payment_methods.map(() => this.usePostgres ? `$${paramIndex++}` : '?').join(', ')
        whereConditions.push(`p.payment_method IN (${placeholders})`)
        params.push(...filters.payment_methods)
      }
      
      if (filters?.start_date) {
        // 處理開始日期：使用台北時間 (UTC+8) 轉換為當天 00:00:00
        const startDate = new Date(`${filters.start_date}T00:00:00.000+08:00`)
        whereConditions.push(`p.paid_at >= ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        params.push(startDate.toISOString())
      }
      
      if (filters?.end_date) {
        // 處理結束日期：使用台北時間 (UTC+8) 轉換為當天 23:59:59
        const endDate = new Date(`${filters.end_date}T23:59:59.999+08:00`)
        whereConditions.push(`p.paid_at <= ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        params.push(endDate.toISOString())
      }
      
      if (filters?.search) {
        const searchPattern = `%${filters.search}%`
        if (this.usePostgres) {
          whereConditions.push(`(p.last_five ILIKE $${paramIndex++} OR p.note ILIKE $${paramIndex++} OR p.uuid ILIKE $${paramIndex++})`)
          params.push(searchPattern, searchPattern, searchPattern)
        } else {
          whereConditions.push('(p.last_five LIKE ? OR p.note LIKE ? OR p.uuid LIKE ?)')
          params.push(searchPattern, searchPattern, searchPattern)
        }
      }

      // 添加 WHERE 子句
      if (whereConditions.length > 0) {
        const whereClause = ' WHERE ' + whereConditions.join(' AND ')
        countQuery += whereClause
        selectQuery += whereClause
      }

      // 執行查詢
      let payments: PaymentRecord[] = []
      let total = 0

      if (this.usePostgres && this.pgPool) {
        // 使用 CTE (Common Table Expression) 一次完成計數和查詢
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''
        const cteQuery = `
          WITH counted_payments AS (
            SELECT
              COUNT(*) OVER() as total_count,
              p.*,
              s.name as store_name,
              s.code as store_code
            FROM payments p
            LEFT JOIN stores s ON p.store_id = s.id
            ${whereClause}
          )
          SELECT * FROM counted_payments
          ORDER BY paid_at DESC, created_at DESC
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `

        params.push(limit, offset)
        const result = await this.pgPool.query(cteQuery, params)
        payments = result.rows

        // 從第一筆記錄取得總數（如果有的話）
        total = (result.rows[0] as any)?.total_count || 0

        // 移除 total_count 欄位
        payments = payments.map((p: any) => {
          const { total_count, ...rest } = p
          return rest as PaymentRecord
        })
      } else if (this.sqliteDb) {
        // SQLite 保持原樣（兩次查詢）
        const countStmt = this.sqliteDb.prepare(countQuery)
        const countResult = countStmt.get(...params) as { total: number }
        total = countResult.total

        selectQuery += ' ORDER BY p.paid_at DESC, p.created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)

        const stmt = this.sqliteDb.prepare(selectQuery)
        payments = stmt.all(...params) as PaymentRecord[]
      }

      return { payments, total }
    } catch (error) {
      console.error('Error in getPaymentsPaginated:', error)
      throw error
    }
  }

  async getPaymentByUuid(uuid: string): Promise<PaymentRecord | null> {
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query('SELECT * FROM payments WHERE uuid = $1', [uuid])
      return result.rows[0] || null
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('SELECT * FROM payments WHERE uuid = ?')
      return stmt.get(uuid) as PaymentRecord || null
    }
    return null
  }

  // ⚡ 效能優化：批量查詢多個UUID，避免N+1問題
  async getPaymentsByUuids(uuids: string[]): Promise<PaymentRecord[]> {
    if (uuids.length === 0) return []

    try {
      if (this.usePostgres && this.pgPool) {
        const placeholders = uuids.map((_, index) => `$${index + 1}`).join(', ')
        const result = await this.pgPool.query(
          `SELECT * FROM payments WHERE uuid IN (${placeholders})`,
          uuids
        )
        return result.rows
      } else if (this.sqliteDb) {
        const placeholders = uuids.map(() => '?').join(', ')
        const stmt = this.sqliteDb.prepare(`SELECT * FROM payments WHERE uuid IN (${placeholders})`)
        return stmt.all(...uuids) as PaymentRecord[]
      }
      return []
    } catch (error) {
      console.error('Error in getPaymentsByUuids:', error)
      throw error
    }
  }

  async updatePayment(uuid: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
    const fields = Object.keys(updates).filter(key => key !== 'uuid' && key !== 'created_at')
    const values = fields.map(field => updates[field as keyof PaymentRecord])
    
    if (fields.length === 0) return null

    if (this.usePostgres && this.pgPool) {
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')
      await this.pgPool.query(
        `UPDATE payments SET ${setClause} WHERE uuid = $${fields.length + 1}`,
        [...values, uuid]
      )
    } else if (this.sqliteDb) {
      const setClause = fields.map(field => `${field} = ?`).join(', ')
      const stmt = this.sqliteDb.prepare(`UPDATE payments SET ${setClause} WHERE uuid = ?`)
      stmt.run(...values, uuid)
    }

    return this.getPaymentByUuid(uuid)
  }

  async deletePayment(uuid: string): Promise<boolean> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query('DELETE FROM payments WHERE uuid = $1', [uuid])
        return result.rowCount !== null && result.rowCount > 0
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare('DELETE FROM payments WHERE uuid = ?')
        const result = stmt.run(uuid)
        return result.changes > 0
      }
      return false
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  }

  // 🔒 交易保護：批量刪除使用交易確保資料一致性
  async batchDeletePayments(uuids: string[]): Promise<number> {
    try {
      if (uuids.length === 0) return 0

      if (this.usePostgres && this.pgPool) {
        // PostgreSQL 交易處理
        await this.pgPool.query('BEGIN')

        try {
          const placeholders = uuids.map((_, index) => `$${index + 1}`).join(', ')
          const result = await this.pgPool.query(
            `DELETE FROM payments WHERE uuid IN (${placeholders})`,
            uuids
          )

          await this.pgPool.query('COMMIT')
          return result.rowCount || 0
        } catch (error) {
          await this.pgPool.query('ROLLBACK')
          throw error
        }
      } else if (this.sqliteDb) {
        // SQLite 交易處理
        this.sqliteDb.exec('BEGIN')

        try {
          const placeholders = uuids.map(() => '?').join(', ')
          const stmt = this.sqliteDb.prepare(`DELETE FROM payments WHERE uuid IN (${placeholders})`)
          const result = stmt.run(...uuids)

          this.sqliteDb.exec('COMMIT')
          return result.changes
        } catch (error) {
          this.sqliteDb.exec('ROLLBACK')
          throw error
        }
      }
      return 0
    } catch (error) {
      console.error('Error batch deleting payments:', error)
      throw error
    }
  }

  // 用戶管理方法
  async createUser(user: UserInput): Promise<UserRecord> {
    const passwordHash = await bcrypt.hash(user.password, 10)
    const now = new Date().toISOString()
    const permissions = JSON.stringify(user.permissions || [])
    const accessibleStores = JSON.stringify(user.accessible_stores || [])
    
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query(
        `INSERT INTO users (username, password_hash, role, permissions, store_id, accessible_stores, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [user.username, passwordHash, user.role, permissions, user.store_id, accessibleStores, now, now]
      )
      const row = result.rows[0]
      return {
        ...row,
        permissions: JSON.parse(row.permissions),
        accessible_stores: JSON.parse(row.accessible_stores || '[]'),
        is_active: Boolean(row.is_active) // 轉換 SQLite 的 0/1 為布林值
      }
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare(
        `INSERT INTO users (username, password_hash, role, permissions, store_id, accessible_stores, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      const result = stmt.run(user.username, passwordHash, user.role, permissions, user.store_id, accessibleStores, now, now)
      
      return {
        id: result.lastInsertRowid as number,
        username: user.username,
        password_hash: passwordHash,
        role: user.role,
        permissions: user.permissions || [],
        store_id: user.store_id || null,
        accessible_stores: user.accessible_stores || [],
        created_at: now,
        updated_at: now,
        is_active: true
      }
    }
    throw new Error('資料庫未初始化')
  }

  async getAllUsers(): Promise<UserRecord[]> {
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query('SELECT * FROM users ORDER BY created_at DESC')
      return result.rows.map(row => ({
        ...row,
        permissions: JSON.parse(row.permissions),
        accessible_stores: JSON.parse(row.accessible_stores || '[]')
      }))
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('SELECT * FROM users ORDER BY created_at DESC')
      const rows = stmt.all() as any[]
      return rows.map(row => ({
        ...row,
        permissions: JSON.parse(row.permissions),
        accessible_stores: JSON.parse(row.accessible_stores || '[]'),
        is_active: Boolean(row.is_active) // 轉換 SQLite 的 0/1 為布林值
      }))
    }
    return []
  }

  async getUserById(id: number): Promise<UserRecord | null> {
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query('SELECT * FROM users WHERE id = $1', [id])
      const row = result.rows[0]
      if (!row) return null
      return {
        ...row,
        permissions: JSON.parse(row.permissions),
        accessible_stores: JSON.parse(row.accessible_stores || '[]'),
        is_active: Boolean(row.is_active) // 轉換 SQLite 的 0/1 為布林值
      }
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('SELECT * FROM users WHERE id = ?')
      const row = stmt.get(id) as any
      if (!row) return null
      return {
        ...row,
        permissions: JSON.parse(row.permissions),
        accessible_stores: JSON.parse(row.accessible_stores || '[]'),
        is_active: Boolean(row.is_active) // 轉換 SQLite 的 0/1 為布林值
      }
    }
    return null
  }

  async getUserByUsername(username: string): Promise<UserRecord | null> {
    const cacheKey = `user:${username}`
    const cached = this.cache.get<UserRecord>(cacheKey)
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`)
      return cached
    }

    console.log(`❌ Cache miss: ${cacheKey}`)

    let user: UserRecord | null = null
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query('SELECT * FROM users WHERE username = $1', [username])
      const row = result.rows[0]
      if (row) {
        user = {
          ...row,
          permissions: JSON.parse(row.permissions),
          accessible_stores: JSON.parse(row.accessible_stores || '[]'),
          is_active: Boolean(row.is_active)
        }
      }
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('SELECT * FROM users WHERE username = ?')
      const row = stmt.get(username) as any
      if (row) {
        user = {
          ...row,
          permissions: JSON.parse(row.permissions),
          accessible_stores: JSON.parse(row.accessible_stores || '[]'),
          is_active: Boolean(row.is_active)
        }
      }
    }

    if (user) {
      // 快取 5 分鐘
      this.cache.set(cacheKey, user, 300)
    }

    return user
  }

  async updateUser(id: number, updates: Partial<UserInput & { is_active: boolean; password_hash?: string }>): Promise<UserRecord | null> {
    try {
      console.log('Updating user:', id, 'with updates:', updates)

      // 獲取用戶資訊以清除快取
      const existingUser = await this.getUserById(id)
      if (existingUser) {
        this.invalidateUserCache(existingUser.username)
      }

      const now = new Date().toISOString()
      const fieldsToUpdate: any = { updated_at: now }
      
      if (updates.username) fieldsToUpdate.username = updates.username
      if (updates.password_hash) {
        fieldsToUpdate.password_hash = updates.password_hash
      } else if (updates.password && updates.password.trim() !== '') {
        fieldsToUpdate.password_hash = await bcrypt.hash(updates.password, 10)
      }
      if (updates.role) fieldsToUpdate.role = updates.role
      if (updates.permissions) fieldsToUpdate.permissions = JSON.stringify(updates.permissions)
      if (updates.store_id !== undefined) fieldsToUpdate.store_id = updates.store_id
      if (updates.accessible_stores !== undefined) fieldsToUpdate.accessible_stores = JSON.stringify(updates.accessible_stores)
      if (updates.is_active !== undefined) {
        // SQLite 使用 0/1 來表示布林值
        fieldsToUpdate.is_active = this.usePostgres ? updates.is_active : (updates.is_active ? 1 : 0)
      }
      
      const fields = Object.keys(fieldsToUpdate)
      const values = fields.map(field => fieldsToUpdate[field])
      
      console.log('Fields to update:', fields)
      console.log('Values:', values)
      
      if (fields.length === 0) return null

      if (this.usePostgres && this.pgPool) {
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')
        const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`
        console.log('PostgreSQL query:', query)
        await this.pgPool.query(query, [...values, id])
      } else if (this.sqliteDb) {
        const setClause = fields.map(field => `${field} = ?`).join(', ')
        const query = `UPDATE users SET ${setClause} WHERE id = ?`
        console.log('SQLite query:', query)
        const stmt = this.sqliteDb.prepare(query)
        const result = stmt.run(...values, id)
        console.log('SQLite update result:', result)
      }

      const updatedUser = await this.getUserById(id)
      console.log('Updated user retrieved:', updatedUser ? 'Success' : 'Failed')
      return updatedUser
    } catch (error) {
      console.error('Error in updateUser:', error)
      throw error
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // 獲取用戶資訊以清除快取
      const existingUser = await this.getUserById(id)

      if (this.usePostgres && this.pgPool) {
        // 開始事務
        await this.pgPool.query('BEGIN')

        try {
          // 首先處理相關的審計日誌 - 將 user_id 設為 NULL 而不是刪除日誌
          await this.pgPool.query('UPDATE audit_logs SET user_id = NULL WHERE user_id = $1', [id])

          // 然後刪除用戶
          const result = await this.pgPool.query('DELETE FROM users WHERE id = $1', [id])

          // 提交事務
          await this.pgPool.query('COMMIT')

          // 清除快取
          if (existingUser) {
            this.invalidateUserCache(existingUser.username)
          }

          return result.rowCount !== null && result.rowCount > 0
        } catch (error) {
          // 回滾事務
          await this.pgPool.query('ROLLBACK')
          throw error
        }
      } else if (this.sqliteDb) {
        // SQLite 事務處理
        this.sqliteDb.exec('BEGIN')

        try {
          // 首先處理相關的審計日誌 - 將 user_id 設為 NULL
          const updateStmt = this.sqliteDb.prepare('UPDATE audit_logs SET user_id = NULL WHERE user_id = ?')
          updateStmt.run(id)

          // 然後刪除用戶
          const deleteStmt = this.sqliteDb.prepare('DELETE FROM users WHERE id = ?')
          const result = deleteStmt.run(id)

          // 提交事務
          this.sqliteDb.exec('COMMIT')

          // 清除快取
          if (existingUser) {
            this.invalidateUserCache(existingUser.username)
          }

          return result.changes > 0
        } catch (error) {
          // 回滾事務
          this.sqliteDb.exec('ROLLBACK')
          throw error
        }
      }
      return false
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // 清除特定快取
  clearCache(key: string): void {
    this.cache.del(key)
  }

  // 清除所有快取
  clearAllCache(): void {
    this.cache.flushAll()
    console.log('🗑️ All cache cleared')
  }

  // 當分店資料更新時清除快取
  private invalidateStoreCache(): void {
    this.cache.del('all_stores')
  }

  // 當用戶資料更新時清除快取
  private invalidateUserCache(username: string): void {
    this.cache.del(`user:${username}`)
  }

  // 快取統計
  private getCacheStats(): { hitRate: number, keys: number } {
    const stats = this.cache.getStats()
    const hitRate = stats.hits / (stats.hits + stats.misses) * 100 || 0
    return {
      hitRate: parseFloat(hitRate.toFixed(2)),
      keys: this.cache.keys().length
    }
  }

  // 資料庫健康檢查
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded',
    details: {
      type: string
      totalPayments?: number
      totalUsers?: number
      totalStores?: number
      cacheHitRate?: number
      dbSize?: string
    }
  }> {
    try {
      if (this.sqliteDb) {
        const paymentCount = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM payments').get() as { count: number }
        const userCount = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
        const storeCount = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM stores').get() as { count: number }

        const dbPath = 'database.sqlite'
        const dbSize = fs.existsSync(dbPath)
          ? (fs.statSync(dbPath).size / 1024 / 1024).toFixed(2) + ' MB'
          : 'unknown'

        return {
          status: 'healthy',
          details: {
            type: 'SQLite',
            totalPayments: paymentCount.count,
            totalUsers: userCount.count,
            totalStores: storeCount.count,
            cacheHitRate: this.getCacheStats().hitRate,
            dbSize
          }
        }
      } else if (this.pgPool) {
        const result = await this.pgPool.query('SELECT 1')
        const paymentCount = await this.pgPool.query('SELECT COUNT(*) as count FROM payments')
        const userCount = await this.pgPool.query('SELECT COUNT(*) as count FROM users')
        const storeCount = await this.pgPool.query('SELECT COUNT(*) as count FROM stores')

        return {
          status: 'healthy',
          details: {
            type: 'PostgreSQL',
            totalPayments: parseInt(paymentCount.rows[0].count),
            totalUsers: parseInt(userCount.rows[0].count),
            totalStores: parseInt(storeCount.rows[0].count),
            cacheHitRate: this.getCacheStats().hitRate
          }
        }
      }

      return {
        status: 'unhealthy',
        details: {
          type: 'unknown'
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          type: 'error',
        }
      }
    }
  }

  async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end()
      console.log('✅ PostgreSQL connection pool closed')
    }
    if (this.sqliteDb) {
      this.sqliteDb.close()
      console.log('✅ SQLite database closed')
    }
  }

  // 分店管理相關方法
  async getAllStores(): Promise<StoreRecord[]> {
    const cacheKey = 'all_stores'
    const cached = this.cache.get<StoreRecord[]>(cacheKey)
    if (cached) {
      console.log('✅ Cache hit: all_stores')
      return cached
    }

    console.log('❌ Cache miss: all_stores')

    let stores: StoreRecord[] = []
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query('SELECT * FROM stores ORDER BY name')
      stores = result.rows
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('SELECT * FROM stores ORDER BY name')
      stores = stmt.all() as StoreRecord[]
    } else {
      throw new Error('資料庫未初始化')
    }

    // 快取 10 分鐘（分店資料很少變動）
    this.cache.set(cacheKey, stores, 600)
    return stores
  }

  async getStoreById(id: number): Promise<StoreRecord | null> {
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query('SELECT * FROM stores WHERE id = $1', [id])
      return result.rows[0] || null
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('SELECT * FROM stores WHERE id = ?')
      return stmt.get(id) as StoreRecord || null
    } else {
      throw new Error('資料庫未初始化')
    }
  }

  async createStore(store: StoreInput): Promise<StoreRecord> {
    const now = new Date().toISOString()

    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(
          `INSERT INTO stores (name, code, address, phone, manager)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [store.name, store.code, store.address, store.phone, store.manager]
        )
        this.invalidateStoreCache()
        return result.rows[0]
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(
          `INSERT INTO stores (name, code, address, phone, manager)
           VALUES (?, ?, ?, ?, ?)`
        )
        const result = stmt.run(store.name, store.code, store.address, store.phone, store.manager)

        // 返回創建的記錄
        const getStmt = this.sqliteDb.prepare('SELECT * FROM stores WHERE id = ?')
        const newStore = getStmt.get(result.lastInsertRowid) as StoreRecord
        this.invalidateStoreCache()
        return newStore
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error creating store:', error)
      throw error
    }
  }

  async updateStore(id: number, updates: Partial<StoreInput>): Promise<StoreRecord | null> {
    const now = new Date().toISOString()

    try {
      if (this.usePostgres && this.pgPool) {
        const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
        const values = [id, ...Object.values(updates)]

        const result = await this.pgPool.query(
          `UPDATE stores SET ${setClause} WHERE id = $1 RETURNING *`,
          values
        )
        this.invalidateStoreCache()
        return result.rows[0] || null
      } else if (this.sqliteDb) {
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
        const values = [...Object.values(updates), id]

        const stmt = this.sqliteDb.prepare(`UPDATE stores SET ${setClause} WHERE id = ?`)
        stmt.run(...values)

        // 返回更新後的記錄
        const getStmt = this.sqliteDb.prepare('SELECT * FROM stores WHERE id = ?')
        const updatedStore = getStmt.get(id) as StoreRecord || null
        this.invalidateStoreCache()
        return updatedStore
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error updating store:', error)
      throw error
    }
  }

  async deleteStore(id: number): Promise<boolean> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query('DELETE FROM stores WHERE id = $1', [id])
        this.invalidateStoreCache()
        return (result.rowCount || 0) > 0
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare('DELETE FROM stores WHERE id = ?')
        const result = stmt.run(id)
        this.invalidateStoreCache()
        return result.changes > 0
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error deleting store:', error)
      throw error
    }
  }

  // 根據分店獲取匯款記錄
  async getPaymentsByStore(storeId: number): Promise<PaymentRecord[]> {
    if (this.usePostgres && this.pgPool) {
      const result = await this.pgPool.query(
        'SELECT * FROM payments WHERE store_id = $1 ORDER BY paid_at DESC', 
        [storeId]
      )
      return result.rows
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('SELECT * FROM payments WHERE store_id = ? ORDER BY paid_at DESC')
      return stmt.all(storeId) as PaymentRecord[]
    } else {
      throw new Error('資料庫未初始化')
    }
  }

  // 根據用戶權限獲取可訪問的匯款記錄
  async getAccessiblePayments(user: UserRecord): Promise<PaymentRecord[]> {
    // 管理員可以看到所有記錄
    if (user.role === 'admin') {
      return this.getAllPayments()
    }

    // 用戶可以看到指定分店的記錄（使用 SQL IN 查詢）
    if (user.accessible_stores && user.accessible_stores.length > 0) {
      if (this.usePostgres && this.pgPool) {
        const placeholders = user.accessible_stores.map((_, i) => `$${i + 1}`).join(', ')
        const result = await this.pgPool.query(
          `SELECT p.*, s.name as store_name, s.code as store_code
           FROM payments p
           LEFT JOIN stores s ON p.store_id = s.id
           WHERE p.store_id IN (${placeholders})
           ORDER BY p.paid_at DESC, p.created_at DESC`,
          user.accessible_stores
        )
        return result.rows
      } else if (this.sqliteDb) {
        const placeholders = user.accessible_stores.map(() => '?').join(', ')
        const stmt = this.sqliteDb.prepare(
          `SELECT p.*, s.name as store_name, s.code as store_code
           FROM payments p
           LEFT JOIN stores s ON p.store_id = s.id
           WHERE p.store_id IN (${placeholders})
           ORDER BY p.paid_at DESC, p.created_at DESC`
        )
        return stmt.all(...user.accessible_stores) as PaymentRecord[]
      }
    }

    // 如果用戶沒有可訪問分店列表，則無法訪問任何記錄
    return []
  }

  // 檢查用戶是否可以訪問指定分店
  canAccessStore(user: UserRecord, storeId: number): boolean {
    // 管理員可以訪問所有分店
    if (user.role === 'admin') {
      return true
    }
    
    // 檢查是否在可訪問的分店列表中
    if (user.accessible_stores && user.accessible_stores.length > 0) {
      return user.accessible_stores.includes(storeId)
    }
    
    // 如果用戶沒有可訪問分店列表，則無法訪問任何分店
    return false
  }

  // 審計日誌相關方法
  async createAuditLog(log: AuditLogInput): Promise<AuditLogRecord> {
    const now = new Date().toISOString()
    
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(
          `INSERT INTO audit_logs (user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [log.user_id, log.username, log.action, log.resource_type, log.resource_id, log.details, log.ip_address, log.user_agent, now]
        )
        return result.rows[0]
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(
          `INSERT INTO audit_logs (user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        const result = stmt.run(log.user_id, log.username, log.action, log.resource_type, log.resource_id, log.details, log.ip_address, log.user_agent, now)
        
        // 返回創建的記錄
        const getStmt = this.sqliteDb.prepare('SELECT * FROM audit_logs WHERE id = ?')
        return getStmt.get(result.lastInsertRowid) as AuditLogRecord
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error creating audit log:', error)
      throw error
    }
  }

  async getAllAuditLogs(limit: number = 100, offset: number = 0, action?: string, resourceType?: string): Promise<AuditLogRecord[]> {
    try {
      if (this.usePostgres && this.pgPool) {
        let query = 'SELECT * FROM audit_logs WHERE 1=1'
        const params: any[] = []
        let paramIndex = 1
        
        if (action) {
          query += ` AND action = $${paramIndex++}`
          params.push(action)
        }
        
        if (resourceType) {
          query += ` AND resource_type = $${paramIndex++}`
          params.push(resourceType)
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
        params.push(limit, offset)
        
        const result = await this.pgPool.query(query, params)
        return result.rows
      } else if (this.sqliteDb) {
        let query = 'SELECT * FROM audit_logs WHERE 1=1'
        const params: any[] = []
        
        if (action) {
          query += ' AND action = ?'
          params.push(action)
        }
        
        if (resourceType) {
          query += ' AND resource_type = ?'
          params.push(resourceType)
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)
        
        const stmt = this.sqliteDb.prepare(query)
        return stmt.all(...params) as AuditLogRecord[]
      }
      return []
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  }

  async getAuditLogsByUser(userId: number, limit: number = 50): Promise<AuditLogRecord[]> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(
          'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
          [userId, limit]
        )
        return result.rows
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
        return stmt.all(userId, limit) as AuditLogRecord[]
      }
      return []
    } catch (error) {
      console.error('Error fetching user audit logs:', error)
      throw error
    }
  }

  async getAuditLogsByResource(resourceType: string, resourceId?: string, limit: number = 50): Promise<AuditLogRecord[]> {
    try {
      if (this.usePostgres && this.pgPool) {
        if (resourceId) {
          const result = await this.pgPool.query(
            'SELECT * FROM audit_logs WHERE resource_type = $1 AND resource_id = $2 ORDER BY created_at DESC LIMIT $3',
            [resourceType, resourceId, limit]
          )
          return result.rows
        } else {
          const result = await this.pgPool.query(
            'SELECT * FROM audit_logs WHERE resource_type = $1 ORDER BY created_at DESC LIMIT $2',
            [resourceType, limit]
          )
          return result.rows
        }
      } else if (this.sqliteDb) {
        if (resourceId) {
          const stmt = this.sqliteDb.prepare('SELECT * FROM audit_logs WHERE resource_type = ? AND resource_id = ? ORDER BY created_at DESC LIMIT ?')
          return stmt.all(resourceType, resourceId, limit) as AuditLogRecord[]
        } else {
          const stmt = this.sqliteDb.prepare('SELECT * FROM audit_logs WHERE resource_type = ? ORDER BY created_at DESC LIMIT ?')
          return stmt.all(resourceType, limit) as AuditLogRecord[]
        }
      }
      return []
    } catch (error) {
      console.error('Error fetching resource audit logs:', error)
      throw error
    }
  }

  // ==================== 客訂單 CRUD 方法 ====================

  async createCustomerOrder(order: CustomerOrderInput): Promise<CustomerOrderRecord> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(
          `INSERT INTO customer_orders (order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, store_id, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [order.order_date, order.products, order.customer_name, order.customer_phone, order.payment_status, order.logistics, order.remarks, order.amount, order.store_id, order.created_by]
        )
        return result.rows[0]
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(`
          INSERT INTO customer_orders (order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, store_id, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        const result = stmt.run(order.order_date, order.products, order.customer_name, order.customer_phone, order.payment_status, order.logistics, order.remarks, order.amount, order.store_id, order.created_by)

        const getStmt = this.sqliteDb.prepare(`
          SELECT co.*, s.name as store_name, s.code as store_code
          FROM customer_orders co
          LEFT JOIN stores s ON co.store_id = s.id
          WHERE co.id = ?
        `)
        return getStmt.get(result.lastInsertRowid) as CustomerOrderRecord
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error creating customer order:', error)
      throw error
    }
  }

  async getAllCustomerOrders(): Promise<CustomerOrderRecord[]> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(`
          SELECT co.*, s.name as store_name, s.code as store_code
          FROM customer_orders co
          LEFT JOIN stores s ON co.store_id = s.id
          WHERE co.status != '已刪除'
          ORDER BY co.created_at DESC
        `)
        return result.rows
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(`
          SELECT co.*, s.name as store_name, s.code as store_code
          FROM customer_orders co
          LEFT JOIN stores s ON co.store_id = s.id
          WHERE co.status != '已刪除'
          ORDER BY co.created_at DESC
        `)
        return stmt.all() as CustomerOrderRecord[]
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      throw error
    }
  }

  async getCustomerOrderById(id: number): Promise<CustomerOrderRecord | null> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(`
          SELECT co.*, s.name as store_name, s.code as store_code
          FROM customer_orders co
          LEFT JOIN stores s ON co.store_id = s.id
          WHERE co.id = $1
        `, [id])
        return result.rows[0] || null
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(`
          SELECT co.*, s.name as store_name, s.code as store_code
          FROM customer_orders co
          LEFT JOIN stores s ON co.store_id = s.id
          WHERE co.id = ?
        `)
        return stmt.get(id) as CustomerOrderRecord | null
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error fetching customer order:', error)
      throw error
    }
  }

  async updateCustomerOrder(id: number, updates: Partial<CustomerOrderInput>): Promise<CustomerOrderRecord | null> {
    try {
      const updateFields = []
      const values = []
      let paramIndex = 1

      if (updates.order_date !== undefined) {
        updateFields.push(`order_date = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.order_date)
      }
      if (updates.products !== undefined) {
        updateFields.push(`products = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.products)
      }
      if (updates.customer_name !== undefined) {
        updateFields.push(`customer_name = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.customer_name)
      }
      if (updates.customer_phone !== undefined) {
        updateFields.push(`customer_phone = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.customer_phone)
      }
      if (updates.payment_status !== undefined) {
        updateFields.push(`payment_status = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.payment_status)
      }
      if (updates.logistics !== undefined) {
        updateFields.push(`logistics = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.logistics)
      }
      if (updates.remarks !== undefined) {
        updateFields.push(`remarks = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.remarks)
      }
      if (updates.amount !== undefined) {
        updateFields.push(`amount = ${this.usePostgres ? `$${paramIndex++}` : '?'}`)
        values.push(updates.amount)
      }

      if (updateFields.length === 0) {
        return this.getCustomerOrderById(id)
      }

      updateFields.push(`updated_at = ${this.usePostgres ? 'CURRENT_TIMESTAMP' : 'CURRENT_TIMESTAMP'}`)
      values.push(id)

      if (this.usePostgres && this.pgPool) {
        const query = `UPDATE customer_orders SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
        const result = await this.pgPool.query(query, values)
        return result.rows[0] || null
      } else if (this.sqliteDb) {
        const query = `UPDATE customer_orders SET ${updateFields.join(', ')} WHERE id = ?`
        const stmt = this.sqliteDb.prepare(query)
        stmt.run(...values)
        return this.getCustomerOrderById(id)
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error updating customer order:', error)
      throw error
    }
  }

  async updateCustomerOrderStatus(id: number, status: '進行中' | '已完成'): Promise<CustomerOrderRecord | null> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(
          `UPDATE customer_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
          [status, id]
        )
        return result.rows[0] || null
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(`
          UPDATE customer_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `)
        stmt.run(status, id)
        return this.getCustomerOrderById(id)
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error updating customer order status:', error)
      throw error
    }
  }

  async deleteCustomerOrder(id: number): Promise<boolean> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(`DELETE FROM customer_orders WHERE id = $1`, [id])
        return result.rowCount > 0
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(`DELETE FROM customer_orders WHERE id = ?`)
        const result = stmt.run(id)
        return result.changes > 0
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error deleting customer order:', error)
      throw error
    }
  }

  async getCustomerOrdersByStore(storeId: number): Promise<CustomerOrderRecord[]> {
    try {
      if (this.usePostgres && this.pgPool) {
        const result = await this.pgPool.query(`
          SELECT co.*, s.name as store_name, s.code as store_code
          FROM customer_orders co
          LEFT JOIN stores s ON co.store_id = s.id
          WHERE co.store_id = $1 AND co.status != '已刪除'
          ORDER BY co.created_at DESC
        `, [storeId])
        return result.rows
      } else if (this.sqliteDb) {
        const stmt = this.sqliteDb.prepare(`
          SELECT co.*, s.name as store_name, s.code as store_code
          FROM customer_orders co
          LEFT JOIN stores s ON co.store_id = s.id
          WHERE co.store_id = ? AND co.status != '已刪除'
          ORDER BY co.created_at DESC
        `)
        return stmt.all(storeId) as CustomerOrderRecord[]
      } else {
        throw new Error('資料庫未初始化')
      }
    } catch (error) {
      console.error('Error fetching customer orders by store:', error)
      throw error
    }
  }
}

export const db = new DatabaseManager()

export const initializeDatabase = async (): Promise<void> => {
  await db.initialize()

  // 創建或同步默認管理員用戶
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const existingAdmin = await db.getUserByUsername(adminUsername)

    if (!existingAdmin) {
      // 管理員不存在，使用 .env 密碼創建新管理員
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

      await db.createUser({
        username: adminUsername,
        password: adminPassword,
        role: 'admin',
        permissions: ['manage_users', 'manage_stores', 'view_payments', 'edit_payments', 'delete_payments', 'view_reports', 'system_admin']
      })
      console.log(`✅ Default admin user created: ${adminUsername}`)
      console.log(`ℹ️  Initial password: ${adminPassword.replace(/./g, '*')}`)
      console.log(`💡 Please change the password after first login via Admin Dashboard`)
      console.log(`💡 If you forget the password, use: npm run reset-password`)
    } else {
      // 管理員已存在，資料庫密碼為唯一真實來源
      console.log(`✅ Admin user loaded: ${adminUsername}`)

      // 檢查是否需要強制重置密碼（僅在明確設定時才執行）
      const forceResetPassword = process.env.FORCE_RESET_ADMIN_PASSWORD === 'true'

      if (forceResetPassword) {
        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminPassword) {
          console.error(`⚠️  FORCE_RESET_ADMIN_PASSWORD=true but ADMIN_PASSWORD is not set in .env`)
          console.error(`💡 Please set ADMIN_PASSWORD in .env or use: npm run reset-password`)
        } else {
          await db.updateUser(existingAdmin.id, {
            password: adminPassword
          })
          console.log(`🔄 Admin password forcefully reset from .env`)
          console.log(`⚠️  Remember to set FORCE_RESET_ADMIN_PASSWORD=false after restart`)
        }
      } else {
        console.log(`💡 Database password is the source of truth`)
        console.log(`💡 To reset password: npm run reset-password`)
        console.log(`💡 For emergency reset: set FORCE_RESET_ADMIN_PASSWORD=true in .env and restart`)
      }
    }
  } catch (error) {
    console.error('Error creating/syncing default admin user:', error)
  }
}