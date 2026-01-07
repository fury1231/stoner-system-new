import { Pool } from 'pg'
import { BaseRepository } from './base.repository.js'
import { CustomerOrderRecord, CustomerOrderInput, OrderStatus, OrderPaymentStatus } from './types.js'

/**
 * 客訂單 Repository
 */
export class CustomerOrderRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool)
  }

  /**
   * 建立客訂單
   */
  async create(order: CustomerOrderInput): Promise<CustomerOrderRecord> {
    const result = await this.queryOne<CustomerOrderRecord>(
      `INSERT INTO customer_orders (order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, store_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        order.order_date,
        order.products,
        order.customer_name,
        order.customer_phone,
        order.payment_status,
        order.logistics,
        order.remarks || null,
        order.amount || null,
        order.store_id,
        order.created_by
      ]
    )
    return result!
  }

  /**
   * 取得所有客訂單（含分店資訊）
   */
  async getAll(): Promise<CustomerOrderRecord[]> {
    return this.query<CustomerOrderRecord>(
      `SELECT co.*, s.name as store_name, s.code as store_code
       FROM customer_orders co
       LEFT JOIN stores s ON co.store_id = s.id
       WHERE co.status != '已刪除'
       ORDER BY co.order_date DESC, co.created_at DESC`
    )
  }

  /**
   * 根據 ID 取得客訂單
   */
  async getById(id: number): Promise<CustomerOrderRecord | null> {
    return this.queryOne<CustomerOrderRecord>(
      `SELECT co.*, s.name as store_name, s.code as store_code
       FROM customer_orders co
       LEFT JOIN stores s ON co.store_id = s.id
       WHERE co.id = $1`,
      [id]
    )
  }

  /**
   * 根據分店取得客訂單
   */
  async getByStore(storeId: number): Promise<CustomerOrderRecord[]> {
    return this.query<CustomerOrderRecord>(
      `SELECT co.*, s.name as store_name, s.code as store_code
       FROM customer_orders co
       LEFT JOIN stores s ON co.store_id = s.id
       WHERE co.store_id = $1 AND co.status != '已刪除'
       ORDER BY co.order_date DESC, co.created_at DESC`,
      [storeId]
    )
  }

  /**
   * 根據多個分店取得客訂單
   */
  async getByStoreIds(storeIds: number[]): Promise<CustomerOrderRecord[]> {
    if (storeIds.length === 0) return []
    const placeholders = storeIds.map((_, i) => `$${i + 1}`).join(', ')
    return this.query<CustomerOrderRecord>(
      `SELECT co.*, s.name as store_name, s.code as store_code
       FROM customer_orders co
       LEFT JOIN stores s ON co.store_id = s.id
       WHERE co.store_id IN (${placeholders}) AND co.status != '已刪除'
       ORDER BY co.order_date DESC, co.created_at DESC`,
      storeIds
    )
  }

  /**
   * 更新客訂單
   */
  async update(id: number, updates: Partial<CustomerOrderInput>): Promise<CustomerOrderRecord | null> {
    const allowedFields = ['order_date', 'products', 'customer_name', 'customer_phone', 'payment_status', 'logistics', 'remarks', 'amount', 'store_id']
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

    if (fields.length === 0) return this.getById(id)

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    return this.queryOne<CustomerOrderRecord>(
      `UPDATE customer_orders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
  }

  /**
   * 更新客訂單狀態
   */
  async updateStatus(id: number, status: OrderStatus): Promise<CustomerOrderRecord | null> {
    return this.queryOne<CustomerOrderRecord>(
      `UPDATE customer_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    )
  }

  /**
   * 刪除客訂單（軟刪除）
   */
  async delete(id: number): Promise<boolean> {
    const rowCount = await this.execute(
      `UPDATE customer_orders SET status = '已刪除', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    )
    return rowCount > 0
  }

  /**
   * 硬刪除客訂單
   */
  async hardDelete(id: number): Promise<boolean> {
    const rowCount = await this.execute(
      'DELETE FROM customer_orders WHERE id = $1',
      [id]
    )
    return rowCount > 0
  }

  /**
   * 根據狀態取得客訂單
   */
  async getByStatus(status: OrderStatus): Promise<CustomerOrderRecord[]> {
    return this.query<CustomerOrderRecord>(
      `SELECT co.*, s.name as store_name, s.code as store_code
       FROM customer_orders co
       LEFT JOIN stores s ON co.store_id = s.id
       WHERE co.status = $1
       ORDER BY co.order_date DESC, co.created_at DESC`,
      [status]
    )
  }

  /**
   * 根據付款狀態取得客訂單
   */
  async getByPaymentStatus(paymentStatus: OrderPaymentStatus): Promise<CustomerOrderRecord[]> {
    return this.query<CustomerOrderRecord>(
      `SELECT co.*, s.name as store_name, s.code as store_code
       FROM customer_orders co
       LEFT JOIN stores s ON co.store_id = s.id
       WHERE co.payment_status = $1 AND co.status != '已刪除'
       ORDER BY co.order_date DESC, co.created_at DESC`,
      [paymentStatus]
    )
  }

  /**
   * 建立或更新客訂單 (upsert by id)
   */
  async createOrUpdate(order: {
    id?: number
    order_date: string
    products: string
    customer_name: string
    customer_phone: string
    payment_status: OrderPaymentStatus
    logistics: string
    remarks?: string
    amount?: number
    status?: OrderStatus
    store_id: number
    created_by: string
    created_at?: string
  }): Promise<CustomerOrderRecord> {
    if (order.id) {
      // 更新現有記錄
      const result = await this.queryOne<CustomerOrderRecord>(
        `UPDATE customer_orders SET
           order_date = $2,
           products = $3,
           customer_name = $4,
           customer_phone = $5,
           payment_status = $6,
           logistics = $7,
           remarks = $8,
           amount = $9,
           status = $10,
           store_id = $11,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [
          order.id,
          order.order_date,
          order.products,
          order.customer_name,
          order.customer_phone,
          order.payment_status,
          order.logistics,
          order.remarks || null,
          order.amount || null,
          order.status || '進行中',
          order.store_id
        ]
      )
      if (result) return result
    }

    // 建立新記錄
    return this.create(order)
  }
}
