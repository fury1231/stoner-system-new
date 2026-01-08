<template>
  <div class="flex flex-col h-full bg-slate-50">
    <!-- 篩選區域 - 現代卡片風格 -->
    <div class="bg-white shadow-sm border-b border-slate-200">
      <div class="p-3 sm:p-4">
        <!-- 搜尋框 -->
        <div class="mb-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜尋 UUID、後五碼、備註..."
              class="w-full pl-10 pr-4 py-2.5 sm:py-2 text-sm bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              @input="debouncedSearch"
            />
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <!-- 篩選器 - 膠囊風格 -->
        <div class="flex flex-wrap gap-2 items-center">
          <!-- 狀態 -->
          <select
            v-model="filters.status"
            :class="[
              'px-3 py-2 text-sm rounded-full border-0 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer',
              filters.status ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-slate-100 text-slate-600'
            ]"
            @change="onStatusFilterChange"
          >
            <option value="">全部狀態</option>
            <option value="未確認">未確認</option>
            <option value="已入帳">已入帳</option>
            <option value="未入帳">未入帳</option>
          </select>

          <!-- 付款方式 -->
          <select
            v-model="filters.payment_method"
            :class="[
              'px-3 py-2 text-sm rounded-full border-0 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer',
              filters.payment_method ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-slate-100 text-slate-600'
            ]"
            @change="onFilterChange"
          >
            <option value="">全部方式</option>
            <optgroup label="一般">
              <option value="現金">現金</option>
              <option value="匯款">匯款</option>
            </optgroup>
            <optgroup label="電子支付">
              <option value="電子支付">電子支付(全部)</option>
              <option value="電子支付-街口支付">街口支付</option>
              <option value="電子支付-LINE PAY">LINE PAY</option>
              <option value="電子支付-刷卡">刷卡</option>
              <option value="電子支付-TAP PAY">TapPay</option>
            </optgroup>
            <optgroup label="其他">
              <option value="店內支出">支出</option>
              <option value="提領">提領</option>
            </optgroup>
            <optgroup label="員工購物">
              <option value="員工購物-現金">員工現金</option>
              <option value="員工購物-匯款">員工匯款</option>
              <option value="員工購物-電子支付">員工電子</option>
            </optgroup>
          </select>

          <!-- 分店 -->
          <select
            v-model="filters.store_id"
            :class="[
              'px-3 py-2 text-sm rounded-full border-0 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer',
              filters.store_id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-slate-100 text-slate-600'
            ]"
            @change="onFilterChange"
          >
            <option :value="undefined">全部分店</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>

          <!-- 日期範圍按鈕 -->
          <button
            :class="[
              'px-3 py-2 text-sm rounded-full flex items-center gap-1.5 transition-all',
              (filters.start_date || filters.end_date)
                ? 'bg-indigo-100 text-indigo-700 font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
            @click="showDateRange = !showDateRange"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span v-if="filters.start_date || filters.end_date">{{ formatDateRange() }}</span>
            <span v-else>日期</span>
          </button>

          <!-- 清除篩選 -->
          <button
            v-if="hasActiveFilters"
            class="px-3 py-2 text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full transition-all font-medium"
            @click="clearFilters"
          >
            清除篩選
          </button>
        </div>

        <!-- 日期選擇器（含前後切換） -->
        <div v-show="showDateRange" class="mt-3 pt-3 border-t border-slate-100">
          <div class="flex items-center justify-center gap-2">
            <!-- 前一天 -->
            <button
              class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="前一天"
              @click="changeDate(-1)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <!-- 日期顯示 -->
            <div class="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
              <input
                v-model="filters.start_date"
                type="date"
                class="bg-transparent border-0 text-sm text-slate-700 focus:ring-0 w-32 text-center"
                @change="onFilterChange"
              />
              <span class="text-slate-400 text-sm">~</span>
              <input
                v-model="filters.end_date"
                type="date"
                class="bg-transparent border-0 text-sm text-slate-700 focus:ring-0 w-32 text-center"
                @change="onFilterChange"
              />
            </div>

            <!-- 後一天 -->
            <button
              class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="後一天"
              @click="changeDate(1)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- 今天按鈕 -->
            <button
              class="px-3 py-2 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-medium"
              @click="goToToday"
            >
              今天
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作列（選取時顯示） -->
    <div v-if="selectedItems.size > 0" class="bg-indigo-50 border-b border-indigo-100 px-3 sm:px-4 py-3">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
              <span class="text-xs text-white font-bold">{{ selectedItems.size }}</span>
            </div>
            <span class="text-sm text-indigo-700 font-medium">筆已選取</span>
          </div>
          <button class="text-xs text-indigo-500 hover:text-indigo-700 underline" @click="clearSelection">取消選取</button>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="flex-1 sm:flex-none px-3 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-sm"
            @click="emit('batchStatusUpdate')"
          >
            更新狀態
          </button>
          <button
            class="flex-1 sm:flex-none px-3 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-sm"
            @click="emit('exportSelected')"
          >
            匯出
          </button>
          <button
            class="px-3 py-2 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-all shadow-sm"
            @click="emit('batchDelete', Array.from(selectedItems))"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 統計與操作 -->
    <div v-else class="bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- 全選 checkbox -->
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isPartiallySelected"
            class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            @change="toggleSelectAll"
          />
          <span class="text-sm text-slate-600">全選</span>
        </label>
        <div class="text-sm text-slate-500">
          共 <span class="font-semibold text-slate-800">{{ pagination.total.toLocaleString() }}</span> 筆
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-all"
          @click="emit('importExcel')"
        >
          匯入
        </button>
        <button
          class="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-all"
          @click="emit('exportFiltered')"
        >
          匯出
        </button>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center bg-slate-50">
      <div class="text-center">
        <div class="relative w-12 h-12 mx-auto mb-3">
          <div class="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div class="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <span class="text-sm text-slate-500 font-medium">載入中...</span>
      </div>
    </div>

    <!-- 記錄列表 -->
    <div
      v-else
      ref="scrollContainer"
      class="flex-1 overflow-y-auto bg-slate-50"
      @scroll="onScroll"
    >
      <!-- 空狀態 -->
      <div v-if="data.length === 0" class="flex items-center justify-center h-full">
        <div class="text-center p-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-slate-500 font-medium">沒有找到記錄</p>
          <p class="text-sm text-slate-400 mt-1">試試調整篩選條件</p>
        </div>
      </div>

      <!-- 虛擬滾動容器 -->
      <div v-else :style="{ height: totalHeight + 'px', position: 'relative' }" class="px-2 py-1">
        <div
          v-for="item in visibleItems"
          :key="item.uuid"
          :style="{
            position: 'absolute',
            top: getItemTop(item.uuid) + 'px',
            left: '8px',
            right: '8px',
            height: getItemHeight(item.uuid) + 'px'
          }"
        >
          <!-- 編輯模式 - 手機版優化 -->
          <div v-if="isEditing(item.uuid)" class="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-3 sm:p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div class="col-span-2 sm:col-span-1">
                <label class="block text-xs font-medium text-slate-600 mb-1">付款時間</label>
                <input
                  type="datetime-local"
                  :value="formatDateTimeForEdit(getEditedValue(item.uuid, 'paid_at', item.paid_at))"
                  class="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  @input="emit('updateField', item.uuid, 'paid_at', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label class="block text-xs font-medium text-slate-600 mb-1">付款方式</label>
                <select
                  :value="getEditedValue(item.uuid, 'payment_method', item.payment_method)"
                  class="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  @change="emit('updateField', item.uuid, 'payment_method', ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">金額</label>
                <input
                  type="number"
                  :value="getEditedValue(item.uuid, 'amount', item.amount)"
                  class="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  @input="emit('updateField', item.uuid, 'amount', parseInt(($event.target as HTMLInputElement).value) || 0)"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">狀態</label>
                <select
                  :value="getEditedValue(item.uuid, 'status', item.status)"
                  class="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  @change="emit('updateField', item.uuid, 'status', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="未確認">未確認</option>
                  <option value="已入帳">已入帳</option>
                  <option value="未入帳">未入帳</option>
                </select>
              </div>
              <div class="col-span-2 md:col-span-4">
                <label class="block text-xs font-medium text-slate-600 mb-1">備註</label>
                <textarea
                  :value="getEditedValue(item.uuid, 'note', item.note)"
                  rows="2"
                  class="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  @input="emit('updateField', item.uuid, 'note', ($event.target as HTMLTextAreaElement).value)"
                ></textarea>
              </div>
              <div class="col-span-2 md:col-span-4 flex justify-end gap-3 pt-3">
                <button class="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all" @click="emit('cancelEdit', item.uuid)">取消</button>
                <button class="px-5 py-2.5 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-sm transition-all" @click="emit('saveEdit', item.uuid)">儲存</button>
              </div>
            </div>
          </div>

          <!-- 顯示模式 - 緊湊列表設計 -->
          <div v-else class="bg-white rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-all overflow-hidden">
            <div class="flex items-center">
              <!-- 左側狀態指示條 -->
              <div :class="getStatusBarClass(item.status)" class="w-1 self-stretch flex-shrink-0"></div>

              <!-- 主內容區 -->
              <div class="flex-1 flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2">
                <!-- 選取框 -->
                <input
                  type="checkbox"
                  :checked="selectedItems.has(item.uuid)"
                  class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                  @change="toggleSelectItem(item.uuid)"
                />

                <!-- 金額 -->
                <div class="w-20 sm:w-24 flex-shrink-0">
                  <span class="text-base sm:text-lg font-bold text-slate-800">{{ formatCurrency(item.amount) }}</span>
                </div>

                <!-- 後五碼 - 手機版也顯示（對帳用） -->
                <span v-if="item.last_five" class="text-xs text-indigo-600 font-mono font-bold flex-shrink-0">
                  #{{ item.last_five }}
                </span>

                <!-- 狀態標籤 -->
                <span :class="getStatusBadgeClass(item.status)" class="px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded flex-shrink-0">
                  {{ item.status }}
                </span>

                <!-- 付款方式 -->
                <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded flex-shrink-0 hidden sm:inline">
                  {{ formatPaymentMethod(item.payment_method) }}
                </span>

                <!-- 時間與分店 -->
                <div class="flex-1 min-w-0 flex items-center gap-2 text-xs text-slate-500">
                  <span class="hidden lg:inline">{{ formatDate(item.paid_at) }}</span>
                  <span class="hidden md:inline">{{ getStoreName(item.store_id) }}</span>
                  <!-- 手機版：顯示付款方式 -->
                  <span class="sm:hidden text-slate-600 truncate">{{ formatPaymentMethod(item.payment_method) }}</span>
                </div>

                <!-- 備註（桌面版顯示文字） -->
                <div v-if="item.note" class="hidden lg:flex items-center gap-1 flex-shrink-0 max-w-48 xl:max-w-64" :title="item.note">
                  <svg class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-xs text-slate-500 truncate">{{ item.note }}</span>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex items-center gap-0.5 flex-shrink-0">
                  <!-- 手機版快速確認按鈕（僅未確認狀態顯示） -->
                  <button
                    v-if="item.status === '未確認'"
                    class="sm:hidden p-1.5 text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-all"
                    title="確認入帳"
                    @click="emit('statusChange', item.uuid, '已入帳')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </button>
                  <!-- 手機版快速拒絕按鈕（僅未確認狀態顯示） -->
                  <button
                    v-if="item.status === '未確認'"
                    class="sm:hidden p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-all"
                    title="標記未入帳"
                    @click="emit('statusChange', item.uuid, '未入帳')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  <!-- 桌面版狀態選擇器 -->
                  <select
                    :value="item.status"
                    class="text-xs px-1.5 py-1 rounded border-0 bg-slate-100 text-slate-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer hidden sm:block"
                    @change="emit('statusChange', item.uuid, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="未確認">未確認</option>
                    <option value="已入帳">已入帳</option>
                    <option value="未入帳">未入帳</option>
                  </select>
                  <button
                    class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                    title="編輯"
                    @click="emit('edit', item.uuid)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                    title="刪除"
                    @click="emit('delete', item.uuid)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="pagination.totalPages > 1" class="bg-white border-t border-gray-200 px-2 sm:px-3 py-2">
      <!-- 手機版：簡化分頁 -->
      <div class="flex sm:hidden items-center justify-between">
        <button
          :disabled="pagination.page <= 1"
          class="px-4 py-2.5 text-sm border border-gray-300 rounded-lg active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="goToPage(pagination.page - 1)"
        >
          上一頁
        </button>
        <span class="text-sm text-gray-600">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          :disabled="pagination.page >= pagination.totalPages"
          class="px-4 py-2.5 text-sm border border-gray-300 rounded-lg active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="goToPage(pagination.page + 1)"
        >
          下一頁
        </button>
      </div>

      <!-- 桌面版：完整分頁 -->
      <div class="hidden sm:flex items-center justify-between">
        <div class="text-sm text-gray-500">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 頁
        </div>
        <div class="flex items-center gap-1">
          <button
            :disabled="pagination.page <= 1"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="goToPage(pagination.page - 1)"
          >
            上一頁
          </button>

          <template v-for="page in visiblePages" :key="page">
            <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
            <button
              v-else
              :class="[
                'px-3 py-1.5 text-sm rounded',
                pagination.page === page
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              ]"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </button>
          </template>

          <button
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="goToPage(pagination.page + 1)"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { PaymentFilters as ApiPaymentFilters } from '@/utils/api'

interface PaymentRecord {
  uuid: string
  last_five?: string
  paid_at: string
  amount: number
  note?: string
  status: string
  store_id: number
  payment_method: string
  created_at: string
}

interface StoreData {
  id: number
  name: string
  code: string
}

// Internal filter state (allows empty string for "all")
interface InternalFilters {
  page: number
  limit: number
  status: string
  payment_method: string
  store_id?: number
  start_date: string
  end_date: string
  search: string
}

interface Props {
  data: PaymentRecord[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stores: StoreData[]
  editingPayments?: Set<string>
  editedData?: Record<string, Partial<PaymentRecord>>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  filterChange: [filters: ApiPaymentFilters]
  edit: [uuid: string]
  delete: [uuid: string]
  batchDelete: [uuids: string[]]
  saveEdit: [uuid: string]
  cancelEdit: [uuid: string]
  updateField: [uuid: string, field: string, value: any]
  selectionChange: [selectedIds: string[]]
  statusChange: [uuid: string, newStatus: string]
  exportSelected: []
  exportFiltered: []
  importExcel: []
  batchStatusUpdate: []
}>()

// 配置 - 緊湊卡片設計
const normalItemHeight = 56   // 緊湊高度（無間距）
const editItemHeight = 340    // 編輯模式高度（手機版需較高）
const visibleCount = 20       // 可見數量
const bufferSize = 5

// 取得今天日期 (YYYY-MM-DD 格式)
const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 狀態
const scrollContainer = ref<HTMLElement>()
const scrollTop = ref(0)
const searchQuery = ref('')
const selectedItems = ref(new Set<string>())
const showDateRange = ref(true)  // 預設展開日期篩選（因為有預設值）

const todayDate = getTodayDate()

const filters = ref<InternalFilters>({
  page: 1,
  limit: 50,
  status: '',
  payment_method: '',
  store_id: undefined,
  start_date: todayDate,  // 預設為今天
  end_date: todayDate,    // 預設為今天
  search: ''
})

// Convert internal filters to API filters
const toApiFilters = (f: InternalFilters): ApiPaymentFilters => ({
  page: f.page,
  limit: f.limit,
  status: f.status ? f.status as '未確認' | '已入帳' | '未入帳' : undefined,
  payment_method: f.payment_method || undefined,
  store_id: f.store_id,
  start_date: f.start_date || undefined,
  end_date: f.end_date || undefined,
  search: f.search || undefined
})

const paymentMethods = [
  '現金', '匯款',
  '電子支付', '電子支付-街口支付', '電子支付-LINE PAY', '電子支付-刷卡', '電子支付-TAP PAY',
  '店內支出', '提領',
  '員工購物-現金', '員工購物-匯款', '員工購物-電子支付'
]

// 計算屬性
const hasActiveFilters = computed(() => {
  return filters.value.status || filters.value.payment_method || filters.value.store_id || filters.value.start_date || filters.value.end_date || searchQuery.value
})

// 全選相關
const isAllSelected = computed(() => {
  return props.data.length > 0 && selectedItems.value.size === props.data.length
})

const isPartiallySelected = computed(() => {
  return selectedItems.value.size > 0 && selectedItems.value.size < props.data.length
})

const totalHeight = computed(() => {
  return props.data.reduce((sum, item) => sum + getItemHeight(item.uuid), 0)
})

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / normalItemHeight) - bufferSize
  return Math.max(0, index)
})

