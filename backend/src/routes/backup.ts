import { Router, Request, Response, NextFunction } from 'express'
import { db } from '../db.js'
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import Database from 'better-sqlite3'
import type { PoolClient } from 'pg'

const router: Router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🔒 安全性改進：驗證 PostgreSQL 參數，防止命令注入
function sanitizePgParam(param: string, paramName: string): string {
  // 只允許字母、數字、點、連字符、底線
  if (!/^[a-zA-Z0-9._-]+$/.test(param)) {
    throw new Error(`PostgreSQL 參數 ${paramName} 格式無效`)
  }
  // 限制長度
  if (param.length > 128) {
    throw new Error(`PostgreSQL 參數 ${paramName} 過長`)
  }
  return param
}

// 🔒 安全性改進：驗證 PostgreSQL 端口
function sanitizePgPort(port: string): string {
  const portNum = parseInt(port, 10)
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error('PostgreSQL 端口必須是 1-65535 之間的數字')
  }
  return port
}

// 設置 multer 用於檔案上傳
const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB 限制
  },
  fileFilter: (req, file, cb) => {
    // 允許 PostgreSQL SQL 備份檔案和 SQLite 備份檔案
    const allowedExtensions = ['.sql', '.db', '.sqlite', '.sqlite3']
    const fileExtension = path.extname(file.originalname).toLowerCase()

    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error('只允許上傳 .sql (PostgreSQL) 或 .db/.sqlite/.sqlite3 (SQLite) 格式的備份檔案'))
    }
  }
})

// 權限檢查中間件 - 只有管理員能備份
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await db.getUserByUsername(req.user.username)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '權限不足：僅管理員可執行備份操作' })
    }
    next()
  } catch (error) {
    console.error('Permission check error:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
}

// 備份資料庫
router.post('/database', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('=== Database Backup Started ===')
    const backupResult = await createDatabaseBackup()
    
    // 記錄審計日誌
    const backupUser = await db.getUserByUsername(req.user.username)
    await db.createAuditLog({
      user_id: backupUser?.id || 0,
      username: req.user.username,
      action: 'create',
      resource_type: 'system',
      resource_id: 'database_backup',
      details: `資料庫備份成功: ${backupResult.filename}, 大小: ${backupResult.size} bytes`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    })
    
    console.log('=== Database Backup Completed ===')
    res.json({
      success: true,
      message: '資料庫備份成功',
      backup: backupResult
    })
  } catch (error) {
    console.error('Database backup error:', error)
    
    // 記錄錯誤審計日誌
    try {
      const errorUser = await db.getUserByUsername(req.user.username)
      await db.createAuditLog({
        user_id: errorUser?.id || 0,
        username: req.user.username,
        action: 'create',
        resource_type: 'system',
        resource_id: 'database_backup',
        details: `資料庫備份失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    } catch (auditError) {
      console.error('Failed to log backup error:', auditError)
    }
    
    res.status(500).json({ 
      success: false,
      message: '資料庫備份失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    })
  }
})

// 🔒 安全性改進：下載備份檔案使用 Cookie 認證（移除不安全的 URL token）
// JWT 在 URL 中會暴露在瀏覽器歷史、伺服器日誌、Referrer 標頭中

// 🔒 安全性改進：備份檔名白名單驗證（防止路徑遍歷和編碼繞過）
const SAFE_BACKUP_FILENAME_REGEX = /^backup-(postgresql|sqlite)-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.(sql|db)$/

router.get('/download/:filename', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filename = req.params.filename

    // 🔒 安全性改進：檔名白名單驗證（在路徑處理前檢查）
    if (!SAFE_BACKUP_FILENAME_REGEX.test(filename)) {
      res.status(400).json({ message: '無效的檔案名稱格式' })
      return
    }

    // 獲取用戶信息（已通過 authenticate 和 requireAdmin 中間件驗證）
    const user = await db.getUserByUsername(req.user.username)
    if (!user) {
      res.status(401).json({ message: '用戶不存在' })
      return
    }

    const backupDir = path.join(__dirname, '../../backups')
    const filePath = path.join(backupDir, filename)

    // 安全檢查：確保檔案路徑在備份目錄內（雙重保護）
    const normalizedBackupDir = path.resolve(backupDir)
    const normalizedFilePath = path.resolve(filePath)

    if (!normalizedFilePath.startsWith(normalizedBackupDir)) {
      res.status(400).json({ message: '無效的檔案路徑' })
      return
    }

    // 檢查檔案是否存在
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: '備份檔案不存在' })
      return
    }
    
    // 記錄下載審計日誌（失敗不影響下載）
    try {
      await db.createAuditLog({
        user_id: user.id,
        username: req.user.username,
        action: 'view',
        resource_type: 'system',
        resource_id: 'database_backup',
        details: `下載備份檔案: ${filename}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    } catch {
      // 審計日誌失敗不影響下載
    }

    // 設定下載標頭
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', 'application/octet-stream')

    // 傳送檔案
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ message: '下載備份檔案失敗' })
      }
    })
  } catch (error) {
    console.error('Download backup error:', error)
    res.status(500).json({ message: '下載備份檔案失敗' })
  }
})

