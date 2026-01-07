<template>
  <div class="virtual-scroll-container">
    <!-- 篩選控制列 -->
    <div class="mb-4 xs:mb-3 bg-white rounded-lg shadow">
      <!-- 桌面版：篩選面板標題與收起按鈕 -->
      <div class="hidden md:flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          <h3 class="font-semibold text-gray-900">篩選條件</h3>
          <span class="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            {{ getActiveFiltersCount() }} 項篩選
          </span>
        </div>
        <button
          @click="filtersPanelExpanded = !filtersPanelExpanded"
          class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <span>{{ filtersPanelExpanded ? '收起' : '展開' }}</span>
          <svg
            :class="{ 'rotate-180': filtersPanelExpanded }"
            class="w-4 h-4 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      <!-- 手機版：篩選面板標題與收起按鈕 -->
      <div class="md:hidden flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          <h3 class="font-semibold text-gray-900">篩選條件</h3>
          <span v-if="!filtersPanelExpanded" class="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            {{ getActiveFiltersCount() }} 項篩選
          </span>
        </div>
        <button
          @click="filtersPanelExpanded = !filtersPanelExpanded"
          class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-touch"
        >
          <span>{{ filtersPanelExpanded ? '收起' : '展開' }}</span>
          <svg
            :class="{ 'rotate-180': filtersPanelExpanded }"
            class="w-4 h-4 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      <!-- 手機版：收起時顯示的摘要 -->
      <div v-if="!filtersPanelExpanded" class="md:hidden p-3 space-y-2">
        <div class="flex flex-wrap gap-2">
          <span v-if="filters.status" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            狀態: {{ filters.status }}
          </span>
          <span v-if="selectedPaymentMethods.length > 0 && selectedPaymentMethods.length < paymentMethods.length" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            方式: {{ selectedPaymentMethods.length }} 項
          </span>
          <span v-if="selectedStoreIds.length > 0 && selectedStoreIds.length < stores.length" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            分店: {{ selectedStoreIds.length }} 個
          </span>
          <span v-if="filters.start_date || filters.end_date" class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            日期範圍
          </span>
          <span v-if="searchQuery" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            搜尋: {{ searchQuery.substring(0, 10) }}{{ searchQuery.length > 10 ? '...' : '' }}
          </span>
        </div>
        <div class="text-xs text-gray-500">
          點擊「展開」查看完整篩選選項
        </div>
      </div>

      <!-- 篩選表單內容 -->
      <div v-show="filtersPanelExpanded" class="p-4 xs:p-3">
      <div class="grid grid-cols-1 xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-3">
        <!-- 搜尋框 -->
        <div>
          <label class="block text-sm xs:text-sm-mobile font-medium text-gray-700 mb-1">搜尋</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="UUID, 後五碼, 備註..."
            class="w-full px-3 py-2 xs:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base xs:text-base-mobile min-h-touch"
            @input="debouncedSearch"
          />
        </div>

        <!-- 狀態篩選 -->
        <div>
          <label class="block text-sm xs:text-sm-mobile font-medium text-gray-700 mb-1">狀態</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 xs:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base xs:text-base-mobile min-h-touch"
            @change="onFilterChange"
          >
            <option value="">全部狀態</option>
            <option value="未確認">未確認</option>
            <option value="已入帳">已入帳</option>
            <option value="未入帳">未入帳</option>
          </select>
        </div>

        <!-- 付款方式篩選 -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-sm font-medium text-gray-700">付款方式 (可多選)</label>
            <button
              @click="paymentMethodsExpanded = !paymentMethodsExpanded"
              class="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 px-2 py-1 rounded border border-transparent hover:border-blue-200"
            >
              <span>{{ paymentMethodsExpanded ? '收起' : '展開' }}</span>
              <svg 
                :class="{ 'rotate-180': paymentMethodsExpanded }" 
                class="ml-1 w-3 h-3 transition-transform duration-200"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
          
          <!-- 簡化顯示（收起狀態） -->
          <div v-if="!paymentMethodsExpanded" class="border border-gray-300 rounded-md p-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" @click="paymentMethodsExpanded = true">
            <div class="text-sm text-gray-600">
              <span v-if="selectedPaymentMethods.length === 0" class="font-medium text-blue-600">全部方式</span>
              <span v-else-if="selectedPaymentMethods.length === paymentMethods.length" class="font-medium text-blue-600">全部方式</span>
              <span v-else class="font-medium text-blue-600">已選 {{ selectedPaymentMethods.length }} 項: </span>
              <span v-if="selectedPaymentMethods.length > 0 && selectedPaymentMethods.length < paymentMethods.length" class="text-xs">
                {{ selectedPaymentMethods.slice(0, 2).join(', ') }}
                <span v-if="selectedPaymentMethods.length > 2">等...</span>
              </span>
            </div>
          </div>
          
          <!-- 完整顯示（展開狀態） -->
          <div 
            v-if="paymentMethodsExpanded" 
            class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white transition-all duration-300 ease-in-out"
          >
            <label class="flex items-center">
              <input
                type="checkbox"
                :checked="selectedPaymentMethods.length === 0"
                @change="toggleAllPaymentMethods"
                class="rounded border-gray-300 mr-2"
              />
              <span class="text-sm">全部方式</span>
            </label>
            <label class="flex items-center" v-for="method in paymentMethods" :key="method">
              <input
                type="checkbox"
                :value="method"
                v-model="selectedPaymentMethods"
                @change="onPaymentMethodChange"
                class="rounded border-gray-300 mr-2"
              />
              <span class="text-sm">{{ method }}</span>
            </label>
          </div>
        </div>

        <!-- 分店篩選 -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-sm font-medium text-gray-700">分店 (可多選)</label>
            <button
              @click="storesExpanded = !storesExpanded"
              class="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 px-2 py-1 rounded border border-transparent hover:border-blue-200"
            >
              <span>{{ storesExpanded ? '收起' : '展開' }}</span>
              <svg 
                :class="{ 'rotate-180': storesExpanded }" 
                class="ml-1 w-3 h-3 transition-transform duration-200"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
          
          <!-- 簡化顯示（收起狀態） -->
          <div v-if="!storesExpanded" class="border border-gray-300 rounded-md p-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" @click="storesExpanded = true">
            <div class="text-sm text-gray-600">
              <span v-if="stores.length === 0">載入中...</span>
              <span v-else-if="selectedStoreIds.length === 0" class="font-medium text-blue-600">全部分店</span>
              <span v-else-if="selectedStoreIds.length === stores.length" class="font-medium text-blue-600">全部分店</span>
              <span v-else class="font-medium text-blue-600">已選 {{ selectedStoreIds.length }} 個分店: </span>
              <span v-if="selectedStoreIds.length > 0 && selectedStoreIds.length < stores.length" class="text-xs">
                {{ selectedStoreIds.slice(0, 2).map(id => stores.find(s => s.id === id)?.name).join(', ') }}
                <span v-if="selectedStoreIds.length > 2">等...</span>
              </span>
            </div>
          </div>
          
          <!-- 完整顯示（展開狀態） -->
          <div 
            v-if="storesExpanded" 
            class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white transition-all duration-300 ease-in-out"
          >
            <div v-if="stores.length === 0" class="text-sm text-gray-500 p-2">
              載入分店資料中...
            </div>
            <template v-else>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  :checked="selectedStoreIds.length === 0"
                  @change="toggleAllStores"
                  class="rounded border-gray-300 mr-2"
                />
                <span class="text-sm">全部分店</span>
              </label>
              <label class="flex items-center" v-for="store in stores" :key="store.id">
                <input
                  type="checkbox"
                  :value="store.id"
                  v-model="selectedStoreIds"
                  @change="onStoreChange"
                  class="rounded border-gray-300 mr-2"
                />
                <span class="text-sm">{{ store.name }} ({{ store.code }})</span>
              </label>
            </template>
          </div>
        </div>
      </div>

      <!-- 日期範圍 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
          <input
            v-model="filters.start_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="onFilterChange"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
          <input
            v-model="filters.end_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="onFilterChange"
          />
        </div>
      </div>

      <!-- 統計資訊 -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          共 {{ pagination.total }} 筆記錄，第 {{ pagination.page }} / {{ pagination.totalPages }} 頁
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">每頁顯示:</label>
          <select
            v-model="filters.limit"
            class="px-2 py-1 border border-gray-300 rounded"
            @change="onFilterChange"
          >
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
      </div>
    </div>

    <!-- 載入指示器 -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span class="ml-2 text-gray-600">載入中...</span>
    </div>

    <!-- 虛擬滾動表格 -->
    <div
      v-else
      ref="scrollContainer"
      class="virtual-scroll-wrapper bg-white rounded-lg shadow overflow-y-auto"
      style="height: calc(100vh - 350px); min-height: 500px;"
      @scroll="onScroll"
    >
      <!-- 桌面版表格標題 -->
      <div class="sticky top-0 bg-gray-50 border-b border-gray-200 z-10 hidden md:block">
        <div class="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700">
          <div class="col-span-1">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="rounded border-gray-300"
            />
          </div>
          <div class="col-span-2">付款時間</div>
          <div class="col-span-1">方式</div>
          <div class="col-span-1">後五碼</div>
          <div class="col-span-1">金額</div>
          <div class="col-span-1">狀態</div>
          <div class="col-span-1">分店</div>
          <div class="col-span-3">備註</div>
          <div class="col-span-1">操作</div>
        </div>
      </div>

      <!-- 手機版批量選擇控制 -->
      <div class="sticky top-0 bg-gray-50 border-b border-gray-200 z-10 md:hidden p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="rounded border-gray-300"
            />
            <span class="text-sm font-medium text-gray-700">全選</span>
          </div>
          <div class="text-xs text-gray-500">
            共 {{ pagination.total }} 筆記錄
          </div>
        </div>
      </div>

      <!-- 虛擬滾動內容 -->
      <div 
        :style="{ height: totalHeight + 'px', position: 'relative' }"
        class="virtual-scroll-content"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="item.uuid"
          :style="{
            position: 'absolute',
            top: getItemTop(item.uuid, startIndex + index) + 'px',
            width: '100%',
            height: getItemHeight(item.uuid) + 'px'
          }"
          class="virtual-item md:border-b md:border-gray-100 md:hover:bg-gray-50 border-b-2 border-gray-200"
        >
          <!-- 桌面版表格佈局 -->
          <div class="hidden md:grid grid-cols-12 gap-2 p-3 text-sm items-center">
            <div class="col-span-1">
              <input
                type="checkbox"
                :checked="selectedItems.has(item.uuid)"
                @change="toggleSelectItem(item.uuid)"
                class="rounded border-gray-300"
              />
            </div>
            <div class="col-span-2">
              <input 
                v-if="isEditing(item.uuid)"
                :value="formatDateTimeForEdit(getEditedValue(item.uuid, 'paid_at', item.paid_at))"
                @input="$emit('updateField', item.uuid, 'paid_at', $event.target.value)"
                type="datetime-local"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <div v-else>
                {{ formatDate(item.paid_at) }}
              </div>
            </div>
            <div class="col-span-1">
              <select
                v-if="isEditing(item.uuid)"
                :value="getEditedValue(item.uuid, 'payment_method', item.payment_method)"
                @change="$emit('updateField', item.uuid, 'payment_method', $event.target.value)"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="一般收款">
                  <option value="現金">現金</option>
                  <option value="匯款">匯款</option>
                  <option value="電子支付">電子支付</option>
                  <option value="客訂單">客訂單</option>
                </optgroup>

                <optgroup label="員工購物">
                  <option value="員工購物-現金">現金</option>
                  <option value="員工購物-匯款">匯款</option>
                  <option value="員工購物-電子支付">電子支付</option>
                </optgroup>

                <optgroup label="支出項目">
                  <option value="店內支出">店內支出</option>
                  <option value="提領">提領</option>
                </optgroup>
              </select>
              <span v-else class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {{ item.payment_method }}
              </span>
            </div>
            <div class="col-span-1">
              {{ item.last_five || '-' }}
            </div>
            <div class="col-span-1 font-medium">
              <input
                v-if="isEditing(item.uuid)"
                :value="getEditedValue(item.uuid, 'amount', item.amount)"
                @input="$emit('updateField', item.uuid, 'amount', Number($event.target.value))"
                type="number"
                min="1"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span v-else>NT$ {{ item.amount.toLocaleString() }}</span>
            </div>
            <div class="col-span-1">
              <select 
                :value="item.status"
                @change="$emit('statusChange', item.uuid, $event.target.value)"
                :class="{
                  'bg-yellow-50 border-yellow-300 text-yellow-800': item.status === '未確認',
                  'bg-green-50 border-green-300 text-green-800': item.status === '已入帳',
                  'bg-red-50 border-red-300 text-red-800': item.status === '未入帳'
                }"
                class="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="未確認">未確認</option>
                <option value="已入帳">已入帳</option>
                <option value="未入帳">未入帳</option>
              </select>
            </div>
            <div class="col-span-1">
              {{ getStoreName(item.store_id) }}
            </div>
            <div class="col-span-3">
              <input 
                v-if="isEditing(item.uuid)"
                :value="getEditedValue(item.uuid, 'note', item.note || '')"
                @input="$emit('updateField', item.uuid, 'note', $event.target.value)"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="備註"
              />
              <div v-else-if="isCustomerOrder(item)" class="text-xs">
                <div class="bg-cyan-50 border border-cyan-200 rounded p-2">
                  <div class="font-medium text-cyan-800 mb-1">📋 客訂單交付進度</div>
                  <div class="space-y-1">
                    <div v-for="orderData in [parseCustomerOrder(item)]" :key="item.uuid">
                      <div class="text-cyan-700"><strong>商品：</strong>{{ orderData.products }}</div>
                      <div class="text-cyan-700"><strong>取件：</strong>{{ orderData.customerName }} ({{ orderData.customerPhone }})</div>
                      <div class="text-cyan-700"><strong>付款：</strong>{{ orderData.paymentStatus }}</div>
                      <div v-if="orderData.logistics" class="text-cyan-700"><strong>物流：</strong>{{ orderData.logistics }}</div>
                      <div v-if="orderData.remarks" class="text-cyan-700"><strong>備註：</strong>{{ orderData.remarks }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="truncate" :title="item.note">
                {{ item.note || '-' }}
              </div>
            </div>
            <div class="col-span-1">
              <div class="flex gap-1">
                <template v-if="isEditing(item.uuid)">
                  <button
                    @click="$emit('saveEdit', item.uuid)"
                    class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    title="保存"
                  >
                    ✓
                  </button>
                  <button
                    @click="$emit('cancelEdit', item.uuid)"
                    class="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    title="取消"
                  >
                    ✕
                  </button>
                </template>
                <template v-else>
                  <button
                    @click="$emit('edit', item.uuid)"
                    class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    編輯
                  </button>
                  <button
                    @click="$emit('delete', item.uuid)"
                    class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    刪除
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- 手機版卡片佈局 -->
          <div class="md:hidden h-full flex flex-col" :class="isEditing(item.uuid) ? 'bg-blue-50' : 'bg-white'">
            <!-- 編輯模式 -->
            <template v-if="isEditing(item.uuid)">
              <div class="p-2 space-y-1.5 flex-1">
                <div class="text-xs font-semibold text-blue-900 mb-0.5">✏️ 編輯中</div>

                <!-- 金額與付款方式 -->
                <div class="grid grid-cols-2 gap-1.5">
                  <div>
                    <label class="text-xs text-gray-600 block mb-0.5">金額</label>
                    <input
                      :value="getEditedValue(item.uuid, 'amount', item.amount)"
                      @input="$emit('updateField', item.uuid, 'amount', Number($event.target.value))"
                      type="number"
                      class="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 block mb-0.5">付款方式</label>
                    <select
                      :value="getEditedValue(item.uuid, 'payment_method', item.payment_method)"
                      @change="$emit('updateField', item.uuid, 'payment_method', $event.target.value)"
                      class="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                    >
                      <optgroup label="一般收款">
                        <option value="現金">現金</option>
                        <option value="匯款">匯款</option>
                        <option value="電子支付">電子支付</option>
                        <option value="客訂單">客訂單</option>
                      </optgroup>

                      <optgroup label="員工購物">
                        <option value="員工購物-現金">現金</option>
                        <option value="員工購物-匯款">匯款</option>
                        <option value="員工購物-電子支付">電子支付</option>
                      </optgroup>

                      <optgroup label="支出項目">
                        <option value="店內支出">店內支出</option>
                        <option value="提領">提領</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <!-- 付款時間 -->
                <div>
                  <label class="text-xs text-gray-600 block mb-0.5">付款時間</label>
                  <input
                    :value="formatDateTimeForEdit(getEditedValue(item.uuid, 'paid_at', item.paid_at))"
                    @input="$emit('updateField', item.uuid, 'paid_at', $event.target.value)"
                    type="datetime-local"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                  />
                </div>

                <!-- 備註 -->
                <div>
                  <label class="text-xs text-gray-600 block mb-0.5">備註</label>
                  <textarea
                    :value="getEditedValue(item.uuid, 'note', item.note || '')"
                    @input="$emit('updateField', item.uuid, 'note', $event.target.value)"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded resize-none bg-white"
                    rows="2"
                    placeholder="選填"
                  ></textarea>
                </div>
              </div>

              <!-- 編輯模式按鈕 - 固定在底部 -->
              <div class="flex gap-1.5 px-2 pb-2 pt-3 mt-2 flex-shrink-0">
                <button
                  @click.stop="$emit('saveEdit', item.uuid)"
                  class="flex-1 px-3 py-2 text-xs font-medium bg-green-500 text-white rounded active:opacity-70 shadow-md"
                >
                  ✓ 儲存
                </button>
                <button
                  @click.stop="$emit('cancelEdit', item.uuid)"
                  class="flex-1 px-3 py-2 text-xs font-medium bg-gray-500 text-white rounded active:opacity-70 shadow-md"
                >
                  ✕ 取消
                </button>
              </div>
            </template>

            <!-- 一般顯示模式 -->
            <template v-else>
              <!-- 上半部：主要資訊區 -->
              <div class="px-3 pt-2 pb-1 space-y-1 flex-1">
                <!-- 第一行：勾選 + 金額 + 標籤 -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      :checked="selectedItems.has(item.uuid)"
                      @change="toggleSelectItem(item.uuid)"
                      class="rounded border-gray-300 w-4 h-4 flex-shrink-0"
                      @click.stop
                    />
                    <span class="font-bold text-sm text-gray-900">
                      NT$ {{ item.amount.toLocaleString() }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-1 flex-shrink-0">
                    <span class="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {{ item.payment_method }}
                    </span>
                    <span
                      :class="{
                        'bg-yellow-100 text-yellow-800': item.status === '未確認',
                        'bg-green-100 text-green-800': item.status === '已入帳',
                        'bg-red-100 text-red-800': item.status === '未入帳'
                      }"
                      class="px-1.5 py-0.5 text-xs font-medium rounded"
                    >
                      {{ item.status }}
                    </span>
                  </div>
                </div>

                <!-- 第二行：時間 + 分店 -->
                <div class="flex justify-between text-xs text-gray-600">
                  <span class="truncate">📅 {{ formatDate(item.paid_at).substring(0, 16) }}</span>
                  <span class="truncate ml-2">🏪 {{ getStoreName(item.store_id).split('(')[0].trim() }}</span>
                </div>

                <!-- 第三行：後五碼或備註 -->
                <div class="text-xs text-gray-600 truncate">
                  <span v-if="item.last_five">💳 {{ item.last_five }}</span>
                  <span v-else-if="item.note && !isCustomerOrder(item)">📝 {{ item.note }}</span>
                  <span v-else-if="isCustomerOrder(item)" class="text-cyan-700">📋 客訂單</span>
                  <span v-else>&nbsp;</span>
                </div>
              </div>

              <!-- 底部按鈕區 - 固定在底部 -->
              <div class="flex gap-1.5 px-2 pb-2 border-t border-gray-100 pt-1.5 flex-shrink-0">
                <button
                  @click.stop="$emit('statusChange', item.uuid, item.status === '已入帳' ? '未確認' : '已入帳')"
                  :class="{
                    'bg-green-50 text-green-700 border-green-200': item.status === '已入帳',
                    'bg-yellow-50 text-yellow-700 border-yellow-200': item.status !== '已入帳'
                  }"
                  class="flex-1 px-2 py-1.5 text-xs font-medium border rounded active:opacity-70 transition-opacity"
                >
                  {{ item.status === '已入帳' ? '✓' : '○' }}
                </button>
                <button
                  @click.stop="$emit('edit', item.uuid)"
                  class="flex-1 px-2 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded active:opacity-70 transition-opacity"
                >
                  ✏️ 編輯
                </button>
                <button
                  @click.stop="$emit('delete', item.uuid)"
                  class="px-2 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded active:opacity-70 transition-opacity"
                >
                  🗑️
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁控制 -->
    <div v-if="!loading && pagination.totalPages > 1" class="mt-4 flex justify-center">
      <nav class="flex items-center gap-2">
        <button
          :disabled="pagination.page === 1"
          @click="goToPage(1)"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          首頁
        </button>
        <button
          :disabled="pagination.page === 1"
          @click="goToPage(pagination.page - 1)"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          上一頁
        </button>
        
        <!-- 頁碼 -->
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            :class="{
              'bg-blue-500 text-white': page === pagination.page,
              'bg-white text-gray-700 hover:bg-gray-50': page !== pagination.page
            }"
            @click="goToPage(Number(page))"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            {{ page }}
          </button>
          <span v-else class="px-3 py-2 text-sm text-gray-500">...</span>
        </template>

        <button
          :disabled="pagination.page === pagination.totalPages"
          @click="goToPage(pagination.page + 1)"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          下一頁
        </button>
        <button
          :disabled="pagination.page === pagination.totalPages"
          @click="goToPage(pagination.totalPages)"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          末頁
        </button>
      </nav>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedItems.size > 0" class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm text-gray-600 font-medium">已選擇 {{ selectedItems.size }} 項</span>
        <button
          @click="emit('exportSelected')"
          class="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center gap-2"
          title="匯出選中記錄"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          匯出選中
        </button>
        <button
          @click="emit('batchStatusUpdate')"
          class="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          批量更新狀態
        </button>
        <button
          @click="emit('batchDelete', Array.from(selectedItems))"
          class="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
        >
          批量刪除
        </button>
        <button
          @click="clearSelection"
          class="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
        >
          清除選擇
        </button>
      </div>
    </div>

    <!-- Excel 操作按鈕（右下角） -->
    <div class="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border space-y-2">
      <button
        @click="emit('exportFiltered')"
        class="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        title="匯出當前篩選的全部記錄"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        匯出全部
      </button>
      <button
        @click="emit('importExcel')"
        class="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        title="匯入 Excel 檔案"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        匯入 Excel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { PaymentRecord, PaymentFilters, PaginatedResponse, StoreData } from '@/utils/api'

