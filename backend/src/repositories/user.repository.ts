import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { BaseRepository } from './base.repository.js'
import { UserRecord, UserInput } from './types.js'

/**
 * 用戶 Repository
 */
export class UserRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool)
  }

  /**
   * 取得所有用戶
   */
  async getAll(): Promise<UserRecord[]> {
    return this.query<UserRecord>(
      'SELECT * FROM users ORDER BY id ASC'
    )
  }

  /**
   * 根據 ID 取得用戶
   */
  async getById(id: number): Promise<UserRecord | null> {
    return this.queryOne<UserRecord>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    )
  }

  /**
   * 根據用戶名取得用戶
   */
  async getByUsername(username: string): Promise<UserRecord | null> {
    return this.queryOne<UserRecord>(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )
  }

  /**
   * 建立用戶
   */
  async create(user: UserInput): Promise<UserRecord> {
    const passwordHash = await bcrypt.hash(user.password, 10)
    const result = await this.queryOne<UserRecord>(
      `INSERT INTO users (username, password_hash, role, permissions, store_id, accessible_stores)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user.username,
        passwordHash,
        user.role,
        JSON.stringify(user.permissions || []),
        user.store_id || null,
        JSON.stringify(user.accessible_stores || [])
      ]
    )
    return result!
  }

  /**
   * 更新用戶
   */
  async update(id: number, updates: Partial<UserInput> & { is_active?: boolean }): Promise<UserRecord | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (updates.username !== undefined) {
      fields.push(`username = $${paramIndex++}`)
      values.push(updates.username)
    }
    if (updates.password !== undefined) {
      fields.push(`password_hash = $${paramIndex++}`)
      values.push(await bcrypt.hash(updates.password, 10))
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex++}`)
      values.push(updates.role)
    }
    if (updates.permissions !== undefined) {
      fields.push(`permissions = $${paramIndex++}`)
      values.push(JSON.stringify(updates.permissions))
    }
    if (updates.store_id !== undefined) {
      fields.push(`store_id = $${paramIndex++}`)
      values.push(updates.store_id)
    }
    if (updates.accessible_stores !== undefined) {
      fields.push(`accessible_stores = $${paramIndex++}`)
      values.push(JSON.stringify(updates.accessible_stores))
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`)
      values.push(updates.is_active)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)

    if (fields.length === 1) return this.getById(id)

    values.push(id)
    return this.queryOne<UserRecord>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
  }

  /**
   * 更新用戶密碼
   */
  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    const rowCount = await this.execute(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    )
    return rowCount > 0
  }

  /**
   * 驗證用戶密碼
   */
  async verifyPassword(username: string, password: string): Promise<UserRecord | null> {
    const user = await this.getByUsername(username)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password_hash)
    return isValid ? user : null
  }

  /**
   * 刪除用戶
   */
  async delete(id: number): Promise<boolean> {
    const rowCount = await this.execute(
      'DELETE FROM users WHERE id = $1',
      [id]
    )
    return rowCount > 0
  }

  /**
   * 建立或更新用戶 (upsert)
   */
  async createOrUpdate(user: {
    username: string
    password_hash: string
    role: 'admin' | 'user'
    permissions?: string[]
    store_id?: number | null
    accessible_stores?: number[]
    is_active?: boolean
  }): Promise<UserRecord> {
    const result = await this.queryOne<UserRecord>(
      `INSERT INTO users (username, password_hash, role, permissions, store_id, accessible_stores, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (username) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         permissions = EXCLUDED.permissions,
         store_id = EXCLUDED.store_id,
         accessible_stores = EXCLUDED.accessible_stores,
         is_active = EXCLUDED.is_active,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        user.username,
        user.password_hash,
        user.role,
        JSON.stringify(user.permissions || []),
        user.store_id || null,
        JSON.stringify(user.accessible_stores || []),
        user.is_active !== undefined ? user.is_active : true
      ]
    )
    return result!
  }
}
