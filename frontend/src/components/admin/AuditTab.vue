<template>
  <div class="space-y-6">
    <!-- 權限檢查 -->
    <div v-if="!hasPermission" class="text-center py-12">
      <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
        <div class="mb-4">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2m0 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">無權限訪問</h3>
        <p class="text-gray-600 mb-4">您沒有查看操作日誌的權限</p>
        <p class="text-sm text-gray-500">需要 <code class="bg-gray-200 px-2 py-1 rounded text-xs">view_reports</code> 權限</p>
      </div>
    </div>

    <!-- 操作日誌內容 (僅有權限時顯示) -->
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 class="text-lg font-medium text-gray-900">操作日誌</h2>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <!-- 資料庫備份按鈕 -->
          <div class="flex gap-2">
            <button
              :disabled="backupLoading"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="$emit('createBackup')"
            >
              <svg v-if="!backupLoading" class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
              </svg>
              <svg v-else class="animate-spin w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ backupLoading ? '備份中...' : '備份資料庫' }}
            </button>
            <button
              :disabled="importLoading"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="$emit('triggerFileUpload')"
            >
              <svg v-if="!importLoading" class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <svg v-else class="animate-spin w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ importLoading ? '匯入中...' : '匯入資料庫' }}
            </button>
            <button
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="$emit('showBackupList')"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              備份列表
            </button>
            <!-- 清空數據測試按鈕 (僅 Debug 模式顯示) -->
            <button
              v-if="debugMode"
              :disabled="clearDataLoading"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="$emit('showClearData')"
            >
              <svg v-if="!clearDataLoading" class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              <svg v-else class="animate-spin w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ clearDataLoading ? '清空中...' : '清空數據' }}
            </button>
          </div>
          <div class="text-sm text-gray-600">
            僅限系統管理員查看
          </div>
        </div>
      </div>

      <!-- 日誌篩選 -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div class="flex items-center space-x-3">
            <select
              :value="actionFilter"
              class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="$emit('update:actionFilter', ($event.target as HTMLSelectElement).value); $emit('filterChange')"
            >
              <option value="">全部操作</option>
              <option value="create">新增</option>
              <option value="update">更新</option>
              <option value="delete">刪除</option>
              <option value="login">登入</option>
              <option value="logout">登出</option>
            </select>
            <select
              :value="resourceFilter"
              class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="$emit('update:resourceFilter', ($event.target as HTMLSelectElement).value); $emit('filterChange')"
            >
              <option value="">全部資源</option>
              <option value="payment">收款記錄</option>
              <option value="user">用戶</option>
              <option value="store">分店</option>
              <option value="system">系統</option>
            </select>
          </div>
          <button
            :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
            @click="$emit('reload')"
          >
            {{ loading ? '載入中...' : '重新載入' }}
          </button>
        </div>
      </div>

      <!-- 桌面版日誌表格 -->
      <div class="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用戶</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">資源</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳情</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="logs.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                  {{ loading ? '載入中...' : '暫無日誌記錄' }}
                </td>
              </tr>
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDateTime(log.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ log.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getActionClass(log.action)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getActionText(log.action) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div class="font-medium">{{ getResourceTypeText(log.resource_type) }}</div>
                    <div v-if="log.resource_id" class="text-xs text-gray-500">ID: {{ log.resource_id }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div class="truncate" :title="log.details">{{ log.details }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex flex-col">
                    <span class="font-mono text-sm">{{ formatIPAddress(log.ip_address) }}</span>
                    <span v-if="getIPTypeLabel(log.ip_address)" class="text-xs text-gray-500 mt-0.5">
                      {{ getIPTypeLabel(log.ip_address) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分頁 -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              :disabled="currentPage <= 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              @click="$emit('prevPage')"
            >
              上一頁
            </button>
            <button
              :disabled="logs.length < pageSize"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              @click="$emit('nextPage')"
            >
              下一頁
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                第 {{ currentPage }} 頁，顯示 {{ logs.length }} 筆記錄
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  :disabled="currentPage <= 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  @click="$emit('prevPage')"
                >
                  上一頁
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {{ currentPage }}
                </span>
                <button
                  :disabled="logs.length < pageSize"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  @click="$emit('nextPage')"
                >
                  下一頁
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- 手機版審計記錄卡片 -->
      <div class="md:hidden space-y-4">
        <div v-if="logs.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-1">{{ loading ? '載入中...' : '暫無日誌記錄' }}</h3>
        </div>

        <div v-for="log in logs" :key="log.id" class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm font-medium text-gray-900">{{ log.username }}</span>
                <span :class="getActionClass(log.action)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getActionText(log.action) }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDateTime(log.created_at) }}
              </div>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-gray-600">資源：</span>
              <span class="text-gray-900">{{ getResourceTypeText(log.resource_type) }}</span>
              <span v-if="log.resource_id" class="text-xs text-gray-500 ml-1">(ID: {{ log.resource_id }})</span>
            </div>
            <div>
              <span class="font-medium text-gray-600">詳情：</span>
              <span class="text-gray-900">{{ log.details }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-600">IP地址：</span>
              <span class="text-gray-900 font-mono text-sm">{{ formatIPAddress(log.ip_address) }}</span>
              <span v-if="getIPTypeLabel(log.ip_address)" class="text-xs text-gray-500 ml-1">
                ({{ getIPTypeLabel(log.ip_address) }})
              </span>
            </div>
          </div>
        </div>

        <!-- 移動端分頁 -->
        <div class="flex justify-between items-center px-4 py-3">
          <button
            :disabled="currentPage <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            @click="$emit('prevPage')"
          >
            上一頁
          </button>
          <span class="text-sm text-gray-700">第 {{ currentPage }} 頁</span>
          <button
            :disabled="logs.length < pageSize"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            @click="$emit('nextPage')"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatIPAddress, getIPTypeLabel } from '@/utils/ip'
import type { AuditLogRecord } from '@/utils/api'

// Props
defineProps<{
  hasPermission: boolean
  logs: AuditLogRecord[]
  loading: boolean
  currentPage: number
  pageSize: number
  actionFilter: string
  resourceFilter: string
  backupLoading: boolean
  importLoading: boolean
  clearDataLoading: boolean
  debugMode: boolean
}>()

// Emits
defineEmits<{
  (e: 'createBackup'): void
  (e: 'triggerFileUpload'): void
  (e: 'showBackupList'): void
  (e: 'showClearData'): void
  (e: 'reload'): void
  (e: 'filterChange'): void
  (e: 'prevPage'): void
  (e: 'nextPage'): void
  (e: 'update:actionFilter', value: string): void
  (e: 'update:resourceFilter', value: string): void
}>()

// 格式化函數
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

const getActionClass = (action: string) => {
  switch (action) {
    case 'create': return 'bg-green-100 text-green-800'
    case 'update': return 'bg-blue-100 text-blue-800'
    case 'delete': return 'bg-red-100 text-red-800'
    case 'login': return 'bg-purple-100 text-purple-800'
    case 'logout': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getActionText = (action: string) => {
  const actionMap: Record<string, string> = {
    'create': '新增',
    'update': '更新',
    'delete': '刪除',
    'login': '登入',
    'logout': '登出'
  }
  return actionMap[action] || action
}

const getResourceTypeText = (resourceType: string) => {
  const typeMap: Record<string, string> = {
    'payment': '收款記錄',
    'user': '用戶',
    'store': '分店',
    'system': '系統'
  }
  return typeMap[resourceType] || resourceType
}
</script>
