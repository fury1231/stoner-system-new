/**
 * 付款方式常量定義
 * 統一管理所有付款方式，避免在多處重複定義
 */

// 一般收款方式
export const GENERAL_PAYMENT_METHODS = ['現金', '匯款', '電子支付', '客訂單'] as const

// 員工購物方式
export const EMPLOYEE_PAYMENT_METHODS = ['員工購物-現金', '員工購物-匯款', '員工購物-電子支付'] as const

// 支出類型
export const EXPENSE_PAYMENT_METHODS = ['店內支出', '提領'] as const

// 所有付款方式
export const ALL_PAYMENT_METHODS = [
  ...GENERAL_PAYMENT_METHODS,
  ...EMPLOYEE_PAYMENT_METHODS,
  ...EXPENSE_PAYMENT_METHODS
] as const

// 需要輸入後五碼的付款方式
export const REQUIRES_LAST_FIVE = ['匯款', '員工購物-匯款'] as const

// 自動設為「未確認」狀態的付款方式
export const AUTO_PENDING_STATUS = ['匯款', '員工購物-匯款'] as const

// 付款方式類型定義
export type PaymentMethod = typeof ALL_PAYMENT_METHODS[number]
export type GeneralPaymentMethod = typeof GENERAL_PAYMENT_METHODS[number]
export type EmployeePaymentMethod = typeof EMPLOYEE_PAYMENT_METHODS[number]
export type ExpensePaymentMethod = typeof EXPENSE_PAYMENT_METHODS[number]

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
  return (REQUIRES_LAST_FIVE as readonly string[]).includes(method)
}

/**
 * 檢查付款方式是否自動設為未確認狀態
 */
export function isAutoPendingStatus(method: string): boolean {
  return (AUTO_PENDING_STATUS as readonly string[]).includes(method)
}

/**
 * 驗證付款方式是否有效
 */
export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return (ALL_PAYMENT_METHODS as readonly string[]).includes(method)
}
