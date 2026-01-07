import axios from 'axios'

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 🍪 啟用 Cookie（CSRF Token 需要）
  headers: {
    'Content-Type': 'application/json',
  },
})

// 🔒 從 Cookie 獲取 CSRF Token
const getCsrfToken = (): string | null => {
  const name = 'XSRF-TOKEN='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim()
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return null
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 🛡️ 添加強化的 CSRF 保護（雙重提交 Cookie）
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      if (window.location.pathname.includes('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface PaymentData {
  paid_at: string
  payment_method: string
  last_five?: string
  amount: number
  note?: string
  store_id?: number
}

export interface PaymentRecord extends PaymentData {
  uuid: string
  status: '未確認' | '已入帳' | '未入帳'
  store_id: number
  created_at: string
}

export interface CustomerOrderData {
  order_date: string
  products: string
  customer_name: string
  customer_phone: string
  payment_status: '已付款' | '未付款'
  logistics: string
  remarks?: string
  amount?: number
  store_id: number
}

export interface CustomerOrderRecord extends CustomerOrderData {
  id: number
  status: '進行中' | '已完成'
  created_by: string
  created_at: string
  updated_at: string
  store_name?: string
  store_code?: string
}

export interface StoreData {
  id: number
  name: string
  code: string
  address?: string
  phone?: string
  manager?: string
  is_active: boolean
  created_at: string
}

export interface AuditLogRecord {
  id: number
  user_id: number
  username: string
  action: 'create' | 'update' | 'delete' | 'login'
  resource_type: 'payment' | 'user' | 'store' | 'system'
  resource_id?: string | null
  details: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// 分頁回應介面
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters?: any
}

// 查詢篩選條件介面
export interface PaymentFilters {
  page?: number
  limit?: number
  status?: '未確認' | '已入帳' | '未入帳'
  payment_method?: '現金' | '匯款' | '電子支付' | '店內支出' | '提領' | string
  payment_methods?: ('現金' | '匯款' | '電子支付' | '店內支出' | '提領')[]
  store_id?: number
  store_ids?: number[]
  start_date?: string
  end_date?: string
  search?: string
}

export const paymentApi = {
  create: (data: PaymentData) => api.post<{ uuid: string }>('/payments', data),
  
  // 舊版API（保持向後兼容） - 獲取所有數據，不分頁
  // 注意：後端已限制最大 1000 筆，如需完整資料請使用分頁 API
  getAll: () => api.get<PaginatedResponse<PaymentRecord>>('/payments?limit=1000'),
  
  // 新版分頁API
  getPaginated: (filters?: PaymentFilters) => {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    
    // 单选付款方式（向后兼容）
    if (filters?.payment_method) params.append('payment_method', filters.payment_method)
    // 多选付款方式
    if (filters?.payment_methods && filters.payment_methods.length > 0) {
      params.append('payment_methods', filters.payment_methods.join(','))
    }
    
    // 单选分店（向后兼容）
    if (filters?.store_id) params.append('store_id', filters.store_id.toString())
    // 多选分店
    if (filters?.store_ids && filters.store_ids.length > 0) {
      params.append('store_ids', filters.store_ids.join(','))
    }
    
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    const url = queryString ? `/payments?${queryString}` : '/payments'
    
    return api.get<PaginatedResponse<PaymentRecord>>(url)
  },
  
  update: (uuid: string, data: Partial<PaymentRecord>) => 
    api.put<PaymentRecord>(`/payments/${uuid}`, data),
  delete: (uuid: string) => api.delete<{ message: string }>(`/payments/${uuid}`),
  batchDelete: (uuids: string[]) => api.delete<{ message: string; deletedCount: number }>('/payments', { data: { uuids } }),
  bulkImport: (data: PaymentData[]) => api.post<{ imported: number; errors: string[] }>('/payments/bulk-import', { payments: data }),
}

export const adminApi = {
  login: (credentials: { username: string; password: string }) => 
    api.post<{ token: string }>('/admin/login', credentials),
  logout: () => api.post<{ message: string }>('/admin/logout'),
}

export interface UserRecord {
  id: number
  username: string
  role: 'admin' | 'user'
  permissions: string[]
  store_id?: number | null
  accessible_stores?: number[]
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface UserInput {
  username: string
  password: string
  role: 'admin' | 'user'
  permissions?: string[]
  store_id?: number | null
  accessible_stores?: number[]
}

export const userApi = {
  getAll: () => api.get<UserRecord[]>('/users'),
  getById: (id: number) => api.get<UserRecord>(`/users/${id}`),
  create: (data: UserInput) => api.post<UserRecord>('/users', data),
  update: (id: number, data: Partial<UserInput & { is_active: boolean }>) => 
    api.put<UserRecord>(`/users/${id}`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/users/${id}`),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post<{ message: string }>('/users/change-password', data),
  adminResetPassword: (id: number, data: { newPassword: string }) =>
    api.post<{ message: string }>(`/users/${id}/admin-reset-password`, data),
}

export const storeApi = {
  getAll: () => api.get<StoreData[]>('/stores/public'),
  getAllAdmin: () => api.get<StoreData[]>('/stores'), // 管理員專用端點
  getById: (id: number) => api.get<StoreData>(`/stores/${id}`),
  create: (data: Omit<StoreData, 'id' | 'is_active' | 'created_at'>) => api.post<StoreData>('/stores', data),
  update: (id: number, data: Partial<Omit<StoreData, 'id' | 'is_active' | 'created_at'>>) => 
    api.put<StoreData>(`/stores/${id}`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/stores/${id}`),
  getPayments: (id: number) => api.get<PaymentRecord[]>(`/stores/${id}/payments`),
}

export const auditApi = {
  getAll: (page: number = 1, limit: number = 50, action?: string, resourceType?: string) => {
    let url = `/audit?page=${page}&limit=${limit}`
    if (action) url += `&action=${action}`
    if (resourceType) url += `&resource_type=${resourceType}`
    return api.get<{ success: boolean; data: AuditLogRecord[]; pagination: any }>(url)
  },
  getByUser: (userId: number, limit: number = 50) => 
    api.get<{ success: boolean; data: AuditLogRecord[] }>(`/audit/user/${userId}?limit=${limit}`),
  getByResource: (resourceType: string, resourceId?: string, limit: number = 50) => 
    api.get<{ success: boolean; data: AuditLogRecord[] }>(`/audit/resource/${resourceType}?${resourceId ? `resourceId=${resourceId}&` : ''}limit=${limit}`),
}

// 安全的用戶信息獲取函數 - 不再直接解析 JWT
export const getCurrentUserInfo = async (): Promise<UserRecord | null> => {
  const token = localStorage.getItem('admin_token')
  if (!token) return null
  
  try {
    const response = await api.get<UserRecord>('/admin/me')
    return response.data
  } catch (error) {
    console.error('Failed to get current user info:', error)
    // 如果 token 無效，清除它
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
    }
    return null
  }
}

// 獲取用戶名 - 通過後端 API 而不是解析 JWT
export const getUsernameFromToken = async (): Promise<string | null> => {
  const userInfo = await getCurrentUserInfo()
  return userInfo?.username || null
}

// 資料庫備份相關介面
export interface BackupInfo {
  filename: string
  size: number
  created: string
  modified: string
}

export interface BackupResult {
  filename: string
  size: number
  path: string
}

// 資料庫備份 API
export const backupApi = {
  // 創建資料庫備份
  createBackup: () => 
    api.post<{ success: boolean; message: string; backup: BackupResult }>('/backup/database'),
  
  // 列出可用的備份檔案
  listBackups: () => 
    api.get<{ success: boolean; backups: BackupInfo[] }>('/backup/list'),
  
  // 下載備份檔案
  downloadBackup: async (filename: string) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未找到認證 token')
    }
    
    const url = `${API_BASE_URL}/backup/download/${filename}?token=${token}`
    
    try {
      // 使用 fetch 先檢查響應
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        // 如果響應不成功，嘗試解析錯誤訊息
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.message || '下載失敗')
        } else {
          throw new Error(`下載失敗: ${response.status} ${response.statusText}`)
        }
      }
      
      // 如果響應成功，創建下載連結
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      return { success: true, message: '下載成功' }
    } catch (error) {
      console.error('Download error:', error)
      throw error
    }
  },

  // 匯入資料庫
  importDatabase: (file: File) => {
    const formData = new FormData()
    formData.append('database', file)

    // 獲取 CSRF Token 手動添加到 header
    const csrfToken = getCsrfToken()

    return api.post<{ success: boolean; message: string; import: BackupResult }>('/backup/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
      },
    })
  }
}

// 客訂單 API
export const customerOrderApi = {
  // 創建客訂單
  create: (data: CustomerOrderData) => api.post<{ message: string; order: CustomerOrderRecord }>('/customer-orders', data),
  
  // 獲取所有客訂單
  getAll: () => api.get<{ orders: CustomerOrderRecord[]; total: number }>('/customer-orders'),
  
  // 根據ID獲取客訂單
  getById: (id: number) => api.get<CustomerOrderRecord>(`/customer-orders/${id}`),
  
  // 更新客訂單狀態
  updateStatus: (id: number, status: '進行中' | '已完成') => 
    api.patch<{ message: string; order: CustomerOrderRecord }>(`/customer-orders/${id}/status`, { status }),
  
  // 更新客訂單 (所有欄位)
  update: (id: number, data: Partial<CustomerOrderData>) => 
    api.patch<{ message: string; order: CustomerOrderRecord }>(`/customer-orders/${id}`, data),
  
  // 刪除客訂單
  delete: (id: number) => api.delete<{ message: string }>(`/customer-orders/${id}`)
}