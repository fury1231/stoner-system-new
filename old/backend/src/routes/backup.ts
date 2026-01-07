import { Router, Request, Response } from 'express'
import { db } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import multer from 'multer'

// 🔧 統一的資料庫路徑函數（與 db.ts 保持一致）
function getDatabasePath(): string {
  const dbDir = process.env.NODE_ENV === 'production' 
    ? path.join(process.cwd(), 'data') 
    : process.cwd()
  return path.join(dbDir, 'database.sqlite')
}

const router: Router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 設置 multer 用於檔案上傳
const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB 限制
  },
  fileFilter: (req, file, cb) => {
    // 只允許 .db 和 .sql 檔案
    const allowedExtensions = ['.db', '.sql', '.sqlite', '.sqlite3']
    const fileExtension = path.extname(file.originalname).toLowerCase()
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error('只允許上傳 .db, .sql, .sqlite, .sqlite3 檔案'))
    }
  }
})

// 權限檢查中間件 - 只有管理員能備份
const requireAdmin = async (req: any, res: Response, next: any) => {
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
router.post('/database', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Database Backup Started ===')
    const backupResult = await createDatabaseBackup(req as any)
    
    // 記錄審計日誌
    const backupUser = await db.getUserByUsername((req as any).user.username)
    await db.createAuditLog({
      user_id: backupUser?.id || 0,
      username: (req as any).user.username,
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
      const errorUser = await db.getUserByUsername((req as any).user.username)
      await db.createAuditLog({
        user_id: errorUser?.id || 0,
        username: (req as any).user.username,
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

// 下載備份檔案（支援 token 查詢參數）
router.get('/download/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Backup Download Request ===')
    console.log('Filename:', req.params.filename)
    console.log('Query token:', req.query.token ? 'Present' : 'Missing')
    console.log('Auth header:', req.headers.authorization ? 'Present' : 'Missing')
    
    // 從查詢參數或標頭獲取 token
    const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      console.log('❌ No token provided')
      res.status(401).json({ message: '需要認證 token' })
      return
    }
    
    // 獲取 JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET
    console.log('JWT_SECRET exists:', !!jwtSecret)
    
    if (!jwtSecret || jwtSecret === 'default-secret') {
      console.log('❌ Invalid JWT_SECRET configuration')
      res.status(500).json({ message: '系統配置錯誤' })
      return
    }
    
    // 驗證 token 和權限
    let decoded: any
    try {
      decoded = jwt.verify(token, jwtSecret) as any
      console.log('✅ Token verified, username:', decoded.username)
    } catch (authError) {
      console.log('❌ Token verification failed:', authError)
      res.status(401).json({ message: '無效的認證 token' })
      return
    }
    
    // 檢查用戶權限
    const user = await db.getUserByUsername(decoded.username)
    if (!user) {
      console.log('❌ User not found:', decoded.username)
      res.status(401).json({ message: '用戶不存在' })
      return
    }
    
    if (user.role !== 'admin') {
      console.log('❌ Insufficient permissions, user role:', user.role)
      res.status(403).json({ message: '權限不足：僅管理員可下載備份' })
      return
    }
    
    console.log('✅ User permissions verified')
    
    const filename = req.params.filename
    const backupDir = path.join(__dirname, '../../backups')
    const filePath = path.join(backupDir, filename)
    
    console.log('Backup directory:', backupDir)
    console.log('File path:', filePath)
    
    // 安全檢查：確保檔案路徑在備份目錄內
    const normalizedBackupDir = path.resolve(backupDir)
    const normalizedFilePath = path.resolve(filePath)
    
    if (!normalizedFilePath.startsWith(normalizedBackupDir)) {
      console.log('❌ Invalid file path, potential directory traversal')
      res.status(400).json({ message: '無效的檔案路徑' })
      return
    }
    
    // 檢查檔案是否存在
    if (!fs.existsSync(filePath)) {
      console.log('❌ File does not exist:', filePath)
      // 列出可用檔案幫助除錯
      try {
        const availableFiles = fs.readdirSync(backupDir)
        console.log('Available files:', availableFiles)
      } catch (dirError) {
        console.log('Cannot list directory:', dirError)
      }
      res.status(404).json({ message: '備份檔案不存在' })
      return
    }
    
    console.log('✅ File exists, preparing download')
    
    // 記錄下載審計日誌
    try {
      await db.createAuditLog({
        user_id: user.id,
        username: decoded.username,
        action: 'view',
        resource_type: 'system',
        resource_id: 'database_backup',
        details: `下載備份檔案: ${filename}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
      console.log('✅ Audit log created')
    } catch (auditError) {
      console.log('⚠️  Failed to create audit log:', auditError)
      // 不影響下載，繼續執行
    }
    
    // 設定下載標頭
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', 'application/octet-stream')
    
    console.log('✅ Sending file...')
    // 傳送檔案
    res.sendFile(filePath, (err) => {
      if (err) {
        console.log('❌ Error sending file:', err)
      } else {
        console.log('✅ File sent successfully')
      }
    })
  } catch (error) {
    console.error('❌ Download backup error:', error)
    res.status(500).json({ message: '下載備份檔案失敗' })
  }
})

// 列出可用的備份檔案
router.get('/list', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
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
router.post('/import', authenticate, requireAdmin, upload.single('database'), async (req: Request, res: Response): Promise<void> => {
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
    
    // 驗證檔案類型
    const allowedExtensions = ['.db', '.sql', '.sqlite', '.sqlite3']
    if (!allowedExtensions.includes(fileExtension)) {
      // 清理上傳的檔案
      fs.unlinkSync(tempPath)
      res.status(400).json({
        success: false,
        message: '不支援的檔案格式，只允許 .db, .sql, .sqlite, .sqlite3 檔案'
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
    
    const importResult = await importDatabase(tempPath, originalName, (req as any).user.username)

    // 清理上傳的臨時檔案
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }

    // 記錄審計日誌（失敗不影響匯入結果）
    try {
      const importUser = await db.getUserByUsername((req as any).user.username)
      await db.createAuditLog({
        user_id: importUser?.id || 0,
        username: (req as any).user.username,
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
      const errorUser = await db.getUserByUsername((req as any).user.username)
      await db.createAuditLog({
        user_id: errorUser?.id || 0,
        username: (req as any).user.username,
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
async function createDatabaseBackup(req: any): Promise<{ filename: string; size: number; path: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(__dirname, '../../backups')
  
  // 確保備份目錄存在
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  if (process.env.USE_PG === 'true') {
    // PostgreSQL 備份
    return await createPostgreSQLBackup(backupDir, timestamp)
  } else {
    // SQLite 備份
    return await createSQLiteBackup(backupDir, timestamp)
  }
}

// SQLite 備份
async function createSQLiteBackup(backupDir: string, timestamp: string): Promise<{ filename: string; size: number; path: string }> {
  const sourceDb = getDatabasePath()
  const backupFilename = `backup-sqlite-${timestamp}.db`
  const backupPath = path.join(backupDir, backupFilename)
  
  console.log('🔍 Source database path:', sourceDb)
  console.log('🔍 Backup path:', backupPath)
  
  // 檢查來源資料庫是否存在
  if (!fs.existsSync(sourceDb)) {
    console.log('❌ Database file not found. Available files in directory:')
    try {
      const dirContents = fs.readdirSync(path.dirname(sourceDb))
      console.log('Directory contents:', dirContents)
    } catch (e) {
      console.log('Cannot read directory:', e)
    }
    throw new Error(`SQLite 資料庫檔案不存在: ${sourceDb}`)
  }
  
  // 複製資料庫檔案
  fs.copyFileSync(sourceDb, backupPath)
  
  const stats = fs.statSync(backupPath)
  
  return {
    filename: backupFilename,
    size: stats.size,
    path: backupPath
  }
}

// PostgreSQL 備份
async function createPostgreSQLBackup(backupDir: string, timestamp: string): Promise<{ filename: string; size: number; path: string }> {
  const { spawn } = require('child_process')
  const backupFilename = `backup-postgresql-${timestamp}.sql`
  const backupPath = path.join(backupDir, backupFilename)
  
  const pgDumpArgs = [
    '-h', process.env.PG_HOST || 'localhost',
    '-p', process.env.PG_PORT || '5432',
    '-U', process.env.PG_USER || 'postgres',
    '-d', process.env.PG_DATABASE || 'stoner_system',
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
    
    pgDump.on('close', (code) => {
      if (code === 0) {
        const stats = fs.statSync(backupPath)
        resolve({
          filename: backupFilename,
          size: stats.size,
          path: backupPath
        })
      } else {
        reject(new Error(`pg_dump 執行失敗，退出代碼: ${code}`))
      }
    })
    
    pgDump.on('error', (error) => {
      reject(new Error(`pg_dump 執行錯誤: ${error.message}`))
    })
  })
}

// 匯入資料庫的核心功能
async function importDatabase(tempPath: string, originalName: string, username: string): Promise<{ filename: string; size: number; originalName: string }> {
  console.log('Starting database import process...')
  
  if (process.env.USE_PG === 'true') {
    // PostgreSQL 匯入
    return await importPostgreSQLDatabase(tempPath, originalName, username)
  } else {
    // SQLite 匯入
    return await importSQLiteDatabase(tempPath, originalName, username)
  }
}

// SQLite 資料庫匯入
async function importSQLiteDatabase(tempPath: string, originalName: string, username: string): Promise<{ filename: string; size: number; originalName: string }> {
  const currentDbPath = getDatabasePath()
  const backupDir = path.join(__dirname, '../../backups')
  
  console.log('🔍 Current database path:', currentDbPath)
  console.log('🔍 Temp file path:', tempPath)
  console.log('🔍 Backup directory:', backupDir)
  
  // 確保備份目錄存在
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  // 在匯入前先備份現有資料庫
  if (fs.existsSync(currentDbPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `backup-before-import-${timestamp}.db`
    const backupPath = path.join(backupDir, backupFilename)
    
    console.log(`Creating backup before import: ${backupFilename}`)
    fs.copyFileSync(currentDbPath, backupPath)
  }
  
  // 檢查上傳的檔案是否有效的 SQLite 資料庫
  try {
    const fileBuffer = fs.readFileSync(tempPath)
    const fileHeader = fileBuffer.toString('ascii', 0, 16)
    
    if (!fileHeader.startsWith('SQLite format 3')) {
      throw new Error('上傳的檔案不是有效的 SQLite 資料庫檔案')
    }
  } catch (error) {
    throw new Error('無法讀取或驗證上傳的資料庫檔案')
  }
  
  // 替換現有資料庫
  console.log('🔄 Replacing current database with uploaded file...')
  console.log('🔄 Before replacement - Current DB size:', fs.existsSync(currentDbPath) ? fs.statSync(currentDbPath).size : 0)
  console.log('🔄 Uploaded file size:', fs.statSync(tempPath).size)
  
  fs.copyFileSync(tempPath, currentDbPath)
  
  const stats = fs.statSync(currentDbPath)
  
  console.log(`✅ SQLite database import completed. New database size: ${stats.size} bytes`)
  
  // 驗證匯入結果
  try {
    const Database = require('better-sqlite3')
    const testDb = new Database(currentDbPath, { readonly: true })
    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    console.log('✅ Imported database tables:', tables.map(t => t.name))
    
    // 檢查主要表的記錄數
    const paymentCount = testDb.prepare("SELECT COUNT(*) as count FROM payments").get()
    const userCount = testDb.prepare("SELECT COUNT(*) as count FROM users").get()
    const storeCount = testDb.prepare("SELECT COUNT(*) as count FROM stores").get()
    
    console.log('✅ Record counts after import:')
    console.log('   - Payments:', paymentCount?.count || 0)
    console.log('   - Users:', userCount?.count || 0)
    console.log('   - Stores:', storeCount?.count || 0)
    
    testDb.close()
  } catch (verifyError) {
    console.log('⚠️  Could not verify imported database:', verifyError)
  }
  
  return {
    filename: path.basename(currentDbPath),
    size: stats.size,
    originalName: originalName
  }
}

// PostgreSQL 資料庫匯入
async function importPostgreSQLDatabase(tempPath: string, originalName: string, username: string): Promise<{ filename: string; size: number; originalName: string }> {
  const { spawn } = require('child_process')
  
  // 檢查檔案是否為 SQL 檔案
  if (!originalName.toLowerCase().endsWith('.sql')) {
    throw new Error('PostgreSQL 匯入只支援 .sql 檔案')
  }
  
  const psqlArgs = [
    '-h', process.env.PG_HOST || 'localhost',
    '-p', process.env.PG_PORT || '5432',
    '-U', process.env.PG_USER || 'postgres',
    '-d', process.env.PG_DATABASE || 'stoner_system',
    '-f', tempPath,
    '--quiet'
  ]
  
  return new Promise((resolve, reject) => {
    console.log('Starting PostgreSQL import...')
    
    const psql = spawn('psql', psqlArgs, {
      env: {
        ...process.env,
        PGPASSWORD: process.env.PG_PASSWORD || ''
      }
    })
    
    let errorOutput = ''
    
    psql.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    psql.on('close', (code) => {
      if (code === 0) {
        const stats = fs.statSync(tempPath)
        console.log(`PostgreSQL database import completed. SQL file size: ${stats.size} bytes`)
        
        resolve({
          filename: originalName,
          size: stats.size,
          originalName: originalName
        })
      } else {
        reject(new Error(`psql 執行失敗，退出代碼: ${code}，錯誤訊息: ${errorOutput}`))
      }
    })
    
    psql.on('error', (error) => {
      reject(new Error(`psql 執行錯誤: ${error.message}`))
    })
  })
}

export { router as backupRoutes }