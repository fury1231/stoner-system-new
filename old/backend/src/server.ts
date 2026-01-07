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
    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.includes('localhost')) {
      errors.push('CORS_ORIGIN must be set to your production domain in production environment')
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
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'https://swair.online',
    'http://swair.online',
    process.env.CORS_ORIGIN || 'http://localhost:5173'
  ],
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

initializeServices()

app.use('/api/health', healthRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/backup', backupRoutes)
app.use('/api/customer-orders', customerOrderRoutes)

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

// 只監聽 localhost，通過 Nginx 反向代理對外提供服務（安全性提升）
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT} (localhost only)`)
})