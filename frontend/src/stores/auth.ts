import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApi, getCurrentUserInfo, type UserRecord } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  // 狀態
  const user = ref<UserRecord | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 計算屬性
  const isAuthenticated = computed(() => !!user.value)
  const username = computed(() => user.value?.username || '')
  const userRole = computed(() => user.value?.role || '')
  const userPermissions = computed(() => user.value?.permissions || [])
  const userStoreId = computed(() => user.value?.store_id)
  const accessibleStores = computed(() => user.value?.accessible_stores || [])

  // 檢查特定權限
  const hasPermission = (permission: string): boolean => {
    if (user.value?.role === 'admin') return true
    return userPermissions.value.includes(permission)
  }

  // 初始化用戶狀態（從 API 獲取）
  const initializeAuth = async (): Promise<boolean> => {
    const authFlag = localStorage.getItem('is_authenticated')
    if (!authFlag) {
      user.value = null
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const userInfo = await getCurrentUserInfo()
      if (userInfo) {
        user.value = userInfo
        return true
      } else {
        user.value = null
        localStorage.removeItem('is_authenticated')
        return false
      }
    } catch (e: any) {
      error.value = e.message || '獲取用戶資訊失敗'
      user.value = null
      localStorage.removeItem('is_authenticated')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 登入
  const login = async (credentials: { username: string; password: string }): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await adminApi.login(credentials)
      localStorage.setItem('is_authenticated', 'true')

      // 獲取用戶資訊
      const userInfo = await getCurrentUserInfo()
      if (userInfo) {
        user.value = userInfo
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '登入失敗'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      await adminApi.logout()
    } catch (e) {
      // 即使 API 失敗也清除本地狀態
    } finally {
      user.value = null
      localStorage.removeItem('is_authenticated')
      isLoading.value = false
    }
  }

  // 重新載入用戶資訊
  const refreshUser = async (): Promise<void> => {
    if (!isAuthenticated.value) return

    try {
      const userInfo = await getCurrentUserInfo()
      if (userInfo) {
        user.value = userInfo
      }
    } catch (e) {
      // 忽略錯誤，保持現有狀態
    }
  }

  return {
    // 狀態
    user,
    isLoading,
    error,
    // 計算屬性
    isAuthenticated,
    username,
    userRole,
    userPermissions,
    userStoreId,
    accessibleStores,
    // 方法
    hasPermission,
    initializeAuth,
    login,
    logout,
    refreshUser,
  }
})
