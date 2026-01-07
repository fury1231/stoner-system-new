import Database from 'better-sqlite3'
import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const BATCH_SIZE = 100

async function importSQLiteToPostgreSQL() {
  const sqlitePath = process.argv[2] || '/var/www/stoner-system-old/data/database.sqlite'

  console.log('=== SQLite 匯入 PostgreSQL 開始 ===')
  console.log('SQLite 路徑:', sqlitePath)

  // 連接 SQLite
  const sqliteDb = new Database(sqlitePath, { readonly: true })

  // 連接 PostgreSQL
  const pool = new pg.Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'stoner_system',
    user: process.env.PG_USERNAME || 'stoner',
    password: process.env.PG_PASSWORD
  })

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 匯入順序（依外鍵關係）
    const tables = ['stores', 'users', 'payments', 'customer_orders', 'audit_logs']

    for (const tableName of tables) {
      try {
        const rows = sqliteDb.prepare(`SELECT * FROM ${tableName}`).all() as Record<string, unknown>[]
        console.log(`匯入 ${tableName}: ${rows.length} 筆`)

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE)
          for (const row of batch) {
            await importRow(client, tableName, row)
          }
        }
      } catch (err) {
        console.log(`表 ${tableName} 不存在或錯誤，跳過`)
      }
    }

    // 重設序列
    console.log('重設 PostgreSQL 序列...')
    await client.query(`SELECT setval('stores_id_seq', COALESCE((SELECT MAX(id) FROM stores), 0) + 1, false)`)
    await client.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false)`)
    await client.query(`SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 0) + 1, false)`)
    await client.query(`SELECT setval('customer_orders_id_seq', COALESCE((SELECT MAX(id) FROM customer_orders), 0) + 1, false)`)

    await client.query('COMMIT')
    console.log('=== 匯入完成 ===')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('匯入失敗:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
    sqliteDb.close()
  }
}

async function importRow(client: pg.PoolClient, tableName: string, row: Record<string, unknown>) {
  switch (tableName) {
    case 'stores': {
      const { id, name, code, address, phone, manager, is_active, created_at } = row as any
      await client.query(
        `INSERT INTO stores (id, name, code, address, phone, manager, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, code = EXCLUDED.code, address = EXCLUDED.address,
           phone = EXCLUDED.phone, manager = EXCLUDED.manager, is_active = EXCLUDED.is_active`,
        [id, name, code, address, phone, manager, Boolean(is_active), created_at]
      )
      break
    }
    case 'users': {
      const { id, username, password_hash, role, permissions, store_id, accessible_stores, is_active, created_at } = row as any
      await client.query(
        `INSERT INTO users (id, username, password_hash, role, permissions, store_id, accessible_stores, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (username) DO UPDATE SET
           password_hash = EXCLUDED.password_hash, role = EXCLUDED.role,
           permissions = EXCLUDED.permissions, store_id = EXCLUDED.store_id, accessible_stores = EXCLUDED.accessible_stores,
           is_active = EXCLUDED.is_active`,
        [id, username, password_hash, role, permissions, store_id, accessible_stores, Boolean(is_active), created_at]
      )
      break
    }
    case 'payments': {
      const { uuid, last_five, paid_at, amount, note, status, store_id, payment_method, processed_by, created_at } = row as any
      await client.query(
        `INSERT INTO payments (uuid, last_five, paid_at, amount, note, status, store_id, payment_method, processed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (uuid) DO UPDATE SET
           last_five = EXCLUDED.last_five, paid_at = EXCLUDED.paid_at, amount = EXCLUDED.amount,
           note = EXCLUDED.note, status = EXCLUDED.status, store_id = EXCLUDED.store_id,
           payment_method = EXCLUDED.payment_method, processed_by = EXCLUDED.processed_by`,
        [uuid, last_five, paid_at, amount ?? 0, note, status, store_id, payment_method, processed_by, created_at]
      )
      break
    }
    case 'customer_orders': {
      const { id, order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, status, store_id, created_by, created_at, updated_at } = row as any
      await client.query(
        `INSERT INTO customer_orders (id, order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount, status, store_id, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           order_date = EXCLUDED.order_date, products = EXCLUDED.products, customer_name = EXCLUDED.customer_name,
           customer_phone = EXCLUDED.customer_phone, payment_status = EXCLUDED.payment_status, logistics = EXCLUDED.logistics,
           remarks = EXCLUDED.remarks, amount = EXCLUDED.amount, status = EXCLUDED.status,
           store_id = EXCLUDED.store_id, created_by = EXCLUDED.created_by, updated_at = EXCLUDED.updated_at`,
        [id, order_date, products, customer_name, customer_phone, payment_status, logistics, remarks, amount ?? 0, status, store_id, created_by, created_at, updated_at]
      )
      break
    }
    case 'audit_logs': {
      const { id, user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at } = row as any
      await client.query(
        `INSERT INTO audit_logs (id, user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [id, user_id, username, action, resource_type, resource_id, details, ip_address, user_agent, created_at]
      )
      break
    }
  }
}

importSQLiteToPostgreSQL().catch(console.error)
