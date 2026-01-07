import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsernameFromToken, getCurrentUserInfo, adminApi, type UserRecord, type StoreData } from '../utils/api'

export function useAuth() {
  const router = useRouter()

  const currentUser = ref<string | null>(null)
  const currentUserInfo = ref<UserRecord | null>(null)
  const isLoading = ref(true)

  // 權限檢查函數
  const hasPermission = (permission: string): boolean => {
    if (!currentUserInfo.value) return false

    // 管理員擁有所有權限
    if (currentUserInfo.value.role === 'admin') return true

    // 檢查用戶是否有對應權限
    return currentUserInfo.value.permissions.includes(permission)
  }

  // 是否為管理員
  const isAdmin = computed(() => currentUserInfo.value?.role === 'admin')

  // 用戶可訪問的分店 ID 列表
  const accessibleStoreIds = computed(() => {
    if (!currentUserInfo.value) return []

    // 管理員可以訪問所有分店（返回空陣列表示無限制）
    if (currentUserInfo.value.role === 'admin') return []

    return currentUserInfo.value.accessible_stores || []
  })

  // 過濾用戶可訪問的分店
  const filterAccessibleStores = (stores: StoreData[]): StoreData[] => {
    if (!currentUserInfo.value) return []

    // 管理員可以看到所有分店
    if (currentUserInfo.value.role === 'admin') {
      return stores
    }

    // 一般用戶只能看到 accessible_stores 中的分店
    if (currentUserInfo.value.accessible_stores && currentUserInfo.value.accessible_stores.length > 0) {
      return stores.filter(store =>
        currentUserInfo.value!.accessible_stores!.includes(store.id)
      )
    }

    // 如果沒有設定 accessible_stores，則不能訪問任何分店
    return []
  }

  // 初始化用戶資訊
  const initUser = async () => {
    isLoading.value = true
    try {
      currentUser.value = await getUsernameFromToken()

      if (currentUser.value) {
        currentUserInfo.value = await getCurrentUserInfo()
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
      currentUser.value = null
      currentUserInfo.value = null
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await adminApi.logout()
    } catch {
      // 忽略登出錯誤
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('csrfToken')
      router.push('/login')
    }
  }

  // 組件掛載時初始化用戶
  onMounted(() => {
    initUser()
  })

  return {
    currentUser,
    currentUserInfo,
    isLoading,
    isAdmin,
    accessibleStoreIds,
    hasPermission,
    filterAccessibleStores,
    initUser,
    logout,
  }
}
