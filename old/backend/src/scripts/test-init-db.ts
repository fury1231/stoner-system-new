#!/usr/bin/env node
/**
 * 測試資料庫初始化邏輯
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeDatabase, db } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') })

async function testInitDatabase() {
  try {
    console.log('\n🧪 測試資料庫初始化邏輯\n')
    console.log('=' .repeat(60))

    // 執行初始化
    await initializeDatabase()

    console.log('=' .repeat(60))

    // 檢查管理員是否創建成功
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const admin = await db.getUserByUsername(adminUsername)

    if (admin) {
      console.log('\n✅ 測試結果：')
      console.log(`   - 管理員用戶已創建: ${admin.username}`)
      console.log(`   - 角色: ${admin.role}`)
      console.log(`   - 權限數量: ${admin.permissions.length}`)
      console.log(`   - 狀態: ${admin.is_active ? '啟用' : '停用'}`)
    } else {
      console.log('\n❌ 測試失敗：管理員用戶未創建')
      process.exit(1)
    }

    console.log('\n✅ 資料庫初始化測試通過！\n')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ 測試錯誤：', error)
    process.exit(1)
  }
}

testInitDatabase()
