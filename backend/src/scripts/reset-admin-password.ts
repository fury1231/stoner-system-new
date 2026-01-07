#!/usr/bin/env node
/**
 * 管理員密碼重置工具
 *
 * 使用方式：
 * 1. 方法一（從 .env 讀取）：npm run reset-password
 * 2. 方法二（互動式輸入）：npm run reset-password -- --interactive
 * 3. 方法三（直接指定）：npm run reset-password -- --password "NewPassword123"
 */

import dotenv from 'dotenv'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'
import { db, initializeDatabase } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer)
    })
  })
}

async function resetAdminPassword() {
  try {
    console.log('\n🔐 管理員密碼重置工具\n')

    // 初始化資料庫（但不要同步密碼）
    process.env.SYNC_ADMIN_PASSWORD = 'false'
    await initializeDatabase()

    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const existingAdmin = await db.getUserByUsername(adminUsername)

    if (!existingAdmin) {
      console.error(`❌ 錯誤：找不到管理員用戶 "${adminUsername}"`)
      console.log(`💡 提示：請先啟動伺服器以創建默認管理員帳號`)
      process.exit(1)
    }

    // 解析命令行參數
    const args = process.argv.slice(2)
    let newPassword: string = ''

    if (args.includes('--interactive')) {
      // 互動式輸入
      console.log(`📝 即將重置用戶 "${adminUsername}" 的密碼\n`)
      const inputPassword = await question('請輸入新密碼（至少 8 個字元）: ')

      if (!inputPassword || inputPassword.length < 8) {
        console.error('❌ 密碼過短，必須至少 8 個字元')
        process.exit(1)
      }

      const confirm = await question('再次輸入新密碼確認: ')
      if (inputPassword !== confirm) {
        console.error('❌ 兩次輸入的密碼不一致')
        process.exit(1)
      }

      newPassword = inputPassword
    } else if (args.includes('--password')) {
      // 從命令行參數獲取
      const passwordIndex = args.indexOf('--password')
      const argPassword = args[passwordIndex + 1]

      if (!argPassword || argPassword.length < 8) {
        console.error('❌ 密碼過短，必須至少 8 個字元')
        process.exit(1)
      }

      newPassword = argPassword
    } else {
      // 從 .env 讀取
      const envPassword = process.env.ADMIN_PASSWORD

      if (!envPassword) {
        console.error('❌ 錯誤：.env 中未設定 ADMIN_PASSWORD')
        console.log('💡 提示：請使用以下方式之一：')
        console.log('   1. 在 .env 中設定 ADMIN_PASSWORD')
        console.log('   2. 使用 --interactive 參數進行互動式輸入')
        console.log('   3. 使用 --password "新密碼" 直接指定')
        process.exit(1)
      }

      console.log(`📝 將使用 .env 中的 ADMIN_PASSWORD 重置用戶 "${adminUsername}" 的密碼`)
      newPassword = envPassword
    }

    // 更新密碼
    await db.updateUser(existingAdmin.id, {
      password: newPassword
    })

    console.log(`\n✅ 成功！管理員 "${adminUsername}" 的密碼已重置`)
    console.log(`\n💡 提示：`)
    console.log(`   - 請使用新密碼登入系統`)
    console.log(`   - 建議將 SYNC_ADMIN_PASSWORD 設為 false 避免意外覆蓋`)
    console.log(`   - 如需再次重置，可重新執行此工具\n`)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ 錯誤：', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

resetAdminPassword()
