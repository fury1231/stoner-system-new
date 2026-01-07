import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { db, initializeDatabase } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

async function checkStats() {
  await initializeDatabase()
  
  const today = new Date().toISOString().split('T')[0]
  console.log(`\n📊 統計檢查 - ${today}\n`)
  
  const result = await db.query(`
    SELECT payment_method, status, amount 
    FROM payments 
    WHERE DATE(paid_at) = $1
  `, [today])
  
  console.log(`今日記錄總數: ${result.rows.length}`)
  
  if (result.rows.length === 0) {
    console.log('今日沒有記錄，嘗試查詢最近一天有資料的日期...')
    const latestResult = await db.query(`
      SELECT DATE(paid_at) as date, COUNT(*) as count
      FROM payments
      GROUP BY DATE(paid_at)
      ORDER BY DATE(paid_at) DESC
      LIMIT 5
    `)
    console.log('最近有資料的日期:')
    for (const row of latestResult.rows) {
      console.log(`  ${row.date}: ${row.count} 筆`)
    }
    process.exit(0)
  }
  
  const methods: Record<string, { count: number, amount: number }> = {}
  const statuses: Record<string, number> = {}
  
  for (const row of result.rows) {
    const m = row.payment_method
    if (!methods[m]) methods[m] = { count: 0, amount: 0 }
    methods[m].count++
    methods[m].amount += parseInt(row.amount)
    
    const s = row.status
    statuses[s] = (statuses[s] || 0) + 1
  }
  
  console.log('\n付款方式分佈:')
  for (const [m, stats] of Object.entries(methods).sort()) {
    console.log(`  ${m}: ${stats.count} 筆, $${stats.amount.toLocaleString()}`)
  }
  
  console.log('\n狀態分佈:')
  for (const [s, count] of Object.entries(statuses)) {
    console.log(`  ${s}: ${count}`)
  }
  
  function getBaseMethod(m: string): string {
    if (m.startsWith('員工購物-')) return m.replace('員工購物-', '')
    if (m.startsWith('電子支付-')) return '電子支付'
    return m
  }
  
  let remittance = 0, cash = 0, electronic = 0, storeExpense = 0, withdrawal = 0
  
  for (const row of result.rows) {
    const base = getBaseMethod(row.payment_method)
    const amt = parseInt(row.amount)
    
    if (base === '匯款') remittance += amt
    else if (base === '現金') cash += amt
    else if (base === '電子支付') electronic += amt
    else if (base === '店內支出') storeExpense += amt
    else if (base === '提領') withdrawal += amt
  }
  
  const storeRevenue = remittance + cash + electronic - storeExpense
  
  console.log('\n--- 預期計算結果 ---')
  console.log(`匯款: $${remittance.toLocaleString()}`)
  console.log(`現金: $${cash.toLocaleString()}`)
  console.log(`電子支付: $${electronic.toLocaleString()}`)
  console.log(`店內支出: $${storeExpense.toLocaleString()}`)
  console.log(`提領: $${withdrawal.toLocaleString()}`)
  console.log(`店內營收 (匯+現+電-支出): $${storeRevenue.toLocaleString()}`)
  
  process.exit(0)
}

checkStats().catch(e => {
  console.error(e)
  process.exit(1)
})
