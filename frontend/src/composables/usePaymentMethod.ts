/**
 * 付款方式處理 composable
 * 提供員工購物付款方式轉換和分類功能
 */
export function usePaymentMethod() {
  // 基礎付款方式
  const BASE_PAYMENT_METHODS = ['現金', '匯款', '電子支付', '店內支出', '提領', '客訂單'] as const

  // 員工購物付款方式
  const EMPLOYEE_PAYMENT_METHODS = ['員工購物-現金', '員工購物-匯款', '員工購物-電子支付'] as const

  // 所有付款方式
  const ALL_PAYMENT_METHODS = [...BASE_PAYMENT_METHODS, ...EMPLOYEE_PAYMENT_METHODS] as const

  /**
   * 取得基礎付款方式（用於統計分組）
   * 員工購物-現金 → 現金
   * 員工購物-匯款 → 匯款
   * 員工購物-電子支付 → 電子支付
   * 電子支付-街口/LINE PAY/刷卡/TapPay → 電子支付
   */
  const getBasePaymentMethod = (paymentMethod: string): string => {
    if (paymentMethod.startsWith('員工購物-')) {
      return paymentMethod.replace('員工購物-', '')
    }
    if (paymentMethod.startsWith('電子支付-')) {
      return '電子支付'
    }
    return paymentMethod
  }

  /**
   * 檢查是否為員工購物付款方式
   */
  const isEmployeePurchase = (paymentMethod: string): boolean => {
    return paymentMethod.startsWith('員工購物-')
  }

  /**
   * 檢查是否為收入類型
   */
  const isIncomeType = (paymentMethod: string): boolean => {
    const base = getBasePaymentMethod(paymentMethod)
    return ['現金', '匯款', '電子支付'].includes(base)
  }

  /**
   * 檢查是否為支出類型
   */
  const isExpenseType = (paymentMethod: string): boolean => {
    return ['店內支出', '提領'].includes(paymentMethod)
  }

  /**
   * 檢查是否需要末五碼
   */
  const requiresLastFive = (paymentMethod: string): boolean => {
    return paymentMethod === '匯款' || paymentMethod === '員工購物-匯款'
  }

  /**
   * 取得付款方式分組標籤
   */
  const getPaymentMethodGroup = (paymentMethod: string): '收入' | '支出' | '其他' => {
    if (isIncomeType(paymentMethod)) return '收入'
    if (isExpenseType(paymentMethod)) return '支出'
    return '其他'
  }

  return {
    BASE_PAYMENT_METHODS,
    EMPLOYEE_PAYMENT_METHODS,
    ALL_PAYMENT_METHODS,
    getBasePaymentMethod,
    isEmployeePurchase,
    isIncomeType,
    isExpenseType,
    requiresLastFive,
    getPaymentMethodGroup,
  }
}
