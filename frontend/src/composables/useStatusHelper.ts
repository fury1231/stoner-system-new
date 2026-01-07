/**
 * 狀態輔助工具 composable
 * 提供付款狀態的 CSS 類別和文字
 */
export type PaymentStatus = '未確認' | '已入帳' | '未入帳'

export function useStatusHelper() {
  // 取得狀態 badge 的 CSS 類別
  const getStatusClass = (status: string): string => {
    switch (status) {
      case '未確認':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium'
      case '已入帳':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'
      case '未入帳':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium'
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'
    }
  }

  // 取得狀態 select 的 CSS 類別
  const getStatusSelectClass = (status: string): string => {
    switch (status) {
      case '未確認':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800'
      case '已入帳':
        return 'bg-green-50 border-green-300 text-green-800'
      case '未入帳':
        return 'bg-red-50 border-red-300 text-red-800'
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800'
    }
  }

  // 取得狀態文字
  const getStatusText = (status: string): string => {
    return status || '未知'
  }

  // 狀態列表
  const statusOptions: PaymentStatus[] = ['未確認', '已入帳', '未入帳']

  return {
    getStatusClass,
    getStatusSelectClass,
    getStatusText,
    statusOptions,
  }
}
