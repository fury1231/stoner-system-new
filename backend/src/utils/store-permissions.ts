/**
 * 分店權限檢查共用函數
 * 抽取自 payments.ts 和 customer-orders.ts 中重複的權限檢查邏輯
 */

export interface UserWithStoreAccess {
  id: number
  role: 'admin' | 'user'
  store_id?: number | null
  accessible_stores?: number[]
}

/**
 * 取得用戶可訪問的分店 ID 列表
 * @param user 用戶資料
 * @returns 可訪問的分店 ID 陣列（空陣列表示可訪問所有分店）
 */
export function getUserAccessibleStores(user: UserWithStoreAccess): number[] {
  // 管理員可訪問所有分店
  if (user.role === 'admin') {
    return []
  }

  // 優先使用 accessible_stores
  if (user.accessible_stores && user.accessible_stores.length > 0) {
    return user.accessible_stores
  }

  // 次之使用 store_id
  if (user.store_id) {
    return [user.store_id]
  }

  // 沒有任何分店權限
  return []
}

/**
 * 檢查用戶是否有權限訪問指定分店
 * @param user 用戶資料
 * @param storeId 要檢查的分店 ID
 * @returns true 表示有權限
 */
export function canAccessStore(user: UserWithStoreAccess, storeId: number): boolean {
  // 管理員可訪問所有分店
  if (user.role === 'admin') {
    return true
  }

  const accessibleStores = getUserAccessibleStores(user)

  // 空陣列表示可訪問所有分店（理論上只有管理員會是這種情況）
  if (accessibleStores.length === 0) {
    return false // 非管理員但沒有分店權限，拒絕訪問
  }

  return accessibleStores.includes(storeId)
}

/**
 * 檢查用戶是否有任何分店權限
 * @param user 用戶資料
 * @returns true 表示用戶有至少一個分店的訪問權限
 */
export function hasAnyStoreAccess(user: UserWithStoreAccess): boolean {
  if (user.role === 'admin') {
    return true
  }

  const accessibleStores = getUserAccessibleStores(user)
  return accessibleStores.length > 0
}
