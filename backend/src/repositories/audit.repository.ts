import { Pool } from 'pg'
import { BaseRepository } from './base.repository.js'
import { AuditLogRecord, AuditLogInput, AuditAction, AuditResourceType } from './types.js'

/**
 * 稽核日誌 Repository
 */
export class AuditRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool)
  }

  /**
   * 建立稽核日誌
   */
  async create(log: AuditLogInput): Promise<AuditLogRecord> {
    const result = await this.queryOne<AuditLogRecord>(
      `INSERT INTO audit_logs (user_id, username, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        log.user_id,
        log.username,
        log.action,
        log.resource_type,
        log.resource_id || null,
        log.details,
        log.ip_address || null,
        log.user_agent || null
      ]
    )
    return result!
  }

  /**
   * 取得所有稽核日誌（分頁）
   */
  async getAll(
    limit: number = 100,
    offset: number = 0,
    action?: AuditAction,
    resourceType?: AuditResourceType
  ): Promise<AuditLogRecord[]> {
    const whereConditions: string[] = []
    const params: unknown[] = []
    let paramCount = 1

    if (action) {
      whereConditions.push(`action = $${paramCount}`)
      params.push(action)
      paramCount++
    }

    if (resourceType) {
      whereConditions.push(`resource_type = $${paramCount}`)
      params.push(resourceType)
      paramCount++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    params.push(limit, offset)
    return this.query<AuditLogRecord>(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    )
  }

  /**
   * 根據用戶取得稽核日誌
   */
  async getByUser(userId: number, limit: number = 50): Promise<AuditLogRecord[]> {
    return this.query<AuditLogRecord>(
      'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    )
  }

  /**
   * 根據資源取得稽核日誌
   */
  async getByResource(
    resourceType: AuditResourceType,
    resourceId?: string,
    limit: number = 50
  ): Promise<AuditLogRecord[]> {
    if (resourceId) {
      return this.query<AuditLogRecord>(
        'SELECT * FROM audit_logs WHERE resource_type = $1 AND resource_id = $2 ORDER BY created_at DESC LIMIT $3',
        [resourceType, resourceId, limit]
      )
    }
    return this.query<AuditLogRecord>(
      'SELECT * FROM audit_logs WHERE resource_type = $1 ORDER BY created_at DESC LIMIT $2',
      [resourceType, limit]
    )
  }

  /**
   * 根據 ID 取得稽核日誌
   */
  async getById(id: number): Promise<AuditLogRecord | null> {
    return this.queryOne<AuditLogRecord>(
      'SELECT * FROM audit_logs WHERE id = $1',
      [id]
    )
  }

  /**
   * 刪除舊的稽核日誌（保留最近 N 天）
   */
  async deleteOlderThan(days: number): Promise<number> {
    const rowCount = await this.execute(
      `DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '${days} days'`
    )
    return rowCount
  }

  /**
   * 取得稽核日誌總數
   */
  async count(action?: AuditAction, resourceType?: AuditResourceType): Promise<number> {
    const whereConditions: string[] = []
    const params: unknown[] = []
    let paramCount = 1

    if (action) {
      whereConditions.push(`action = $${paramCount}`)
      params.push(action)
      paramCount++
    }

    if (resourceType) {
      whereConditions.push(`resource_type = $${paramCount}`)
      params.push(resourceType)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const result = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
      params
    )
    return parseInt(result?.count || '0')
  }

  /**
   * 建立或更新稽核日誌 (upsert by id)
   */
  async createOrUpdate(log: {
    id?: number
    user_id: number | null
    username: string
    action: AuditAction
    resource_type: AuditResourceType
    resource_id?: string | null
    details: string
    ip_address?: string
    user_agent?: string
    created_at?: string
  }): Promise<AuditLogRecord> {
    if (log.id) {
      // 更新現有記錄
      const result = await this.queryOne<AuditLogRecord>(
        `UPDATE audit_logs SET
           user_id = $2,
           username = $3,
           action = $4,
           resource_type = $5,
           resource_id = $6,
           details = $7,
           ip_address = $8,
           user_agent = $9
         WHERE id = $1
         RETURNING *`,
        [
          log.id,
          log.user_id,
          log.username,
          log.action,
          log.resource_type,
          log.resource_id || null,
          log.details,
          log.ip_address || null,
          log.user_agent || null
        ]
      )
      if (result) return result
    }

    // 建立新記錄
    return this.create(log)
  }
}
