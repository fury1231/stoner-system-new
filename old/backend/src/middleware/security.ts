import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { body, query, param } from 'express-validator'
import { getClientIP } from '../utils/ip.js'
import crypto from 'crypto'

// 通用速率限制
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 1000, // 每15分鐘最多1000次請求
  message: {
    error: '請求過於頻繁，請稍後再試',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 登入速率限制（更嚴格）
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 5, // 每15分鐘最多5次登入嘗試
  message: {
    error: '登入嘗試過於頻繁，請等待15分鐘後再試',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 基於IP和用戶名的組合限制
  keyGenerator: (req: Request) => {
    return `${getClientIP(req)}-${req.body?.username || 'anonymous'}`
  }
})

// API 速率限制（針對API操作）
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分鐘
  max: 100, // 每分鐘最多100次API請求
  message: {
    error: 'API請求過於頻繁，請稍後再試',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 強化的輸入驗證
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // 清理所有字串輸入
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // 移除潛在的惡意字符
      return value
        .trim()
        .replace(/[<>]/g, '') // 移除HTML標籤字符
        .replace(/javascript:/gi, '') // 移除javascript:協議
        .replace(/data:/gi, '') // 移除data:協議
        .substring(0, 1000) // 限制長度
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {}
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key])
      }
      return sanitized
    }
    return value
  }

  req.body = sanitizeValue(req.body)
  req.query = sanitizeValue(req.query)
  req.params = sanitizeValue(req.params)
  
  next()
}

// UUID 參數驗證
export const validateUUID = [
  param('uuid')
    .isUUID(4)
    .withMessage('無效的UUID格式')
]

// 分頁參數驗證
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('頁碼必須是1-10000之間的整數'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每頁數量必須是1-100之間的整數')
]

// 搜尋參數驗證
export const validateSearch = [
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('搜尋關鍵字長度不能超過100字符')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_]*$/)
    .withMessage('搜尋關鍵字包含無效字符')
]

// 日期範圍驗證
export const validateDateRange = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式不正確'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式不正確')
    .custom((value, { req }) => {
      if (value && req.query?.start_date) {
        const startDate = new Date(req.query.start_date as string)
        const endDate = new Date(value)
        if (endDate < startDate) {
          throw new Error('結束日期不能早於開始日期')
        }
        // 限制查詢範圍不超過1年
        const oneYearMs = 365 * 24 * 60 * 60 * 1000
        if (endDate.getTime() - startDate.getTime() > oneYearMs) {
          throw new Error('日期範圍不能超過1年')
        }
      }
      return true
    })
]

// 安全標頭中間件
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 設置安全標頭
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // 在生產環境中設置HSTS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  next()
}

// IP 白名單中間件（可選）
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (allowedIPs.length === 0) {
      return next() // 如果沒有設置白名單，則跳過檢查
    }
    
    const clientIP = getClientIP(req)
    const isAllowed = allowedIPs.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR格式支援
        // 這裡可以實現CIDR匹配邏輯
        return clientIP.startsWith(allowedIP.split('/')[0])
      }
      return clientIP === allowedIP
    })
    
    if (!isAllowed) {
      console.warn(`Blocked access from unauthorized IP: ${clientIP}`)
      return res.status(403).json({ 
        message: '訪問被拒絕：IP地址未授權',
        code: 'IP_NOT_ALLOWED'
      })
    }
    
    next()
  }
}

// 強化密碼政策驗證
export const validateStrongPassword = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('密碼長度必須在8-128字符之間')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('密碼必須包含至少一個小寫字母、一個大寫字母、一個數字和一個特殊字符')
]

// 用戶名驗證
export const validateUsername = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('用戶名長度必須在3-30字符之間')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('用戶名只能包含字母、數字、下劃線和連字符')
]

// 🔒 強化 CSRF 保護 - 使用雙重提交 Cookie 模式
// 生成 CSRF Token
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

