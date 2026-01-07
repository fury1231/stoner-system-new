#!/usr/bin/env node
/**
 * 測試管理員登入
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') })

async function testLogin() {
  try {
    console.log('\n🔐 測試管理員登入\n')
    console.log('=' .repeat(60))

    // 獲取管理員用戶
    const admin = await db.getUserByUsername('admin')

    if (!admin) {
      console.log('❌ 管理員用戶不存在')
      process.exit(1)
    }

    console.log(`✅ 找到管理員: ${admin.username}`)
    console.log(`   角色: ${admin.role}`)
    console.log(`   權限: ${admin.permissions.join(', ')}`)

    // 測試密碼
    const testPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
    console.log(`\n🔑 測試密碼: ${testPassword}`)

    const isValid = await bcrypt.compare(testPassword, admin.password_hash)

    if (isValid) {
      console.log(`✅ 密碼驗證成功！`)
      console.log(`\n💡 可以使用以下帳號登入網站:`)
      console.log(`   帳號: admin`)
      console.log(`   密碼: ${testPassword}`)
    } else {
      console.log(`❌ 密碼驗證失敗`)
      console.log(`\n💡 如需重置密碼，請執行:`)
      console.log(`   npm run reset-password`)
    }

    // 測試其他用戶
    console.log(`\n👥 其他用戶帳號:`)
    const users = await db.getAllUsers()
    for (const user of users) {
      if (user.username !== 'admin') {
        console.log(`   - ${user.username} (${user.role})`)
        console.log(`     權限: ${user.permissions.join(', ')}`)

        // 顯示可存取的分店
        if (user.accessible_stores && user.accessible_stores.length > 0) {
          const storeNames = []
          for (const storeId of user.accessible_stores) {
            const store = await db.getStoreById(storeId)
            if (store) storeNames.push(store.name)
          }
          console.log(`     可存取分店: ${storeNames.join(', ')}`)
        }
      }
    }

    console.log('\n' + '=' .repeat(60))
    console.log('✅ 登入測試完成')
    console.log('=' .repeat(60) + '\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ 錯誤:', error)
    process.exit(1)
  }
}

testLogin()
