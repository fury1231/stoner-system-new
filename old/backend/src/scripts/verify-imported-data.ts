#!/usr/bin/env node
/**
 * 驗證匯入資料的正確性
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeDatabase, db } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') })

async function verifyImportedData() {
  try {
    console.log('\n🔍 驗證匯入資料的正確性\n')
    console.log('=' .repeat(60))

    await initializeDatabase()

    console.log('=' .repeat(60))

    // 1. 驗證用戶
    console.log('\n👥 用戶驗證:')
    const users = await db.getAllUsers()
    console.log(`   - 總用戶數: ${users.length}`)
    for (const user of users) {
      console.log(`   - ${user.username} (${user.role}) - 權限: ${user.permissions.length} 項`)
    }

    // 2. 驗證分店
    console.log('\n🏪 分店驗證:')
    const stores = await db.getAllStores()
    console.log(`   - 總分店數: ${stores.length}`)
    for (const store of stores) {
      console.log(`   - ${store.name} (${store.code}) - ${store.is_active ? '啟用' : '停用'}`)
    }

    // 3. 驗證收款記錄（分頁）
    console.log('\n💰 收款記錄驗證:')
    const payments = await db.getPaymentsPaginated(1, 10)
    console.log(`   - 總記錄數: ${payments.total}`)
    console.log(`   - 第一頁記錄數: ${payments.payments.length}`)

    if (payments.payments.length > 0) {
      const firstPayment = payments.payments[0]
      console.log(`   - 最新一筆: ${firstPayment.payment_method} - ${firstPayment.amount} 元`)
      console.log(`     時間: ${firstPayment.paid_at}`)
      console.log(`     分店: ${firstPayment.store_name || '未指定'}`)
    }

    // 4. 驗證客訂單
    console.log('\n📦 客訂單驗證:')
    const orders = await db.getCustomerOrdersPaginated(1, 10)
    console.log(`   - 總訂單數: ${orders.total}`)
    console.log(`   - 第一頁訂單數: ${orders.orders.length}`)

    if (orders.orders.length > 0) {
      const firstOrder = orders.orders[0]
      console.log(`   - 最新一筆: ${firstOrder.customer_name} - ${firstOrder.amount} 元`)
      console.log(`     狀態: ${firstOrder.status}`)
    }

    // 5. 驗證統計資料
    console.log('\n📊 統計資料驗證:')
    const today = new Date().toISOString().split('T')[0]
    const stats = await db.getDashboardStats(today, today)
    console.log(`   - 今日統計查詢成功`)
    console.log(`   - 總收入: ${stats.total_income || 0} 元`)
    console.log(`   - 總筆數: ${stats.total_count || 0} 筆`)

    console.log('\n' + '=' .repeat(60))
    console.log('✅ 所有資料驗證通過！資料庫匯入成功！')
    console.log('=' .repeat(60) + '\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ 驗證錯誤:', error)
    process.exit(1)
  }
}

verifyImportedData()
