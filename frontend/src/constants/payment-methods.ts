/**
 * 付款方式常量定義
 * 統一管理所有付款方式，避免在多處重複定義
 */

// 一般收款方式
export const GENERAL_PAYMENT_METHODS = [
  { value: '現金', label: '現金' },
  { value: '匯款', label: '匯款' },
  { value: '電子支付', label: '電子支付' },
  { value: '客訂單', label: '客訂單' }
] as const

// 員工購物方式
export const EMPLOYEE_PAYMENT_METHODS = [
  { value: '員工購物-現金', label: '現金' },
  { value: '員工購物-匯款', label: '匯款' },
  { value: '員工購物-電子支付', label: '電子支付' }
] as const

// 支出類型
export const EXPENSE_PAYMENT_METHODS = [
  { value: '店內支出', label: '店內支出' },
  { value: '提領', label: '提領' }
] as const

// 所有付款方式值列表
export const ALL_PAYMENT_METHOD_VALUES = [
  ...GENERAL_PAYMENT_METHODS.map(m => m.value),
  ...EMPLOYEE_PAYMENT_METHODS.map(m => m.value),
  ...EXPENSE_PAYMENT_METHODS.map(m => m.value)
]

// 需要輸入後五碼的付款方式
export const REQUIRES_LAST_FIVE = ['匯款', '員工購物-匯款']

// 自動設為「未確認」狀態的付款方式
export const AUTO_PENDING_STATUS = ['匯款', '員工購物-匯款']

/**
 * 取得付款方式的基礎類型（用於統計分組）
 * 例如：員工購物-現金 → 現金
 */
export function getBasePaymentMethod(method: string): string {
  if (method.startsWith('員工購物-')) {
    return method.replace('員工購物-', '')
  }
  return method
}

/**
 * 檢查付款方式是否需要輸入後五碼
 */
export function requiresLastFive(method: string): boolean {
  return REQUIRES_LAST_FIVE.includes(method)
}

/**
 * 檢查付款方式是否自動設為未確認狀態
 */
export function isAutoPendingStatus(method: string): boolean {
  return AUTO_PENDING_STATUS.includes(method)
}
