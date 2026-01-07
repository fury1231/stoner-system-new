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
        <p class="text-gray-600 mb-4">您沒有管理分店的權限</p>
        <p class="text-sm text-gray-500">需要 <code class="bg-gray-200 px-2 py-1 rounded text-xs">manage_stores</code> 權限</p>
      </div>
    </div>

    <!-- 分店管理內容 (僅有權限時顯示) -->
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h2 class="text-lg font-medium text-gray-900">分店管理</h2>
        <button
          @click="$emit('addStore')"
          class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          新增分店
        </button>
      </div>

      <!-- 桌面版表格 -->
      <div class="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分店名稱</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代碼</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="store in stores" :key="store.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ store.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ store.code }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="store.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ store.is_active ? '啟用' : '停用' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="$emit('editStore', store)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    編輯
                  </button>
                  <button
                    @click="$emit('deleteStore', store.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 手機版卡片佈局 -->
      <div class="md:hidden space-y-4">
        <div v-for="store in stores" :key="store.id" class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ store.name }}</h3>
              <div class="flex items-center space-x-2 mt-2">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {{ store.code }}
                </span>
                <span :class="store.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ store.is_active ? '啟用' : '停用' }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                @click="$emit('editStore', store)"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                編輯
              </button>
              <button
                @click="$emit('deleteStore', store.id)"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                刪除
              </button>
            </div>
          </div>
        </div>

        <!-- 空狀態 -->
        <div v-if="stores.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-1">尚無分店資料</h3>
          <p class="text-gray-500">點擊上方「新增分店」按鈕開始新增分店</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StoreData } from '@/utils/api'

// Props
defineProps<{
  hasPermission: boolean
  stores: StoreData[]
}>()

// Emits
defineEmits<{
  (e: 'addStore'): void
  (e: 'editStore', store: StoreData): void
  (e: 'deleteStore', storeId: number): void
}>()
</script>
