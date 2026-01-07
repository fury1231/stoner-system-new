import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface AutoRefreshOptions {
  interval?: number // 刷新間隔（毫秒），預設 5 分鐘
  enabled?: boolean // 初始啟用狀態
  onRefresh: () => Promise<void> | void // 刷新回調函數
}

export function useAutoRefresh(options: AutoRefreshOptions) {
  const {
    interval: defaultInterval = 5 * 60 * 1000,
    enabled: initialEnabled = true,
    onRefresh,
  } = options

  // 狀態
  const autoRefreshEnabled = ref(initialEnabled)
  const refreshInterval = ref(defaultInterval)
  const lastRefreshTime = ref<Date | null>(null)
  const nextRefreshTime = ref<Date | null>(null)
  const refreshCountdown = ref(0)
  const isRefreshing = ref(false)

  // 內部計時器
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  // 計算屬性
  const formattedCountdown = computed(() => {
    const minutes = Math.floor(refreshCountdown.value / 60)
    const seconds = refreshCountdown.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  const formattedLastRefresh = computed(() => {
    if (!lastRefreshTime.value) return '尚未刷新'
    return lastRefreshTime.value.toLocaleTimeString('zh-TW')
  })

  // 清除計時器
  const clearTimers = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  // 更新倒數計時
  const updateCountdown = () => {
    if (nextRefreshTime.value) {
      const remaining = Math.max(0, Math.round((nextRefreshTime.value.getTime() - Date.now()) / 1000))
      refreshCountdown.value = remaining
    }
  }

  // 啟動自動刷新
  const startAutoRefresh = () => {
    clearTimers()

    if (!autoRefreshEnabled.value) return

    // 設置下次刷新時間
    nextRefreshTime.value = new Date(Date.now() + refreshInterval.value)
    refreshCountdown.value = Math.round(refreshInterval.value / 1000)

    // 啟動倒數計時器
    countdownTimer = setInterval(updateCountdown, 1000)

    // 設置刷新計時器
    refreshTimer = setTimeout(async () => {
      await refresh()
      startAutoRefresh() // 重新啟動計時器
    }, refreshInterval.value)
  }

  // 執行刷新
  const refresh = async () => {
    isRefreshing.value = true
    try {
      await onRefresh()
      lastRefreshTime.value = new Date()
    } finally {
      isRefreshing.value = false
    }
  }

  // 手動刷新並重置計時器
  const manualRefresh = async () => {
    await refresh()
    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    }
  }

  // 切換自動刷新
  const toggleAutoRefresh = () => {
    autoRefreshEnabled.value = !autoRefreshEnabled.value
    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    } else {
      clearTimers()
      refreshCountdown.value = 0
      nextRefreshTime.value = null
    }
  }

  // 設置刷新間隔
  const setRefreshInterval = (newInterval: number) => {
    refreshInterval.value = newInterval
    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    }
  }

  // 生命週期
  onMounted(() => {
    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    clearTimers()
  })

  return {
    // 狀態
    autoRefreshEnabled,
    refreshInterval,
    lastRefreshTime,
    nextRefreshTime,
    refreshCountdown,
    isRefreshing,
    // 計算屬性
    formattedCountdown,
    formattedLastRefresh,
    // 方法
    refresh,
    manualRefresh,
    toggleAutoRefresh,
    setRefreshInterval,
    startAutoRefresh,
    clearTimers,
  }
}
