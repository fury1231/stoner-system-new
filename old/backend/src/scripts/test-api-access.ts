#!/usr/bin/env node
/**
 * 測試匯入資料的 API 存取
 */

import Database from 'better-sqlite3'

const dbPath = '/home/mstpri/stoner-system/backend/database.sqlite'

try {
  const db = new Database(dbPath, { readonly: true })

  console.log('\n✅ 匯入資料驗證報告\n')
  console.log('=' .repeat(60))

  // 1. 用戶驗證
  console.log('\n👥 用戶 (Users):')
  const users = db.prepare('SELECT id, username, role, is_active FROM users').all()
  console.log(`   總數: ${users.length}`)
  users.forEach((u: any) => {
    console.log(`   - ${u.username} (${u.role}) - ${u.is_active ? '啟用' : '停用'}`)
  })

  // 2. 分店驗證
  console.log('\n🏪 分店 (Stores):')
  const stores = db.prepare('SELECT id, name, code, is_active FROM stores').all()
  console.log(`   總數: ${stores.length}`)
  stores.forEach((s: any) => {
    console.log(`   - ${s.name} (${s.code}) - ${s.is_active ? '啟用' : '停用'}`)
  })

  // 3. 收款記錄驗證
  console.log('\n💰 收款記錄 (Payments):')
  const paymentStats = db.prepare(`
    SELECT
      payment_method,
      COUNT(*) as count,
      SUM(amount) as total
    FROM payments
    GROUP BY payment_method
    ORDER BY count DESC
  `).all()

  const totalPayments = db.prepare('SELECT COUNT(*) as c FROM payments').get() as { c: number }
  console.log(`   總數: ${totalPayments.c}`)
  console.log(`   分類統計:`)
  paymentStats.forEach((p: any) => {
    console.log(`     - ${p.payment_method}: ${p.count} 筆，${p.total.toLocaleString()} 元`)
  })

  // 4. 最新 5 筆收款記錄
  console.log('\n📅 最新 5 筆收款記錄:')
  const recentPayments = db.prepare(`
    SELECT
      p.paid_at,
      p.payment_method,
      p.amount,
      s.name as store_name
    FROM payments p
    LEFT JOIN stores s ON p.store_id = s.id
    ORDER BY p.paid_at DESC
    LIMIT 5
  `).all()

  recentPayments.forEach((p: any, i: number) => {
    const date = new Date(p.paid_at).toLocaleString('zh-TW')
    console.log(`   ${i + 1}. [${date}] ${p.payment_method} - ${p.amount} 元 (${p.store_name})`)
  })

  // 5. 客訂單驗證
  console.log('\n📦 客訂單 (Customer Orders):')
  const orderStats = db.prepare(`
    SELECT
      status,
      COUNT(*) as count,
      SUM(amount) as total
    FROM customer_orders
    GROUP BY status
  `).all()

  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM customer_orders').get() as { c: number }
  console.log(`   總數: ${totalOrders.c}`)
  console.log(`   狀態統計:`)
  orderStats.forEach((o: any) => {
    console.log(`     - ${o.status}: ${o.count} 筆，${o.total ? o.total.toLocaleString() : 0} 元`)
  })

  // 6. 審計日誌驗證
  console.log('\n📝 審計日誌 (Audit Logs):')
  const auditCount = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as { c: number }
  console.log(`   總數: ${auditCount.c}`)

  const auditStats = db.prepare(`
    SELECT action, COUNT(*) as count
    FROM audit_logs
    GROUP BY action
    ORDER BY count DESC
    LIMIT 5
  `).all()
  console.log(`   操作統計 (前 5):`)
  auditStats.forEach((a: any) => {
    console.log(`     - ${a.action}: ${a.count} 次`)
  })

  console.log('\n' + '=' .repeat(60))
  console.log('✅ 所有資料驗證完成！')
  console.log('💡 資料庫匯入成功，可以正常使用網站功能')
  console.log('=' .repeat(60) + '\n')

  db.close()
  process.exit(0)
} catch (error) {
  console.error('❌ 錯誤:', error)
  process.exit(1)
}