const endIndex = computed(() => {
  const index = startIndex.value + visibleCount + bufferSize * 2
  return Math.min(props.data.length, index)
})

const visibleItems = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const current = props.pagination.page
  const total = props.pagination.totalPages
  const delta = 2

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | string)[] = []
  if (current <= delta + 1) {
    pages.push(...Array.from({ length: delta + 2 }, (_, i) => i + 1), '...', total)
  } else if (current >= total - delta) {
    pages.push(1, '...', ...Array.from({ length: delta + 2 }, (_, i) => total - delta - 1 + i))
  } else {
    pages.push(1, '...', ...Array.from({ length: delta * 2 + 1 }, (_, i) => current - delta + i), '...', total)
  }
  return pages
})

// 方法
const isEditing = (uuid: string) => props.editingPayments?.has(uuid) || false

const getEditedValue = <T>(uuid: string, field: string, defaultValue: T): T => {
  const record = props.editedData?.[uuid]
  if (!record) return defaultValue
  const recordObj = record as Record<string, unknown>
  return recordObj[field] !== undefined ? (recordObj[field] as T) : defaultValue
}

const getItemHeight = (uuid: string) => isEditing(uuid) ? editItemHeight : normalItemHeight

// 優化：預先計算所有項目位置（避免 O(n²) 問題）
const itemPositions = computed(() => {
  const positions = new Map<string, number>()
  let top = 0
  for (const item of props.data) {
    positions.set(item.uuid, top)
    top += getItemHeight(item.uuid)
  }
  return positions
})

