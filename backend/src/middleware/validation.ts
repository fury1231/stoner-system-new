import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'

export const paymentValidation = [
  body('paid_at')
    .isISO8601()
    .withMessage('付款時間格式不正確')
    .custom((value) => {
      const date = new Date(value)
      const now = new Date()
      // 允許 5 分鐘的寬限以處理時區和網路延遲問題
      const allowedFutureTime = new Date(now.getTime() + 5 * 60 * 1000) // 5分鐘
      if (date > allowedFutureTime) {
        throw new Error('付款時間不能是未來時間')
      }
      return true
    }),
  
  body('payment_method')
    .notEmpty()
    .withMessage('付款方式不能為空')
    .isIn([
      '現金', '匯款', '電子支付', '店內支出', '提領', '客訂單',
      '電子支付-街口支付', '電子支付-LINE PAY', '電子支付-刷卡', '電子支付-TAP PAY',
      '員工購物-現金', '員工購物-匯款', '員工購物-電子支付'
    ])
    .withMessage('付款方式不正確'),

  body('last_five')
    .optional()
    .custom((value, { req }) => {
      // 如果付款方式是匯款或員工購物-匯款，則後五碼為必填
      if (req.body.payment_method === '匯款' || req.body.payment_method === '員工購物-匯款') {
        if (!value) {
          throw new Error('匯款方式需要提供後五碼')
        }
        if (!/^\d{5}$/.test(value)) {
          throw new Error('後五碼必須是5位數字')
        }
      }
      return true
    }),
  
  body('amount')
    .isInt({ min: 0 })
    .withMessage('金額必須是非負整數（贈品/公關品可設為 0）'),

  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('備註長度不能超過1000字符')
]

export const adminLoginValidation = [
  body('username')
    .notEmpty()
    .withMessage('用戶名不能為空')
    .isLength({ max: 50 })
    .withMessage('用戶名長度不能超過50字符'),
  
  body('password')
    .notEmpty()
    .withMessage('密碼不能為空')
    .isLength({ min: 6, max: 128 })
    .withMessage('密碼長度必須在6-128個字符之間')
]

export const paymentUpdateValidation = [
  body('status')
    .optional()
    .isIn(['未確認', '已入帳', '未入帳'])
    .withMessage('狀態值不正確'),
  
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('備註長度不能超過1000字符'),
  
  body('payment_method')
    .optional()
    .isIn([
      '現金', '匯款', '電子支付', '店內支出', '提領', '客訂單',
      '電子支付-街口支付', '電子支付-LINE PAY', '電子支付-刷卡', '電子支付-TAP PAY',
      '員工購物-現金', '員工購物-匯款', '員工購物-電子支付'
    ])
    .withMessage('付款方式不正確'),

  body('last_five')
    .optional()
    .custom((value, { req }) => {
      // 如果付款方式是匯款或員工購物-匯款，則後五碼為必填
      if ((req.body.payment_method === '匯款' || req.body.payment_method === '員工購物-匯款') && value !== undefined) {
        if (!value) {
          throw new Error('匯款方式需要提供後五碼')
        }
        if (!/^\d{5}$/.test(value)) {
          throw new Error('後五碼必須是5位數字')
        }
      }
      return true
    }),
  
  body('amount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('金額必須是非負整數（贈品/公關品可設為 0）'),
  
  body('paid_at')
    .optional()
    .isISO8601()
    .withMessage('付款時間格式不正確')
]

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: '驗證失敗',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : undefined,
        message: error.msg
      }))
    })
    return
  }
  
  next()
}