// Props
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

// Emits
const emit = defineEmits<{
  filterChange: [filters: PaymentFilters]
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

// 虛擬滾動配置 - 動態卡片高度
const normalItemHeight = 120 // 一般模式：緊湊顯示
const editItemHeight = 270 // 編輯模式：展開表單（增加高度確保按鈕完整顯示）
const visibleCount = 15 // 可見行數
const bufferSize = 5 // 緩衝區大小

// 響應式資料
const scrollContainer = ref<HTMLElement>()
const scrollTop = ref(0)
const searchQuery = ref('')
const selectedItems = ref(new Set<string>())

// 客訂單相關工具函數
const isCustomerOrder = (item: any) => {
  try {
    if (item.payment_method !== '客訂單') return false
    const noteData = JSON.parse(item.note || '{}')
    return noteData.type === 'customer_order'
  } catch {
    return false
  }
}

const parseCustomerOrder = (item: any) => {
  try {
    if (!isCustomerOrder(item)) return null
    return JSON.parse(item.note)
  } catch {
    return null
  }
}

const formatCustomerOrderNote = (item: any) => {
  const orderData = parseCustomerOrder(item)
  if (!orderData) return item.note || '-'
  
  return `【客訂單】${orderData.customerName} (${orderData.customerPhone}) - ${orderData.products}`
}

// 篩選條件
const filters = ref<PaymentFilters>({
  page: 1,
  limit: 50,
  status: '',
  payment_method: '',
  store_id: undefined,
  start_date: '',
  end_date: '',
  search: ''
})

// 多選相關
const paymentMethods = ['現金', '匯款', '電子支付', '店內支出', '提領', '客訂單', '員工購物-現金', '員工購物-匯款', '員工購物-電子支付']
const selectedPaymentMethods = ref<string[]>([])
const selectedStoreIds = ref<number[]>([])

// 展開/收起狀態
const paymentMethodsExpanded = ref(false)
const storesExpanded = ref(false)
const filtersPanelExpanded = ref(false) // 篩選面板展開狀態（初始化時根據螢幕尺寸設定）

// 根據螢幕尺寸初始化篩選面板狀態
const initFiltersPanelState = () => {
  // md 斷點為 768px
  const isMobile = window.innerWidth < 768
  filtersPanelExpanded.value = !isMobile // 桌面版預設展開，行動版預設關閉
}

// 編輯相關函數
const isEditing = (uuid: string) => {
  return props.editingPayments?.has(uuid) || false
}

const getEditedValue = (uuid: string, field: string, defaultValue: any) => {
  return props.editedData?.[uuid]?.[field] !== undefined ? props.editedData[uuid][field] : defaultValue
}

// 動態高度計算
const getItemHeight = (uuid: string) => {
  return isEditing(uuid) ? editItemHeight : normalItemHeight
}

const getItemTop = (uuid: string, index: number) => {
  let top = 0
  for (let i = 0; i < index; i++) {
    const item = props.data[i]
    if (item) {
      top += getItemHeight(item.uuid)
    }
  }
  return top
}

// 計算屬性
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

const isAllSelected = computed(() => {
  return props.data.length > 0 && props.data.every(item => selectedItems.value.has(item.uuid))
})

// 可見頁碼計算
const visiblePages = computed(() => {
  const current = props.pagination.page
  const total = props.pagination.totalPages
  const delta = 2
  
  let pages: (number | string)[] = []
  
  if (total <= 7) {
    pages = Array.from({ length: total }, (_, i) => i + 1)
  } else {
    if (current <= delta + 1) {
      pages = [...Array.from({ length: delta + 2 }, (_, i) => i + 1), '...', total]
    } else if (current >= total - delta) {
      pages = [1, '...', ...Array.from({ length: delta + 2 }, (_, i) => total - delta - 1 + i)]
    } else {
      pages = [1, '...', ...Array.from({ length: delta * 2 + 1 }, (_, i) => current - delta + i), '...', total]
    }
  }
  
  return pages
})

// 防抖搜尋
const debouncedSearch = (() => {
  let timeoutId: number | null = null
  return () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      filters.value.search = searchQuery.value
      onFilterChange()
    }, 500) as unknown as number
  }
})()

