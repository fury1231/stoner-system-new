/**
 * 資料庫類型定義
 * 從 db.ts 抽取出來的介面定義
 */

// ==================== Store ====================

export interface StoreRecord {
  id: number
  name: string
  code: string
  address?: string
  phone?: string
  manager?: string
  is_active: boolean
  created_at: string
}

export interface StoreInput {
  name: string
  code: string
  address?: string
  phone?: string
  manager?: string
}

// ==================== Payment ====================

export type PaymentStatus = '未確認' | '已入帳' | '未入帳'

export interface PaymentRecord {
  uuid: string
  paid_at: string
  payment_method: string
  last_five?: string | null
  amount: number
  note?: string
  status: PaymentStatus
  store_id: number
  processed_by?: string | undefined
  created_at: string
}

export interface PaymentInput {
  paid_at: string
  payment_method: string
  last_five?: string | null
  amount: number
  note?: string
  store_id: number
  processed_by?: string
  status?: PaymentStatus
}

export interface PaymentFilters {
  store_id?: number
  status?: PaymentStatus
  payment_method?: string
  date_start?: string
  date_end?: string
  search?: string
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ==================== User ====================

export type UserRole = 'admin' | 'user'

export interface UserRecord {
  id: number
  username: string
  password_hash: string
  role: UserRole
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
  role: UserRole
  permissions?: string[]
  store_id?: number | null
  accessible_stores?: number[]
}

// ==================== AuditLog ====================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view'
export type AuditResourceType = 'payment' | 'user' | 'store' | 'system'

export interface AuditLogRecord {
  id: number
  user_id: number | null
  username: string
  action: AuditAction
  resource_type: AuditResourceType
  resource_id?: string | null
  details: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface AuditLogInput {
  user_id: number | null
  username: string
  action: AuditAction
  resource_type: AuditResourceType
  resource_id?: string | null
  details: string
  ip_address?: string | undefined
  user_agent?: string | undefined
}

// ==================== CustomerOrder ====================

export type OrderPaymentStatus = '已付款' | '未付款'
export type OrderStatus = '進行中' | '已完成' | '已刪除'

export interface CustomerOrderRecord {
  id: number
  order_date: string
  products: string
  customer_name: string
  customer_phone: string
  payment_status: OrderPaymentStatus
  logistics: string
  remarks?: string
  amount?: number
  status: OrderStatus
  store_id: number
  created_by: string
  created_at: string
  updated_at: string
  store_name?: string
  store_code?: string
}

export interface CustomerOrderInput {
  order_date: string
  products: string
  customer_name: string
  customer_phone: string
  payment_status: OrderPaymentStatus
  logistics: string
  remarks?: string
  amount?: number
  store_id: number
  created_by: string
}

// ==================== Statistics ====================

export interface CashStatistics {
  totalCash: number
  todayCash: number
  totalExpenses: number
  todayExpenses: number
  currentCash: number
}

export interface StoreCashStatistics extends CashStatistics {
  store_id: number
  store_name: string
  store_code: string
}
