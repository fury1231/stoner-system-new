import { Pool, PoolClient } from 'pg'

/**
 * 基礎 Repository 類別
 * 提供資料庫連接和通用操作
 */
export abstract class BaseRepository {
  protected pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  /**
   * 執行單一查詢
   */
  protected async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.pool.query(sql, params)
    return result.rows
  }

  /**
   * 執行查詢並返回單一結果
   */
  protected async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.pool.query(sql, params)
    return result.rows[0] || null
  }

  /**
   * 執行寫入操作並返回影響的行數
   */
  protected async execute(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.pool.query(sql, params)
    return result.rowCount ?? 0
  }

  /**
   * 在事務中執行操作
   */
  protected async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * 安全地轉義 LIKE 模式
   */
  protected escapeLikePattern(pattern: string): string {
    return pattern
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_')
  }
}