// 方法
const onScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

// 多選處理函數
const toggleAllPaymentMethods = () => {
  if (selectedPaymentMethods.value.length === 0) {
    selectedPaymentMethods.value = [...paymentMethods]
  } else {
    selectedPaymentMethods.value = []
  }
  onPaymentMethodChange()
}

const onPaymentMethodChange = () => {
  if (selectedPaymentMethods.value.length === 0) {
    filters.value.payment_methods = undefined
  } else {
    filters.value.payment_methods = [...selectedPaymentMethods.value]
  }
  onFilterChange()
}

const toggleAllStores = () => {
  if (selectedStoreIds.value.length === 0) {
    selectedStoreIds.value = props.stores.map(store => store.id)
  } else {
    selectedStoreIds.value = []
  }
  onStoreChange()
}

const onStoreChange = () => {
  if (selectedStoreIds.value.length === 0) {
    filters.value.store_ids = undefined
  } else {
    filters.value.store_ids = [...selectedStoreIds.value]
  }
  onFilterChange()
}

const onFilterChange = () => {
  filters.value.page = 1 // 重置到第一頁
  console.log('DEBUG - Filter changed:', filters.value)
  console.log('DEBUG - Selected payment methods:', selectedPaymentMethods.value)
  emit('filterChange', { ...filters.value })
}

