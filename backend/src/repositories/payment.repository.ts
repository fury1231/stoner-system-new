import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'
import { BaseRepository } from './base.repository.js'
import { PaymentRecord, PaymentInput, PaymentStatus, PaginatedResult } from './types.js'

export interface PaymentFilters {
  store_id?: number
  status?: PaymentStatus
  payment_method?: string
  start_date?: string
  end_date?: string
  search?: string
  accessible_stores?: number[]
}

/**
 * 付款 Repository
 */
export class PaymentRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool)
  }

  /**
   * 建立付款記錄
   */
  async create(payment: PaymentInput): Promise<PaymentRecord> {
    const uuid = uuidv4()
    const result = await this.queryOne<PaymentRecord>(
      `INSERT INTO payments (uuid, paid_at, payment_method, last_five, amount, note, status, store_id, processed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        uuid,
        payment.paid_at,
        payment.payment_method,
        payment.last_five || null,
        payment.amount,
        payment.note || null,
        payment.status || '已入帳',
        payment.store_id,
        payment.processed_by || null
      ]
    )
    return result!
  }

  /**
   * 根據 UUID 取得付款記錄
   */
  async getByUuid(uuid: string): Promise<PaymentRecord | null> {
    return this.queryOne<PaymentRecord>(
      'SELECT * FROM payments WHERE uuid = $1',
      [uuid]
    )
  }

  /**
   * 根據多個 UUID 取得付款記錄
   */
  async getByUuids(uuids: string[]): Promise<PaymentRecord[]> {
    if (uuids.length === 0) return []
    const placeholders = uuids.map((_, i) => `$${i + 1}`).join(', ')
    return this.query<PaymentRecord>(
      `SELECT * FROM payments WHERE uuid IN (${placeholders})`,
      uuids
    )
  }

  /**
   * 根據分店取得付款記錄
   */
  async getByStore(storeId: number): Promise<PaymentRecord[]> {
    return this.query<PaymentRecord>(
      'SELECT * FROM payments WHERE store_id = $1 ORDER BY paid_at DESC',
      [storeId]
    )
  }

  /**
   * 分頁取得付款記錄
   */
  async getPaginated(
    offset: number,
    limit: number,
    filters?: PaymentFilters
  ): Promise<{ payments: PaymentRecord[]; total: number }> {
    const whereConditions: string[] = []
    const params: unknown[] = []
    let paramCount = 1

    if (filters?.store_id) {
      whereConditions.push(`store_id = $${paramCount}`)
      params.push(filters.store_id)
      paramCount++
    }

    if (filters?.accessible_stores && filters.accessible_stores.length > 0) {
      const placeholders = filters.accessible_stores.map((_, i) => `$${paramCount + i}`).join(', ')
      whereConditions.push(`store_id IN (${placeholders})`)
      params.push(...filters.accessible_stores)
      paramCount += filters.accessible_stores.length
    }

    if (filters?.status) {
      whereConditions.push(`status = $${paramCount}`)
      params.push(filters.status)
      paramCount++
    }

    if (filters?.payment_method) {
      whereConditions.push(`payment_method = $${paramCount}`)
      params.push(filters.payment_method)
      paramCount++
    }

    if (filters?.start_date) {
      const startDate = new Date(`${filters.start_date}T00:00:00+08:00`)
      whereConditions.push(`paid_at >= $${paramCount}`)
      params.push(startDate.toISOString())
      paramCount++
    }

    if (filters?.end_date) {
      const endDate = new Date(`${filters.end_date}T23:59:59.999+08:00`)
      whereConditions.push(`paid_at <= $${paramCount}`)
      params.push(endDate.toISOString())
      paramCount++
    }

    if (filters?.search) {
      const escapedSearch = this.escapeLikePattern(filters.search)
      whereConditions.push(`(note ILIKE $${paramCount} OR last_five ILIKE $${paramCount})`)
      params.push(`%${escapedSearch}%`)
      paramCount++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    const query = `
      WITH filtered AS (
        SELECT * FROM payments ${whereClause}
      ),
      counted AS (
        SELECT COUNT(*) as total FROM filtered
      )
      SELECT f.*, c.total
      FROM filtered f, counted c
      ORDER BY f.paid_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `

    params.push(limit, offset)
    const result = await this.query<PaymentRecord & { total: string }>(query, params)

    const total = result.length > 0 ? parseInt(result[0].total) : 0
    const payments = result.map(({ total: _total, ...payment }) => payment as PaymentRecord)

    return { payments, total }
  }

  /**
   * 更新付款記錄
   */
  async update(uuid: string, updates: Partial<PaymentInput>): Promise<PaymentRecord | null> {
    const allowedFields = ['paid_at', 'payment_method', 'last_five', 'amount', 'note', 'status', 'store_id', 'processed_by']
    const fields: string[] = []
    const values: unknown[] = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    values.push(uuid)
    return this.queryOne<PaymentRecord>(
      `UPDATE payments SET ${fields.join(', ')} WHERE uuid = $${paramCount} RETURNING *`,
      values
    )
  }

  /**
   * 刪除付款記錄
   */
  async delete(uuid: string): Promise<boolean> {
    const rowCount = await this.execute(
      'DELETE FROM payments WHERE uuid = $1',
      [uuid]
    )
    return rowCount > 0
  }

  /**
   * 批量刪除付款記錄
   */
  async batchDelete(uuids: string[]): Promise<number> {
    if (uuids.length === 0) return 0

    return this.withTransaction(async (client) => {
      const placeholders = uuids.map((_, i) => `$${i + 1}`).join(', ')
      const result = await client.query(
        `DELETE FROM payments WHERE uuid IN (${placeholders})`,
        uuids
      )
      return result.rowCount ?? 0
    })
  }

  /**
   * 批量刪除（帶分店權限檢查）
   */
  async batchDeleteWithStoreCheck(uuids: string[], allowedStoreIds: number[]): Promise<number> {
    if (uuids.length === 0 || allowedStoreIds.length === 0) return 0

    return this.withTransaction(async (client) => {
      const uuidPlaceholders = uuids.map((_, i) => `$${i + 1}`).join(', ')
      const storeStartIndex = uuids.length + 1
      const storePlaceholders = allowedStoreIds.map((_, i) => `$${storeStartIndex + i}`).join(', ')

      const result = await client.query(
        `DELETE FROM payments WHERE uuid IN (${uuidPlaceholders}) AND store_id IN (${storePlaceholders})`,
        [...uuids, ...allowedStoreIds]
      )
      return result.rowCount ?? 0
    })
  }

  /**
   * 批量更新狀態
   */
  async batchUpdateStatus(uuids: string[], status: PaymentStatus): Promise<number> {
    if (uuids.length === 0) return 0

    return this.withTransaction(async (client) => {
      const placeholders = uuids.map((_, i) => `$${i + 2}`).join(', ')
      const result = await client.query(
        `UPDATE payments SET status = $1 WHERE uuid IN (${placeholders})`,
        [status, ...uuids]
      )
      return result.rowCount ?? 0
    })
  }

  /**
   * 批量更新狀態（帶分店權限檢查）
   */
  async batchUpdateStatusWithStoreCheck(
    uuids: string[],
    status: PaymentStatus,
    allowedStoreIds: number[]
  ): Promise<number> {
    if (uuids.length === 0 || allowedStoreIds.length === 0) return 0

    return this.withTransaction(async (client) => {
      const uuidPlaceholders = uuids.map((_, i) => `$${i + 2}`).join(', ')
      const storeStartIndex = uuids.length + 2
      const storePlaceholders = allowedStoreIds.map((_, i) => `$${storeStartIndex + i}`).join(', ')

      const result = await client.query(
        `UPDATE payments SET status = $1 WHERE uuid IN (${uuidPlaceholders}) AND store_id IN (${storePlaceholders})`,
        [status, ...uuids, ...allowedStoreIds]
      )
      return result.rowCount ?? 0
    })
  }

  /**
   * 建立或更新付款記錄 (upsert)
   */
  async createOrUpdate(payment: {
    uuid: string
    paid_at: string
    payment_method: string
    last_five?: string | null
    amount: number
    note?: string
    status?: PaymentStatus
    store_id: number
    processed_by?: string
  }): Promise<PaymentRecord> {
    const result = await this.queryOne<PaymentRecord>(
      `INSERT INTO payments (uuid, paid_at, payment_method, last_five, amount, note, status, store_id, processed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (uuid) DO UPDATE SET
         paid_at = EXCLUDED.paid_at,
         payment_method = EXCLUDED.payment_method,
         last_five = EXCLUDED.last_five,
         amount = EXCLUDED.amount,
         note = EXCLUDED.note,
         status = EXCLUDED.status,
         store_id = EXCLUDED.store_id,
         processed_by = EXCLUDED.processed_by
       RETURNING *`,
      [
        payment.uuid,
        payment.paid_at,
        payment.payment_method,
        payment.last_five || null,
        payment.amount,
        payment.note || null,
        payment.status || '已入帳',
        payment.store_id,
        payment.processed_by || null
      ]
    )
    return result!
  }
}
