import { ref, computed } from 'vue'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

export interface UseMessageOptions {
  duration?: number // 訊息顯示時間（毫秒），預設 3000
}

export function useMessage(options: UseMessageOptions = {}) {
  const { duration = 3000 } = options

  const message = ref('')
  const messageType = ref<MessageType>('info')
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  // 訊息 CSS 類別
  const messageClass = computed(() => {
    const classes: Record<MessageType, string> = {
      success: 'bg-green-100 text-green-800 border border-green-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
    }
    return classes[messageType.value]
  })

  // 是否顯示訊息
  const hasMessage = computed(() => message.value.length > 0)

  // 清除計時器
  const clearHideTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  // 顯示訊息
  const showMessage = (msg: string, type: MessageType = 'info', customDuration?: number) => {
    clearHideTimer()
    message.value = msg
    messageType.value = type

    const timeout = customDuration ?? duration
    if (timeout > 0) {
      hideTimer = setTimeout(() => {
        message.value = ''
      }, timeout)
    }
  }

  // 便捷方法
  const showSuccess = (msg: string, customDuration?: number) => showMessage(msg, 'success', customDuration)
  const showError = (msg: string, customDuration?: number) => showMessage(msg, 'error', customDuration)
  const showWarning = (msg: string, customDuration?: number) => showMessage(msg, 'warning', customDuration)
  const showInfo = (msg: string, customDuration?: number) => showMessage(msg, 'info', customDuration)

  // 清除訊息
  const clearMessage = () => {
    clearHideTimer()
    message.value = ''
  }

  return {
    message,
    messageType,
    messageClass,
    hasMessage,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearMessage,
  }
}
