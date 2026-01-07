import { createPinia } from 'pinia'

// 建立 Pinia 實例
export const pinia = createPinia()

// 匯出所有 stores
export { useAuthStore } from './auth'
export { usePaymentsStore } from './payments'
