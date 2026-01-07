/**
 * 格式化工具 composable
 * 提供貨幣、日期時間、檔案大小等格式化功能
 */
export function useFormatters() {
  // 格式化貨幣
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // 格式化日期時間
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-TW')
  }

  // 格式化日期時間（用於 input）
  const formatDateTimeForInput = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  // 格式化日期顯示
  const formatDateDisplay = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // 格式化檔案大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 格式化月份顯示
  const formatMonthDisplay = (monthString: string): string => {
    const [year, month] = monthString.split('-')
    return `${year}年${parseInt(month)}月`
  }

  // 格式化日期範圍顯示
  const formatRangeDisplay = (startDate: string, endDate: string): string => {
    if (!startDate && !endDate) return ''
    if (startDate && endDate) {
      if (startDate === endDate) {
        return formatDateDisplay(startDate)
      }
      return `${formatDateDisplay(startDate)} 至 ${formatDateDisplay(endDate)}`
    }
    if (startDate) return `${formatDateDisplay(startDate)} 起`
    if (endDate) return `至 ${formatDateDisplay(endDate)}`
    return ''
  }

  return {
    formatCurrency,
    formatDateTime,
    formatDateTimeForInput,
    formatDateDisplay,
    formatFileSize,
    formatMonthDisplay,
    formatRangeDisplay,
  }
}