// 列出可用的備份檔案
router.get('/list', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const backupDir = path.join(__dirname, '../../backups')
    
    // 確保備份目錄存在
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql') || file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        }
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime())
    
    res.json({
      success: true,
      backups: files
    })
  } catch (error) {
    console.error('List backups error:', error)
    res.status(500).json({ message: '獲取備份列表失敗' })
  }
})

// 匯入資料庫
router.post('/import', authenticate, requireAdmin, upload.single('database'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('=== Database Import Started ===')
    
    if (!req.file) {
      res.status(400).json({ 
        success: false, 
        message: '未提供資料庫檔案' 
      })
      return
    }
    
    const uploadedFile = req.file
    const originalName = uploadedFile.originalname
    const tempPath = uploadedFile.path
    const fileExtension = path.extname(originalName).toLowerCase()
    
    console.log('Uploaded file:', {
      originalName,
      tempPath,
      size: uploadedFile.size,
      extension: fileExtension
    })
    
    // 允許 PostgreSQL SQL 備份檔案和 SQLite 備份檔案
    const allowedExtensions = ['.sql', '.db', '.sqlite', '.sqlite3']
    if (!allowedExtensions.includes(fileExtension)) {
      // 清理上傳的檔案
      fs.unlinkSync(tempPath)
      res.status(400).json({
        success: false,
        message: '不支援的檔案格式，只允許 .sql (PostgreSQL) 或 .db/.sqlite/.sqlite3 (SQLite) 格式'
      })
      return
    }
    
    // 檢查檔案大小（100MB 限制）
    if (uploadedFile.size > 100 * 1024 * 1024) {
      fs.unlinkSync(tempPath)
      res.status(400).json({
        success: false,
        message: '檔案過大，最大支援 100MB'
      })
      return
    }
    
    const importResult = await importDatabase(tempPath, originalName, req.user.username)

    // 清理上傳的臨時檔案
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }

    // 記錄審計日誌（失敗不影響匯入結果）
    try {
      const importUser = await db.getUserByUsername(req.user.username)
      await db.createAuditLog({
        user_id: importUser?.id || 0,
        username: req.user.username,
        action: 'create',
        resource_type: 'system',
        resource_id: 'database_import',
        details: `資料庫匯入成功: ${originalName}, 大小: ${uploadedFile.size} bytes`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    } catch (auditError) {
      console.error('Failed to create audit log after import (non-fatal):', auditError)
      // 審計日誌失敗不影響匯入成功的判定
    }

    console.log('=== Database Import Completed ===')
    res.json({
      success: true,
      message: '資料庫匯入成功',
      import: importResult
    })
  } catch (error) {
    console.error('Database import error:', error)
    
    // 清理上傳的檔案
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    // 記錄錯誤審計日誌
    try {
      const errorUser = await db.getUserByUsername(req.user.username)
      await db.createAuditLog({
        user_id: errorUser?.id || 0,
        username: req.user.username,
        action: 'create',
        resource_type: 'system',
        resource_id: 'database_import',
        details: `資料庫匯入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    } catch (auditError) {
      console.error('Failed to log import error:', auditError)
    }
    
    res.status(500).json({ 
      success: false,
      message: '資料庫匯入失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    })
  }
})

// 創建資料庫備份的核心功能
async function createDatabaseBackup(): Promise<{ filename: string; size: number; path: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(__dirname, '../../backups')

  // 確保備份目錄存在
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // 現在只使用 PostgreSQL
  return await createPostgreSQLBackup(backupDir, timestamp)
}

// PostgreSQL 備份
async function createPostgreSQLBackup(backupDir: string, timestamp: string): Promise<{ filename: string; size: number; path: string }> {
  const { spawn } = require('child_process')
  const backupFilename = `backup-postgresql-${timestamp}.sql`
  const backupPath = path.join(backupDir, backupFilename)

  // 🔒 安全性改進：驗證所有 PostgreSQL 參數
  const pgHost = sanitizePgParam(process.env.PG_HOST || 'localhost', 'PG_HOST')
  const pgPort = sanitizePgPort(process.env.PG_PORT || '5432')
  const pgUsername = sanitizePgParam(process.env.PG_USERNAME || 'stoner', 'PG_USERNAME')
  const pgDatabase = sanitizePgParam(process.env.PG_DATABASE || 'stoner_system', 'PG_DATABASE')

  const pgDumpArgs = [
    '-h', pgHost,
    '-p', pgPort,
    '-U', pgUsername,
    '-d', pgDatabase,
    '-f', backupPath,
    '--verbose',
    '--no-password'
  ]

  return new Promise((resolve, reject) => {
    const pgDump = spawn('pg_dump', pgDumpArgs, {
      env: {
        ...process.env,
        PGPASSWORD: process.env.PG_PASSWORD || ''
      }
    })

    // 捕獲 stderr 以獲取錯誤訊息
    let stderr = ''
    pgDump.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    pgDump.on('close', (code: number | null) => {
      if (code === 0) {
        const stats = fs.statSync(backupPath)
        resolve({
          filename: backupFilename,
          size: stats.size,
          path: backupPath
        })
      } else {
        // 清理不完整的備份檔案
        if (fs.existsSync(backupPath)) {
          try {
            fs.unlinkSync(backupPath)
          } catch (cleanupError) {
            console.error('Failed to clean up partial backup file:', cleanupError)
          }
        }
        reject(new Error(`pg_dump 執行失敗: ${stderr || `退出代碼 ${code}`}`))
      }
    })

    pgDump.on('error', (error: Error) => {
      // 清理不完整的備份檔案
      if (fs.existsSync(backupPath)) {
        try {
          fs.unlinkSync(backupPath)
        } catch (cleanupError) {
          console.error('Failed to clean up partial backup file:', cleanupError)
        }
      }
      reject(new Error(`pg_dump 執行錯誤: ${error.message}`))
    })
  })
}

// 匯入資料庫的核心功能
async function importDatabase(tempPath: string, originalName: string, _username: string): Promise<{ filename: string; size: number; originalName: string }> {
  const fileExtension = path.extname(originalName).toLowerCase()

  if (fileExtension === '.sql') {
    // PostgreSQL SQL 備份檔案還原
    return await importPostgreSQLBackup(tempPath, originalName)
  }

  if (['.db', '.sqlite', '.sqlite3'].includes(fileExtension)) {
    // SQLite 備份檔案轉換並匯入 PostgreSQL
    return await importSQLiteToPostgreSQL(tempPath, originalName)
  }

  throw new Error(`不支援的檔案格式: ${fileExtension}，只支援 .sql 或 .db/.sqlite/.sqlite3 格式`)
}

// PostgreSQL 備份還原
async function importPostgreSQLBackup(tempPath: string, originalName: string): Promise<{ filename: string; size: number; originalName: string }> {
  const { spawn } = require('child_process')
  const fileStats = fs.statSync(tempPath)

  // 檢查檔案大小
  const maxFileSize = 100 * 1024 * 1024 // 100MB
  if (fileStats.size > maxFileSize) {
    throw new Error('備份檔案過大，最大允許 100MB')
  }
  if (fileStats.size < 100) {
    throw new Error('備份檔案過小，可能不是有效的 PostgreSQL 備份')
  }

  // 驗證檔案內容（檢查是否為 pg_dump 產生的 SQL）
  const fileContent = fs.readFileSync(tempPath, 'utf8').substring(0, 1000)
  if (!fileContent.includes('PostgreSQL database dump') && !fileContent.includes('pg_dump')) {
    throw new Error('上傳的檔案不是有效的 PostgreSQL 備份檔案')
  }

  // 🔒 安全性改進：驗證所有 PostgreSQL 參數
  const pgHost = sanitizePgParam(process.env.PG_HOST || 'localhost', 'PG_HOST')
  const pgPort = sanitizePgPort(process.env.PG_PORT || '5432')
  const pgUsername = sanitizePgParam(process.env.PG_USERNAME || 'stoner', 'PG_USERNAME')
  const pgDatabase = sanitizePgParam(process.env.PG_DATABASE || 'stoner_system', 'PG_DATABASE')

  const psqlArgs = [
    '-h', pgHost,
    '-p', pgPort,
    '-U', pgUsername,
    '-d', pgDatabase,
    '-f', tempPath,
    '--quiet'
  ]

  const IMPORT_TIMEOUT_MS = 120000 // 2 分鐘超時 (CLAUDE.md v3.22)

  return new Promise((resolve, reject) => {
    let isTimedOut = false

    const psql = spawn('psql', psqlArgs, {
      env: {
        ...process.env,
        PGPASSWORD: process.env.PG_PASSWORD || ''
      }
    })

    // 設置超時計時器
    const timeoutId = setTimeout(() => {
      isTimedOut = true
      psql.kill('SIGTERM')
      reject(new Error('psql 執行超時（超過 2 分鐘）'))
    }, IMPORT_TIMEOUT_MS)

    let stderr = ''
    psql.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    psql.on('close', (code: number | null) => {
      clearTimeout(timeoutId)
      if (isTimedOut) return // 已經因超時而 reject

      if (code === 0) {
        resolve({
          filename: originalName,
          size: fileStats.size,
          originalName: originalName
        })
      } else {
        reject(new Error(`psql 執行失敗: ${stderr || `退出代碼 ${code}`}`))
      }
    })

    psql.on('error', (error: Error) => {
      clearTimeout(timeoutId)
      if (isTimedOut) return
      reject(new Error(`psql 執行錯誤: ${error.message}`))
    })
  })
}

// 🔒 SQLite Schema 白名單驗證
const EXPECTED_SQLITE_TABLES = ['stores', 'users', 'payments', 'audit_logs', 'customer_orders'] as const
const EXPECTED_COLUMNS: Record<string, string[]> = {
  stores: ['id', 'name', 'code', 'address', 'phone', 'manager', 'is_active', 'created_at'],
  users: ['id', 'username', 'password_hash', 'role', 'permissions', 'store_id', 'accessible_stores', 'is_active', 'created_at', 'updated_at'],
  payments: ['uuid', 'last_five', 'paid_at', 'amount', 'note', 'status', 'store_id', 'payment_method', 'processed_by', 'created_at'],
  audit_logs: ['id', 'user_id', 'username', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'user_agent', 'created_at'],
  customer_orders: ['id', 'order_date', 'products', 'customer_name', 'customer_phone', 'payment_status', 'logistics', 'remarks', 'amount', 'status', 'store_id', 'created_by', 'created_at', 'updated_at']
}

// 🔒 安全性改進：使用 Set 進行 O(1) 白名單查詢
const EXPECTED_SQLITE_TABLES_SET = new Set(['stores', 'users', 'payments', 'audit_logs', 'customer_orders'])

// SQLite 備份檔案轉換並匯入 PostgreSQL
async function importSQLiteToPostgreSQL(tempPath: string, originalName: string): Promise<{ filename: string; size: number; originalName: string }> {
  const fileStats = fs.statSync(tempPath)

  // 檢查檔案大小
  const maxFileSize = 100 * 1024 * 1024 // 100MB
  if (fileStats.size > maxFileSize) {
    throw new Error('備份檔案過大，最大允許 100MB')
  }
  if (fileStats.size < 100) {
    throw new Error('備份檔案過小，可能不是有效的 SQLite 備份')
  }

  // 🔒 安全性檢查：驗證 SQLite 檔案格式（SQLite 檔案以 "SQLite format 3" 開頭）
  const fileHeader = Buffer.alloc(16)
  const fd = fs.openSync(tempPath, 'r')
  fs.readSync(fd, fileHeader, 0, 16, 0)
  fs.closeSync(fd)

  if (!fileHeader.toString('utf8', 0, 15).startsWith('SQLite format 3')) {
    throw new Error('上傳的檔案不是有效的 SQLite 資料庫檔案')
  }

  // 開啟 SQLite 資料庫（唯讀模式）
  let sqliteDb: Database.Database
  try {
    sqliteDb = new Database(tempPath, { readonly: true, fileMustExist: true })
  } catch (error) {
    throw new Error(`無法開啟 SQLite 資料庫: ${error instanceof Error ? error.message : '未知錯誤'}`)
  }

  // 取得 PostgreSQL 連線池和客戶端
  const pgPool = db.getPool()
  const client = await pgPool.connect()

  try {
    // 🔒 安全性檢查：驗證 Schema 白名單
    const tables = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]
    const tableNames = tables.map(t => t.name)

    // 檢查是否有未知的表（使用 Set 進行安全的白名單驗證）
    for (const tableName of tableNames) {
      if (!EXPECTED_SQLITE_TABLES_SET.has(tableName)) {
        throw new Error(`SQLite 資料庫包含未預期的表: ${tableName}`)
      }
    }

    // 檢查每個表的欄位（只檢查白名單內的表）
    for (const tableName of tableNames) {
      if (!EXPECTED_SQLITE_TABLES_SET.has(tableName)) continue

      // 使用安全的表名查詢（已通過白名單驗證）
      const columns = sqliteDb.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[]
      const columnNames = columns.map(c => c.name)
      const expectedColumns = EXPECTED_COLUMNS[tableName]

      if (expectedColumns) {
        for (const col of columnNames) {
          if (!expectedColumns.includes(col)) {
            throw new Error(`表 ${tableName} 包含未預期的欄位: ${col}`)
          }
        }
      }
    }

    // 🔒 使用 Transaction 確保資料完整性
    console.log('SQLite schema validation passed, starting import with transaction...')
    await client.query('BEGIN')

    try {
      // 匯入順序（依外鍵關係）
      const importOrder = ['stores', 'users', 'payments', 'customer_orders', 'audit_logs']
      const BATCH_SIZE = 100 // 批次處理大小

      for (const tableName of importOrder) {
        if (!tableNames.includes(tableName)) {
          console.log(`Table ${tableName} not found in SQLite, skipping...`)
          continue
        }

        // 使用安全的表名查詢（已通過白名單驗證）
        const rows = sqliteDb.prepare(`SELECT * FROM ${tableName}`).all() as Record<string, unknown>[]
        console.log(`Importing ${rows.length} rows from ${tableName}...`)

        if (rows.length === 0) continue

        // 批次處理匯入
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE)
          for (const row of batch) {
            await importRowToPostgreSQLWithClient(client, tableName, row)
          }
          // 每批次後短暫讓出控制權，避免阻塞
          if (i + BATCH_SIZE < rows.length) {
            await new Promise(resolve => setImmediate(resolve))
          }
        }
      }

      // 🔒 重設 PostgreSQL 序列，避免主鍵衝突
      console.log('Resetting PostgreSQL sequences...')
      await client.query(`SELECT setval('stores_id_seq', COALESCE((SELECT MAX(id) FROM stores), 0) + 1, false)`)
      await client.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false)`)
      await client.query(`SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 0) + 1, false)`)
      await client.query(`SELECT setval('customer_orders_id_seq', COALESCE((SELECT MAX(id) FROM customer_orders), 0) + 1, false)`)

      // 提交交易
      await client.query('COMMIT')
      console.log('SQLite to PostgreSQL import completed successfully')

      return {
        filename: originalName,
        size: fileStats.size,
        originalName: originalName
      }
    } catch (importError) {
      // 發生錯誤時回滾交易
      await client.query('ROLLBACK')
      console.error('Import failed, transaction rolled back')
      throw importError
    }
  } finally {
    client.release()
    sqliteDb.close()
  }
}

// 將單行資料匯入 PostgreSQL（使用 Client 和參數化查詢防止 SQL 注入）
async function importRowToPostgreSQLWithClient(client: PoolClient, tableName: string, row: Record<string, unknown>): Promise<void> {
  switch (tableName) {
    case 'stores': {
      const { id, name, code, address, phone, manager, is_active, created_at } = row as any
      await client.query(
        `INSERT INTO stores (id, name, code, address, phone, manager, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, code = EXCLUDED.code, address = EXCLUDED.address,
           phone = EXCLUDED.phone, manager = EXCLUDED.manager, is_active = EXCLUDED.is_active`,
        [id, name, code, address, phone, manager, Boolean(is_active), created_at]
      )
      break
    }
    case 'users': {
      const { id, username, password_hash, role, permissions, store_id, accessible_stores, is_active, created_at } = row as any
      await client.query(
        `INSERT INTO users (id, username, password_hash, role, permissions, store_id, accessible_stores, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role,
           permissions = EXCLUDED.permissions, store_id = EXCLUDED.store_id, accessible_stores = EXCLUDED.accessible_stores,
           is_active = EXCLUDED.is_active`,
        [id, username, password_hash, role, permissions, store_id, accessible_stores, Boolean(is_active), created_at]
      )
      break
    }
    case 'payments': {
      const { uuid, last_five, paid_at, amount, note, status, store_id, payment_method, processed_by, created_at } = row as any
      await client.query(
        `INSERT INTO payments (uuid, last_five, paid_at, amount, note, status, store_id, payment_method, processed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (uuid) DO UPDATE SET
           last_five = EXCLUDED.last_five, paid_at = EXCLUDED.paid_at, amount = EXCLUDED.amount,
           note = EXCLUDED.note, status = EXCLUDED.status, store_id = EXCLUDED.store_id,
           payment_method = EXCLUDED.payment_method, processed_by = EXCLUDED.processed_by`,
        [uuid, last_five, paid_at, amount ?? 0, note, status, store_id, payment_method, processed_by, created_at]
      )
      break
    }
    case 'customer_orders': {
      const { id, order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, status, store_id, created_by, created_at, updated_at } = row as any
      await client.query(
        `INSERT INTO customer_orders (id, order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, status, store_id, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           order_date = EXCLUDED.order_date, products = EXCLUDED.products, customer_name = EXCLUDED.customer_name,
           customer_phone = EXCLUDED.customer_phone, payment_status = EXCLUDED.payment_status, logistics = EXCLUDED.logistics,
           remarks = EXCLUDED.remarks, amount = EXCLUDED.amount, status = EXCLUDED.status,
           store_id = EXCLUDED.store_id, created_by = EXCLUDED.created_by, updated_at = EXCLUDED.updated_at`,
        [id, order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount ?? 0, status, store_id, created_by, created_at, updated_at]
      )
      break
    }
    case 'audit_logs': {
      const { id, user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at } = row as any
      await client.query(
        `INSERT INTO audit_logs (id, user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [id, user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at]
      )
      break
    }
  }
}

export { router as backupRoutes }