const goToPage = (page: number) => {
  filters.value.page = page
  emit('filterChange', { ...filters.value })
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value.clear()
  } else {
    props.data.forEach(item => selectedItems.value.add(item.uuid))
  }
  emit('selectionChange', Array.from(selectedItems.value))
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
  emit('selectionChange', Array.from(selectedItems.value))
}

// 計算活動篩選數量
const getActiveFiltersCount = () => {
  let count = 0
  if (filters.value.status) count++
  if (selectedPaymentMethods.value.length > 0 && selectedPaymentMethods.value.length < paymentMethods.length) count++
  if (selectedStoreIds.value.length > 0 && selectedStoreIds.value.length < props.stores.length) count++
  if (filters.value.start_date || filters.value.end_date) count++
  if (searchQuery.value) count++
  return count
}

const getStoreName = (storeId: number) => {
  const store = props.stores.find(s => s.id === storeId)
  return store ? `${store.name} (${store.code})` : `ID:${storeId}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// 將 ISO 時間轉換為 datetime-local 格式
const formatDateTimeForEdit = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 移除動態高度調整，使用固定高度避免虛擬滾動問題

// 監聽篩選變化
watch(() => props.pagination.page, (newPage) => {
  filters.value.page = newPage
})


// 清除選擇當數據變化時
watch(() => props.data, () => {
  selectedItems.value.clear()
})

// 清理組件
onMounted(() => {
  // 根據螢幕尺寸初始化篩選面板狀態
  initFiltersPanelState()
})

onUnmounted(() => {
  // 清理工作
})

</script>

<style scoped>
.virtual-scroll-container {
  position: relative;
}

.virtual-scroll-wrapper {
  overflow-y: auto;
  scrollbar-width: thin;
}

.virtual-scroll-wrapper::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.virtual-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.virtual-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.virtual-item {
  will-change: transform;
  overflow: hidden; /* 防止卡片重疊 */
}

/* 展開收起動畫效果 */
.rotate-180 {
  transform: rotate(180deg);
}

/* 自定義展開收起動畫 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.expand-enter-active {
  animation: slideDown 0.3s ease-out;
}

.expand-leave-active {
  animation: slideUp 0.3s ease-in;
}
</style>