import type { AxiosError } from 'axios'

// API 錯誤響應類型
interface ApiErrorResponse {
  message?: string
  code?: string
  errors?: Array<{ msg: string; field?: string }>
}

// 錯誤代碼對應的用戶友好訊息
const ERROR_MESSAGES: Record<string, string> = {
  // 認證相關
  NO_TOKEN: '請先登入',
  TOKEN_EXPIRED: '登入已過期，請重新登入',
  INVALID_TOKEN: '認證無效，請重新登入',
  USER_INACTIVE: '帳戶已被停用',
  AUTH_ERROR: '認證過程發生錯誤',

  // CSRF 相關
  CSRF_TOKEN_INVALID: '安全驗證失敗，請重新整理頁面',
  CSRF_TOKEN_MISSING: '缺少安全驗證，請重新整理頁面',

  // 權限相關
  PERMISSION_DENIED: '您沒有執行此操作的權限',

  // 系統相關
  SYSTEM_ERROR: '系統錯誤，請稍後再試',
  RATE_LIMITED: '請求過於頻繁，請稍後再試',

  // 驗證相關
  VALIDATION_ERROR: '輸入資料驗證失敗',

  // 網絡相關
  NETWORK_ERROR: '網絡連線錯誤，請檢查您的網絡',
  TIMEOUT: '請求超時，請稍後再試',
}

/**
 * 從 API 錯誤中提取用戶友好的錯誤訊息
 */
export function getErrorMessage(error: unknown): string {
  // Axios 錯誤
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>

    // 網絡錯誤
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return ERROR_MESSAGES.TIMEOUT
      }
      return ERROR_MESSAGES.NETWORK_ERROR
    }

    const { status, data } = axiosError.response

    // 使用錯誤代碼查找訊息
    if (data?.code && ERROR_MESSAGES[data.code]) {
      return ERROR_MESSAGES[data.code]
    }

    // 使用 API 返回的訊息
    if (data?.message) {
      return data.message
    }

    // 驗證錯誤
    if (data?.errors && data.errors.length > 0) {
      return data.errors.map((e) => e.msg).join('; ')
    }

    // 根據 HTTP 狀態碼返回通用訊息
    switch (status) {
      case 400:
        return '請求參數錯誤'
      case 401:
        return '請先登入'
      case 403:
        return '您沒有權限執行此操作'
      case 404:
        return '請求的資源不存在'
      case 409:
        return '資料衝突，請重新整理後再試'
      case 429:
        return ERROR_MESSAGES.RATE_LIMITED
      case 500:
        return '伺服器錯誤，請稍後再試'
      default:
        return `請求失敗 (${status})`
    }
  }

  // 一般錯誤
  if (error instanceof Error) {
    return error.message
  }

  // 字串錯誤
  if (typeof error === 'string') {
    return error
  }

  return '發生未知錯誤'
}

/**
 * 檢查是否為 Axios 錯誤
 */
function isAxiosError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true
  )
}

/**
 * 檢查是否為認證錯誤
 */
export function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const axiosError = error as AxiosError<ApiErrorResponse>
  return axiosError.response?.status === 401
}

/**
 * 檢查是否為權限錯誤
 */
export function isPermissionError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const axiosError = error as AxiosError<ApiErrorResponse>
  return axiosError.response?.status === 403
}

/**
 * 檢查是否為網絡錯誤
 */
export function isNetworkError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const axiosError = error as AxiosError
  return !axiosError.response
}
