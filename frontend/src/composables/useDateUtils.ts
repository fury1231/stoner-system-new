import { ref, computed } from 'vue'

/**
 * 日期工具 composable
 * 提供本地日期字串處理和月份導航功能
 */
export function useDateUtils() {
  // 取得本地日期字串 (YYYY-MM-DD)
  const getLocalDateString = (date?: Date): string => {
    const targetDate = date || new Date()
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 從 ISO 字串取得本地日期 (YYYY-MM-DD)
  const getDateFromISO = (isoString: string): string => {
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 取得月份字串 (YYYY-MM)
  const getMonthString = (date?: Date): string => {
    return getLocalDateString(date).substring(0, 7)
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

  // 格式化月份顯示
  const formatMonthDisplay = (monthString: string): string => {
    const [year, month] = monthString.split('-')
    return `${year}年${parseInt(month)}月`
  }

  return {
    getLocalDateString,
    getDateFromISO,
    getMonthString,
    formatDateDisplay,
    formatMonthDisplay,
  }
}

/**
 * 月份選擇器 composable
 */
export function useMonthSelector(initialMonth?: string) {
  const { getMonthString, formatMonthDisplay } = useDateUtils()

  const selectedMonth = ref(initialMonth || getMonthString())

  const displayMonth = computed(() => formatMonthDisplay(selectedMonth.value))

  const isCurrentMonth = computed(() => selectedMonth.value === getMonthString())

  // 導航到上個月
  const goToPreviousMonth = () => {
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const date = new Date(year, month - 2, 1) // month - 1 - 1
    selectedMonth.value = getMonthString(date)
  }

  // 導航到下個月
  const goToNextMonth = () => {
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const date = new Date(year, month, 1) // month - 1 + 1
    selectedMonth.value = getMonthString(date)
  }

  // 導航到當前月份
  const goToCurrentMonth = () => {
    selectedMonth.value = getMonthString()
  }

  // 設置指定月份
  const setMonth = (month: string) => {
    selectedMonth.value = month
  }

  return {
    selectedMonth,
    displayMonth,
    isCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    setMonth,
  }
}
