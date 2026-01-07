#!/usr/bin/env node
/**
 * 分析 SQLite 資料庫結構
 */

import Database from 'better-sqlite3'

const dbPath = process.argv[2] || '/home/mstpri/stoner-system/10_18_SQL.db'

try {
  const db = new Database(dbPath, { readonly: true })

  console.log('\n📊 資料庫分析報告\n')
  console.log('=' .repeat(60))
  console.log(`資料庫路徑: ${dbPath}`)
  console.log('=' .repeat(60))

  // 獲取所有表格
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table'
    ORDER BY name
  `).all()

  console.log(`\n📋 資料表數量: ${tables.length}\n`)

  for (const table of tables as Array<{ name: string }>) {
    console.log(`\n📦 表格: ${table.name}`)
    console.log('-'.repeat(60))

    // 獲取表格結構
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all()
    console.log('欄位:')
    for (const col of columns as Array<any>) {
      const pk = col.pk ? ' [PRIMARY KEY]' : ''
      const notnull = col.notnull ? ' NOT NULL' : ''
      console.log(`  - ${col.name}: ${col.type}${pk}${notnull}`)
    }

    // 獲取記錄數量
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number }
    console.log(`記錄數: ${count.count}`)

    // 如果記錄數少於 5，顯示範例資料
    if (count.count > 0 && count.count <= 5) {
      const samples = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all()
      console.log('範例資料:')
      console.log(JSON.stringify(samples, null, 2))
    }
  }

  console.log('\n' + '=' .repeat(60))
  console.log('✅ 分析完成')
  console.log('=' .repeat(60) + '\n')

  db.close()
} catch (error) {
  console.error('❌ 錯誤:', error)
  process.exit(1)
}