const getItemTop = (uuid: string) => itemPositions.value.get(uuid) ?? 0

const onScroll = (event: Event) => {
  scrollTop.value = (event.target as HTMLElement).scrollTop
}

// debounce timer（需在 unmount 時清除）
let searchTimeoutId: number | null = null

const debouncedSearch = () => {
  if (searchTimeoutId) clearTimeout(searchTimeoutId)
  searchTimeoutId = window.setTimeout(() => {
    filters.value.search = searchQuery.value
    onFilterChange()
  }, 300)
}

const onFilterChange = () => {
  filters.value.page = 1
  const apiFilters = toApiFilters(filters.value)
  emit('filterChange', apiFilters)
}

// 狀態篩選變更：未確認/未入帳 自動清除日期篩選
const onStatusFilterChange = () => {
  const status = filters.value.status
  if (status === '未確認' || status === '未入帳') {
    // 清除日期篩選，以便看到所有待處理的記錄
    filters.value.start_date = ''
    filters.value.end_date = ''
  }
  onFilterChange()
}

const goToPage = (page: number) => {
  filters.value.page = page
  emit('filterChange', toApiFilters(filters.value))
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    page: 1,
    limit: 50,
    status: '',
    payment_method: '',
    store_id: undefined,
    start_date: '',
    end_date: '',
    search: ''
  }
  emit('filterChange', toApiFilters(filters.value))
}

