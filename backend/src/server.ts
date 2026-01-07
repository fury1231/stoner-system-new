import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 必須先載入環境變數 - 指定正確的 .env 檔案路徑
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// 從專案根目錄載入 .env（backend/src -> 上兩層到專案根）
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

// 環境變數載入確認
console.log('✅ Environment variables loaded successfully')

// 🔒 強制驗證關鍵環境變數
const validateEnvironmentVariables = () => {
  const errors: string[] = []

  // 驗證 JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    errors.push('JWT_SECRET is not set')
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  } else if (jwtSecret.includes('CHANGE-THIS') || jwtSecret === 'default-secret') {
    errors.push('JWT_SECRET is still using default/example value. Please generate a secure random string.')
  }

  // 驗證管理員密碼
  const adminPassword = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    errors.push('ADMIN_PASSWORD or ADMIN_PASSWORD_HASH is not set')
  } else if (adminPassword === 'admin123' || adminPassword === 'password' || adminPassword.length < 8) {
    errors.push('ADMIN_PASSWORD is too weak. Please use a strong password (min 8 chars with mixed case, numbers, and symbols).')
  }

  // 生產環境額外檢查
  if (process.env.NODE_ENV === 'production') {
    const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) || []
    if (corsOrigins.length === 0) {
      errors.push('CORS_ORIGINS must be set in production environment (comma-separated list of allowed origins)')
    } else if (corsOrigins.some(origin => origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      errors.push('CORS_ORIGINS should not contain localhost in production environment')
    }
  }

  // 如果有錯誤，拒絕啟動
  if (errors.length > 0) {
    console.error('\n🚨 FATAL: Environment variable validation failed:\n')
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`)
    })
    console.error('\n💡 Please check your .env file and fix the issues above.\n')
    console.error('📖 See .env.example for reference.\n')
    process.exit(1)
  }

  console.log('✅ Environment variables validated successfully')
}

validateEnvironmentVariables()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { paymentRoutes } from './routes/payments.js'
import { adminRoutes } from './routes/admin.js'
import { userRoutes } from './routes/users.js'
import { storeRoutes } from './routes/stores.js'
import { auditRoutes } from './routes/audit.js'
import { backupRoutes } from './routes/backup.js'
import customerOrderRoutes from './routes/customer-orders.js'
import healthRoutes from './routes/health.js'
import { initializeDatabase } from './db.js'
import { csrfProtection, sanitizeInput, detectSuspiciousActivity, setCsrfToken } from './middleware/security.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

// 設定信任代理伺服器，確保能正確獲取真實 IP
app.set('trust proxy', 1) // 只信任第一層代理

// 🛡️ 調整 Rate Limiting（更嚴格的限制）
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: parseInt(process.env.RATE_LIMIT_MAX || '500'),
  message: { error: '請求過於頻繁，請稍後再試', retryAfter: 900 },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown'
  }
})

// ⚡ HTTP 壓縮（提升性能）
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  level: 6 // 壓縮級別 1-9，6 是平衡點
}))

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vue 需要
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
app.use(limiter)
// 🔒 安全性改進：CORS 配置改用環境變數
const corsOrigins = (() => {
  // 開發環境預設值
  const devOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173']

  // 從環境變數讀取允許的來源（逗號分隔）
  const envOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) || []

  // 生產環境只使用環境變數配置，開發環境合併
  if (process.env.NODE_ENV === 'production' && envOrigins.length > 0) {
    return envOrigins
  }

  return [...new Set([...devOrigins, ...envOrigins])]
})()

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser()) // 🍪 Cookie 解析器（CSRF Token 需要）

// 安全中間件
app.use(setCsrfToken) // 🔒 設置 CSRF Token
app.use(sanitizeInput)
app.use(detectSuspiciousActivity)
app.use(csrfProtection) // 🛡️ CSRF 保護驗證

// 初始化資料庫
async function initializeServices() {
  await initializeDatabase()
}

// 🔄 API 版本控制 - v1
const API_V1_PREFIX = '/api/v1'
app.use(`${API_V1_PREFIX}/health`, healthRoutes)
app.use(`${API_V1_PREFIX}/payments`, paymentRoutes)
app.use(`${API_V1_PREFIX}/admin`, adminRoutes)
app.use(`${API_V1_PREFIX}/users`, userRoutes)
app.use(`${API_V1_PREFIX}/stores`, storeRoutes)
app.use(`${API_V1_PREFIX}/audit`, auditRoutes)
app.use(`${API_V1_PREFIX}/backup`, backupRoutes)
app.use(`${API_V1_PREFIX}/customer-orders`, customerOrderRoutes)

// 🔄 向後兼容：舊版 /api/ 路由重定向到 /api/v1/
// 這允許在過渡期間逐步遷移，之後可移除
app.use('/api', (req, res, next) => {
  // 排除已經是 /api/v1 的請求
  if (req.path.startsWith('/v1')) {
    return next()
  }
  // 重定向到 v1 版本
  res.redirect(308, `${API_V1_PREFIX}${req.url}`)
})

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')))
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ message: 'API endpoint not found' })
    } else {
      res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
    }
  })
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 🔒 安全性改進：確保資料庫初始化完成後才啟動伺服器（修復競態條件）
async function startServer() {
  try {
    await initializeServices()

    // Docker 環境監聽 0.0.0.0，其他環境監聽 localhost
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
    app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT} (${HOST})`)
    })
  } catch (error) {
    console.error('\n🚨 FATAL: Failed to initialize services:')
    console.error(error)
    console.error('\n💡 Please check your database configuration and try again.\n')
    process.exit(1)
  }
}

startServer()