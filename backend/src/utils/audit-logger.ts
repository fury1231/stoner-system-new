import { db, AuditLogInput } from '../db.js'
import { promises as fs } from 'fs'
import path from 'path'

// 📊 審計日誌失敗統計
let auditLogFailureCount = 0
let lastFailureTime: number = 0
const FAILURE_THRESHOLD = 5 // 連續失敗閾值
const FAILURE_WINDOW = 60000 // 1分鐘內的失敗視為連續

/**
 * 🔒 安全的審計日誌記錄函數
 *
 * 當審計日誌記錄失敗時：
 * 1. 記錄到專門的錯誤日誌檔案
 * 2. 追蹤失敗次數
 * 3. 連續失敗時輸出警告
 *
 * @param logData 審計日誌資料
 * @param operationContext 操作上下文（用於錯誤追蹤）
 * @returns Promise<boolean> 是否成功記錄
 */
export async function safeAuditLog(
  logData: AuditLogInput,
  operationContext: string = 'unknown'
): Promise<boolean> {
  try {
    await db.createAuditLog(logData)

    // 成功時重置失敗計數器
    if (auditLogFailureCount > 0) {
      console.log(`✅ 審計日誌恢復正常（之前失敗 ${auditLogFailureCount} 次）`)
      auditLogFailureCount = 0
    }

    return true
  } catch (error) {
    // 記錄失敗
    const now = Date.now()

    // 如果距離上次失敗超過時間窗口，重置計數器
    if (now - lastFailureTime > FAILURE_WINDOW) {
      auditLogFailureCount = 0
    }

    auditLogFailureCount++
    lastFailureTime = now

    // 🚨 連續失敗警告
    if (auditLogFailureCount >= FAILURE_THRESHOLD) {
      console.error(`🚨 嚴重警告：審計日誌連續失敗 ${auditLogFailureCount} 次！`)
      console.error('   可能原因：資料庫連接問題、磁碟空間不足、權限問題')
      console.error('   建議立即檢查系統狀態')
    }

    // 記錄到專門的錯誤日誌檔案
    await logAuditFailureToFile(logData, error, operationContext)

    // 輸出到 console（保持向後兼容）
    console.error(`❌ 審計日誌記錄失敗 [${operationContext}]:`, error)

    return false
  }
}

/**
 * 將審計日誌失敗記錄到專門的錯誤檔案
 */
async function logAuditFailureToFile(
  logData: AuditLogInput,
  error: unknown,
  context: string
): Promise<void> {
  try {
    const logDir = path.join(process.cwd(), 'logs')

    // 🔒 安全性改進：使用非同步檔案操作避免阻塞事件循環
    await fs.mkdir(logDir, { recursive: true })

    const logFile = path.join(logDir, 'audit-failures.log')

    const logEntry = {
      timestamp: new Date().toISOString(),
      context,
      failureCount: auditLogFailureCount,
      attemptedLog: {
        username: logData.username,
        action: logData.action,
        resource_type: logData.resource_type,
        resource_id: logData.resource_id,
        details: logData.details
      },
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    }

    // 寫入日誌檔案（追加模式）
    await fs.appendFile(
      logFile,
      JSON.stringify(logEntry) + '\n',
      { encoding: 'utf-8' }
    )
  } catch (fileError) {
    // 如果連寫入檔案都失敗，至少輸出到 console
    console.error('⚠️ 無法寫入審計失敗日誌檔案:', fileError)
  }
}

/**
 * 獲取審計日誌健康狀態
 */
export function getAuditLogHealth(): {
  status: 'healthy' | 'degraded' | 'critical'
  failureCount: number
  lastFailure: number | null
} {
  const status =
    auditLogFailureCount === 0 ? 'healthy' :
    auditLogFailureCount < FAILURE_THRESHOLD ? 'degraded' :
    'critical'

  return {
    status,
    failureCount: auditLogFailureCount,
    lastFailure: lastFailureTime || null
  }
}