// 日期增減（同時調整開始和結束日期）
const changeDate = (delta: number) => {
  const currentDate = filters.value.start_date ? new Date(filters.value.start_date) : new Date()
  currentDate.setDate(currentDate.getDate() + delta)
  const newDate = formatDateString(currentDate)
  filters.value.start_date = newDate
  filters.value.end_date = newDate
  onFilterChange()
}

// 回到今天
const goToToday = () => {
  filters.value.start_date = todayDate
  filters.value.end_date = todayDate
  onFilterChange()
}

// 格式化日期字串
const formatDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateRange = () => {
  if (filters.value.start_date && filters.value.end_date) {
    return `${filters.value.start_date} ~ ${filters.value.end_date}`
  }
  if (filters.value.start_date) return `${filters.value.start_date} 起`
  if (filters.value.end_date) return `至 ${filters.value.end_date}`
  return ''
}

const toggleSelectItem = (uuid: string) => {
  if (selectedItems.value.has(uuid)) {
    selectedItems.value.delete(uuid)
  } else {
    selectedItems.value.add(uuid)
  }
  emit('selectionChange', Array.from(selectedItems.value))
}

const clearSelection = () => {
  selectedItems.value.clear()
  emit('selectionChange', [])
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全選
    selectedItems.value.clear()
  } else {
    // 全選當前頁面的所有記錄
    props.data.forEach(item => {
      selectedItems.value.add(item.uuid)
    })
  }
  emit('selectionChange', Array.from(selectedItems.value))
}

