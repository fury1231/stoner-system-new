/**
 * Repository Pattern 實作
 *
 * 提供資料庫操作的抽象層，便於測試和維護
 *
 * 使用方式：
 * ```typescript
 * import { StoreRepository, UserRepository, PaymentRepository } from './repositories'
 * import { Pool } from 'pg'
 *
 * const pool = new Pool({ ... })
 * const storeRepo = new StoreRepository(pool)
 * const stores = await storeRepo.getAll()
 * ```
 */

// 類型匯出
export * from './types.js'

// 基礎類別匯出
export { BaseRepository } from './base.repository.js'

// Repository 匯出
export { StoreRepository } from './store.repository.js'
export { UserRepository } from './user.repository.js'
export { PaymentRepository, type PaymentFilters } from './payment.repository.js'
export { AuditRepository } from './audit.repository.js'
export { CustomerOrderRepository } from './customer-order.repository.js'
