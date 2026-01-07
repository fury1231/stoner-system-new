import { Pool } from 'pg'
import { BaseRepository } from './base.repository.js'
import { StoreRecord, StoreInput } from './types.js'

/**
 * 分店 Repository
 */
export class StoreRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool)
  }

  /**
   * 取得所有分店
   */
  async getAll(): Promise<StoreRecord[]> {
    return this.query<StoreRecord>(
      'SELECT * FROM stores ORDER BY id ASC'
    )
  }

  /**
   * 根據 ID 取得分店
   */
  async getById(id: number): Promise<StoreRecord | null> {
    return this.queryOne<StoreRecord>(
      'SELECT * FROM stores WHERE id = $1',
      [id]
    )
  }

  /**
   * 根據代碼取得分店
   */
  async getByCode(code: string): Promise<StoreRecord | null> {
    return this.queryOne<StoreRecord>(
      'SELECT * FROM stores WHERE code = $1',
      [code]
    )
  }

  /**
   * 建立分店
   */
  async create(store: StoreInput): Promise<StoreRecord> {
    const result = await this.queryOne<StoreRecord>(
      `INSERT INTO stores (name, code, address, phone, manager)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [store.name, store.code, store.address || null, store.phone || null, store.manager || null]
    )
    return result!
  }

  /**
   * 更新分店
   */
  async update(id: number, updates: Partial<StoreInput> & { is_active?: boolean }): Promise<StoreRecord | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.code !== undefined) {
      fields.push(`code = $${paramIndex++}`)
      values.push(updates.code)
    }
    if (updates.address !== undefined) {
      fields.push(`address = $${paramIndex++}`)
      values.push(updates.address)
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`)
      values.push(updates.phone)
    }
    if (updates.manager !== undefined) {
      fields.push(`manager = $${paramIndex++}`)
      values.push(updates.manager)
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`)
      values.push(updates.is_active)
    }

    if (fields.length === 0) return this.getById(id)

    values.push(id)
    return this.queryOne<StoreRecord>(
      `UPDATE stores SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
  }

  /**
   * 刪除分店
   */
  async delete(id: number): Promise<boolean> {
    const rowCount = await this.execute(
      'DELETE FROM stores WHERE id = $1',
      [id]
    )
    return rowCount > 0
  }

  /**
   * 建立或更新分店 (upsert)
   */
  async createOrUpdate(store: {
    code: string
    name: string
    address?: string
    phone?: string
    manager?: string
    is_active?: boolean
  }): Promise<StoreRecord> {
    const result = await this.queryOne<StoreRecord>(
      `INSERT INTO stores (code, name, address, phone, manager, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE SET
         name = EXCLUDED.name,
         address = EXCLUDED.address,
         phone = EXCLUDED.phone,
         manager = EXCLUDED.manager,
         is_active = EXCLUDED.is_active
       RETURNING *`,
      [
        store.code,
        store.name,
        store.address || null,
        store.phone || null,
        store.manager || null,
        store.is_active !== undefined ? store.is_active : true
      ]
    )
    return result!
  }
}