const getStoreName = (storeId: number) => {
  const store = props.stores.find(s => s.id === storeId)
  return store ? store.name : `ID:${storeId}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

const formatDateTimeForEdit = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatPaymentMethod = (method: string) => {
  if (method.startsWith('電子支付-')) return method.replace('電子支付-', '')
  if (method.startsWith('員工購物-')) return '員工-' + method.replace('員工購物-', '')
  return method
}

// 狀態指示條顏色
const getStatusBarClass = (status: string) => {
  switch (status) {
    case '未確認': return 'bg-amber-400'
    case '已入帳': return 'bg-emerald-500'
    case '未入帳': return 'bg-rose-500'
    default: return 'bg-slate-300'
  }
}

// 狀態標籤樣式
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case '未確認': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case '已入帳': return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    case '未入帳': return 'bg-rose-100 text-rose-700 border border-rose-200'
    default: return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}

// 修復：資料變更時清除選取狀態（避免誤刪）
watch(() => props.data, () => {
  // 清除選取狀態
  selectedItems.value.clear()
  emit('selectionChange', [])

  nextTick(() => {
    if (scrollContainer.value) {
      scrollTop.value = scrollContainer.value.scrollTop
    }
  })
})

onMounted(() => {
  // 初始化時發送篩選條件（載入今天的資料）
  emit('filterChange', toApiFilters(filters.value))

  nextTick(() => {
    if (scrollContainer.value) {
      scrollTop.value = scrollContainer.value.scrollTop
    }
  })
})

onUnmounted(() => {
  // 清除 debounce timer
  if (searchTimeoutId) clearTimeout(searchTimeoutId)
})
</script>

<style scoped>
/* 隱藏滾動條但保留功能 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