// CSRF 保護中間件 - 雙重提交 Cookie 模式
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // 跳過 GET, HEAD, OPTIONS 請求
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // 跳過特殊端點（登入前還沒有 token 或使用 multipart/form-data）
  const skipPaths = [
    '/api/admin/login',
    '/api/backup/import',  // 文件上傳使用 multipart/form-data
    '/api/stores/public'   // 公開 API
  ]

  // 跳過 Webhook 端點（GitHub Webhook 不會帶 CSRF Token，使用簽名驗證）
  const skipPathPrefixes = [
    '/api/webhook'
  ]

  if (skipPaths.some(path => req.path === path) ||
      skipPathPrefixes.some(prefix => req.path.startsWith(prefix))) {
    return next()
  }

  // 從 Cookie 和 Header 獲取 token
  const cookieToken = req.cookies?.['XSRF-TOKEN']
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token']

  // 驗證 token 是否存在且匹配
  if (!cookieToken || !headerToken) {
    console.warn(`CSRF protection: Missing token from IP: ${getClientIP(req)}`, {
      method: req.method,
      url: req.url,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken
    })

    return res.status(403).json({
      message: 'CSRF protection: Missing token',
      code: 'CSRF_TOKEN_MISSING'
    })
  }

  // 🔒 安全性修復：先檢查長度，防止 timingSafeEqual 拋出異常洩漏時序信息
  // 如果長度不同，使用恆定時間的錯誤處理
  if (cookieToken.length !== (headerToken as string).length) {
    console.warn(`CSRF protection: Token length mismatch from IP: ${getClientIP(req)}`, {
      method: req.method,
      url: req.url,
      cookieLength: cookieToken.length,
      headerLength: (headerToken as string).length
    })

    return res.status(403).json({
      message: 'CSRF protection: Invalid token',
      code: 'CSRF_TOKEN_INVALID'
    })
  }

  // 使用時間安全比較防止時序攻擊（長度已確認相同）
  try {
    if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken as string))) {
      console.warn(`CSRF protection: Token mismatch from IP: ${getClientIP(req)}`, {
        method: req.method,
        url: req.url
      })

      return res.status(403).json({
        message: 'CSRF protection: Invalid token',
        code: 'CSRF_TOKEN_INVALID'
      })
    }
  } catch (error) {
    // 額外的安全保障：捕獲任何意外的比較錯誤
    console.error(`CSRF protection: Comparison error from IP: ${getClientIP(req)}`, error)

    return res.status(403).json({
      message: 'CSRF protection: Invalid token',
      code: 'CSRF_TOKEN_INVALID'
    })
  }

  next()
}

// 設置 CSRF Token 到 Cookie
export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // 如果還沒有 token，生成一個
  if (!req.cookies?.['XSRF-TOKEN']) {
    const token = generateCsrfToken()

    // 🔧 VPS 部署修正：使用 'lax' 替代 'strict' 以支援跨域請求
    // 'strict' 會在跨站情況下完全阻止 Cookie，導致 CSRF token 無法傳遞
    // 'lax' 允許頂層導航（如重定向）攜帶 Cookie，但仍阻止第三方請求
    const cookieOptions: any = {
      httpOnly: false, // 需要讓 JavaScript 能讀取
      secure: process.env.NODE_ENV === 'production', // 生產環境使用 HTTPS
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // 修正為 lax
      maxAge: 8 * 60 * 60 * 1000, // 8小時（與 JWT 相同）
      path: '/' // 明確設定路徑
    }

    // 🌐 如果設定了 COOKIE_DOMAIN 環境變數，則設定 domain（支援子域名共享）
    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN
    }

    res.cookie('XSRF-TOKEN', token, cookieOptions)
  }
  next()
}

// 檢查可疑活動
export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /union\s+select/gi,
    /script\s*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi
  ]
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value))
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue)
    }
    return false
  }
  
  const hasSuspiciousContent = 
    checkValue(req.body) || 
    checkValue(req.query) || 
    checkValue(req.params)
  
  if (hasSuspiciousContent) {
    console.warn(`Suspicious activity detected from IP: ${getClientIP(req)}`, {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      userAgent: req.get('User-Agent')
    })
    
    return res.status(400).json({
      message: '檢測到可疑活動，請求被拒絕',
      code: 'SUSPICIOUS_ACTIVITY'
    })
  }
  
  next()
}