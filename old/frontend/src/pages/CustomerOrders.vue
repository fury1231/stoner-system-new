<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black py-6 px-4 xs:px-3 sm:py-8 sm:px-6 lg:px-8 pt-safe-top pb-safe-bottom">
    <!-- 背景裝飾 -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
    </div>
    
    <div class="relative max-w-6xl mx-auto">
      <!-- 標題區域 -->
      <div class="flex items-center justify-between mb-6 xs:mb-4 sm:mb-8">
        <div class="flex items-center space-x-3">
          <div class="flex items-center justify-center w-10 h-10 xs:w-8 xs:h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-lg">
            <svg class="w-6 h-6 xs:w-4 xs:h-4 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0Chat01-2 2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl xs:text-lg sm:text-2xl lg:text-3xl font-bold text-white">客訂單管理</h1>
            <p class="text-gray-400 text-sm xs:text-xs sm:text-base">備忘清單式管理系統</p>
          </div>
        </div>
        
        <button
          @click="goBack"
          class="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-xl border border-gray-600/50 rounded-lg px-4 py-2 text-white text-sm font-medium transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="hidden sm:inline">返回</span>
        </button>
      </div>

      <!-- 統計卡片 -->
      <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-3 sm:gap-6 mb-6 xs:mb-4 sm:mb-8">
        <div class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 xs:p-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm xs:text-xs">總訂單</p>
              <p class="text-white text-xl xs:text-lg font-bold">{{ stats.total }}</p>
            </div>
            <div class="w-10 h-10 xs:w-8 xs:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 xs:w-4 xs:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 xs:p-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm xs:text-xs">進行中</p>
              <p class="text-white text-xl xs:text-lg font-bold">{{ stats.inProgress }}</p>
            </div>
            <div class="w-10 h-10 xs:w-8 xs:h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 xs:w-4 xs:h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 xs:p-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm xs:text-xs">已完成</p>
              <p class="text-white text-xl xs:text-lg font-bold">{{ stats.completed }}</p>
            </div>
            <div class="w-10 h-10 xs:w-8 xs:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 xs:w-4 xs:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 xs:p-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm xs:text-xs">已付款</p>
              <p class="text-white text-xl xs:text-lg font-bold">{{ stats.paid }}</p>
            </div>
            <div class="w-10 h-10 xs:w-8 xs:h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 xs:w-4 xs:h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 篩選區域 -->
      <div class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-3 xs:p-4 mb-4 xs:mb-6 transition-all duration-300">
        <div class="flex flex-col gap-3 xs:gap-4">
          <!-- 標題與控制按鈕 -->
          <div class="flex items-center justify-between">
            <button
              @click="isFilterExpanded = !isFilterExpanded"
              class="flex items-center space-x-2 hover:text-white transition-colors group"
            >
              <svg class="w-4 h-4 xs:w-5 xs:h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              <span class="text-gray-300 text-sm font-medium group-hover:text-white">篩選條件</span>
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-white"
                :class="{ 'rotate-180': isFilterExpanded }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- 緊湊模式切換 -->
            <button
              @click="isCompactMode = !isCompactMode"
              class="flex items-center space-x-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg text-white text-xs transition-colors duration-200"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="isCompactMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
              </svg>
              <span>{{ isCompactMode ? '標準' : '緊湊' }}</span>
            </button>
          </div>

          <!-- 篩選內容區域 - 可摺疊 -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-screen"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 max-h-screen"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="isFilterExpanded" class="space-y-3 xs:space-y-4 overflow-hidden">
              <!-- 搜尋框 -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  v-model="filter.searchQuery"
                  type="text"
                  placeholder="搜尋客戶名稱、電話、商品..."
                  class="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  v-if="filter.searchQuery"
                  @click="filter.searchQuery = ''"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- 日期範圍選擇 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <select
                  v-model="filter.dateRange"
                  class="px-2 xs:px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">所有日期</option>
                  <option value="today">今日</option>
                  <option value="week">最近一週</option>
                  <option value="month">最近一個月</option>
                  <option value="custom">自訂範圍</option>
                </select>

                <!-- 自訂日期範圍 -->
                <template v-if="filter.dateRange === 'custom'">
                  <input
                    v-model="filter.customStartDate"
                    type="date"
                    class="px-2 xs:px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    v-model="filter.customEndDate"
                    type="date"
                    class="px-2 xs:px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </template>
              </div>

              <!-- 其他篩選條件 -->
              <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3">
                <select
                  v-model="filter.status"
                  class="px-2 xs:px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">所有狀態</option>
                  <option value="進行中">進行中</option>
                  <option value="已完成">已完成</option>
                </select>

                <select
                  v-model="filter.paymentStatus"
                  class="px-2 xs:px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">所有付款狀態</option>
                  <option value="已付款">已付款</option>
                  <option value="未付款">未付款</option>
                </select>

                <select
                  v-model="filter.storeId"
                  class="px-2 xs:px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">所有分店</option>
                  <option v-for="store in accessibleStores" :key="store.id" :value="store.id">
                    {{ store.name }}
                  </option>
                </select>

                <button
                  @click="refreshData"
                  :disabled="isLoading"
                  class="px-3 xs:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 xs:space-x-2"
                >
                  <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357 2m15.357-2H15"/>
                  </svg>
                  <span>重新整理</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 客訂單清單 -->
      <div :class="isCompactMode ? 'space-y-2' : 'space-y-3 xs:space-y-4'">
        <div v-if="isLoading" class="text-center py-8 xs:py-6">
          <div class="inline-flex items-center space-x-2 text-gray-400">
            <svg class="animate-spin w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357 2m15.357-2H15"/>
            </svg>
            <span class="text-sm">載入中...</span>
          </div>
        </div>
        
        <div v-else-if="filteredOrders.length === 0" class="text-center py-8 xs:py-6">
          <svg class="mx-auto w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-400 text-base">暫無客訂單資料</p>
          <p class="text-gray-500 text-sm mt-1">請使用付款表單建立新的客訂單</p>
        </div>
        
        <!-- 客訂單卡片 -->
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all duration-200"
          :class="[
            { 'opacity-75': order.status === '已完成' },
            isCompactMode ? 'p-2 xs:p-2.5 sm:p-3' : 'p-4 xs:p-3 sm:p-4'
          ]"
        >
          <!-- iPhone 14 響應式佈局 -->
          <div class="xs:space-y-3 sm:flex sm:items-start sm:justify-between sm:space-y-0">
            <!-- 主要內容區域 -->
            <div class="flex-1">
              <!-- 狀態標記行 -->
              <div class="flex flex-wrap items-center gap-2 xs:gap-1.5 sm:gap-3" :class="isCompactMode ? 'mb-1.5' : 'mb-3 xs:mb-2'">
                <!-- 狀態標記 -->
                <div class="flex items-center space-x-1.5 xs:space-x-1">
                  <div 
                    class="w-3 h-3 xs:w-2.5 xs:h-2.5 rounded-full"
                    :class="{
                      'bg-yellow-500': order.status === '進行中',
                      'bg-green-500': order.status === '已完成'
                    }"
                  ></div>
                  <span 
                    class="text-sm xs:text-xs-mobile font-medium"
                    :class="{
                      'text-yellow-400': order.status === '進行中',
                      'text-green-400': order.status === '已完成'
                    }"
                  >
                    {{ order.status }}
                  </span>
                </div>
                
                <!-- 付款狀態 -->
                <span 
                  class="px-1.5 py-0.5 xs:px-1 xs:py-0.5 text-xs xs:text-xs-mobile font-medium rounded-full"
                  :class="{
                    'bg-emerald-500/20 text-emerald-400': order.payment_status === '已付款',
                    'bg-red-500/20 text-red-400': order.payment_status === '未付款'
                  }"
                >
                  {{ order.payment_status }}
                </span>
                
                <!-- 分店標記 -->
                <span class="px-1.5 py-0.5 xs:px-1 xs:py-0.5 bg-blue-500/20 text-blue-400 text-xs xs:text-xs-mobile font-medium rounded-full">
                  {{ order.store_name }}
                </span>
              </div>
              
              <!-- 訂單資訊 -->
              <div :class="isCompactMode ? 'space-y-1' : 'space-y-2 xs:space-y-1.5'">
                <!-- 商品資訊 -->
                <div class="flex items-start space-x-2">
                  <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v1a2 2 0 002 2v0a1 1 0 001 1h2a1 1 0 001-1v0a2 2 0 002-2V7m-6 0h6M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7H5z"/>
                  </svg>
                  <span class="text-white font-medium text-sm xs:text-sm-mobile break-words">{{ order.products }}</span>
                </div>
                
                <!-- 客戶資訊 -->
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <div class="flex flex-col xs:flex-row xs:items-center xs:space-x-2 text-sm xs:text-sm-mobile">
                    <span class="text-gray-300 font-medium">{{ order.customer_name }}</span>
                    <span class="text-gray-500 hidden xs:inline">|</span>
                    <span class="text-gray-300 text-xs xs:text-sm-mobile">{{ order.customer_phone }}</span>
                  </div>
                </div>
                
                <!-- 物流資訊 -->
                <div class="flex items-start space-x-2">
                  <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <span class="text-gray-300 text-sm xs:text-sm-mobile break-words">{{ order.logistics }}</span>
                </div>
                
                <!-- 金額資訊 -->
                <div v-if="order.amount" class="flex items-center space-x-2">
                  <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                  <span class="text-green-400 font-medium text-sm xs:text-sm-mobile">NT$ {{ order.amount?.toLocaleString() }}</span>
                </div>
                
                <!-- 建立資訊 -->
                <div class="flex items-center space-x-2 text-xs xs:text-xs-mobile text-gray-400">
                  <svg class="w-3.5 h-3.5 xs:w-3 xs:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v1a2 2 0 002 2v0a1 1 0 001 1h2a1 1 0 001-1v0a2 2 0 002-2V7m-6 0h6M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7H5z"/>
                  </svg>
                  <span class="truncate">{{ formatDateForDisplay(order.order_date) }} | {{ order.created_by }}</span>
                </div>
                
                <div v-if="order.remarks" class="text-sm text-gray-400 bg-gray-700/30 rounded-lg p-2 mt-2">
                  <strong>備註：</strong>{{ order.remarks }}
                </div>
              </div>
            </div>
            
            <!-- 操作按鈕區域 - iPhone 14 優化 -->
            <div class="xs:flex xs:flex-row xs:gap-2 xs:mt-3 sm:flex-col sm:space-y-2 sm:ml-4 sm:mt-0">
              <!-- 編輯按鈕 -->
              <button
                @click="editOrder(order)"
                class="px-3 py-2 xs:min-h-[44px] xs:text-xs xs:flex-1 sm:text-sm sm:flex-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 xs:space-x-0.5"
              >
                <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <span class="xs:text-xs">編輯</span>
              </button>
              
              <button
                v-if="order.status === '進行中'"
                @click="markAsCompleted(order)"
                class="px-3 py-2 xs:min-h-[44px] xs:text-xs xs:flex-1 sm:text-sm sm:flex-auto bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 xs:space-x-0.5"
              >
                <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="xs:text-xs">完成</span>
              </button>
              
              <!-- 刪除按鈕 - 所有狀態都可刪除 -->
              <button
                @click="deleteOrder(order)"
                class="px-3 py-2 xs:min-h-[44px] xs:text-xs xs:flex-1 sm:text-sm sm:flex-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 xs:space-x-0.5"
              >
                <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span class="xs:text-xs">刪除</span>
              </button>
              
              <button
                v-if="order.status === '已完成'"
                @click="markAsInProgress(order)"
                class="px-3 py-2 xs:min-h-[44px] xs:text-xs xs:flex-1 sm:text-sm sm:flex-auto bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 xs:space-x-0.5"
              >
                <svg class="w-4 h-4 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="xs:text-xs">恢復</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速新增訂單浮動按鈕 -->
    <button
      @click="goToPaymentForm"
      class="fixed bottom-6 right-6 xs:bottom-20 xs:right-4 sm:bottom-8 sm:right-8 w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-40 group"
      title="新增客訂單"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      <span class="absolute right-full mr-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        新增客訂單
      </span>
    </button>

    <!-- 編輯客訂單對話框 -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeEditModal">
      <div class="flex min-h-full items-end justify-center p-2 xs:p-4 text-center sm:items-center sm:p-0">
        <div class="fixed inset-0 bg-black/50 transition-opacity"></div>
        
        <div class="relative transform overflow-hidden rounded-xl bg-gray-800 px-3 xs:px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-xs xs:max-w-sm sm:my-8 sm:max-w-lg sm:p-6 max-h-[90vh] overflow-y-auto">
          <div class="absolute right-0 top-0 pr-4 pt-4">
            <button @click="closeEditModal" class="rounded-md bg-gray-800 text-gray-400 hover:text-gray-200">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg xs:text-base sm:text-lg font-medium leading-6 text-white mb-3 xs:mb-4">編輯客訂單</h3>
              
              <form @submit.prevent="updateOrder" class="space-y-3 xs:space-y-4">
                <!-- 訂單日期 -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">訂單日期</label>
                  <input
                    type="date"
                    v-model="editForm.order_date"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <!-- 商品 -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">商品</label>
                  <textarea
                    v-model="editForm.products"
                    rows="2"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入商品描述"
                    required
                  ></textarea>
                </div>
                
                <!-- 取件名稱 -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">取件名稱</label>
                  <input
                    type="text"
                    v-model="editForm.customer_name"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入取件人姓名"
                    required
                  />
                </div>
                
                <!-- 取件電話 -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">取件電話</label>
                  <input
                    type="tel"
                    v-model="editForm.customer_phone"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入聯絡電話"
                    required
                  />
                </div>
                
                <!-- 付款狀況和訂單狀態 -->
                <div class="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">付款狀況</label>
                    <select
                      v-model="editForm.payment_status"
                      class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="已付款">已付款</option>
                      <option value="未付款">未付款</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">訂單狀態</label>
                    <select
                      v-model="editForm.status"
                      class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="進行中">進行中</option>
                      <option value="已完成">已完成</option>
                    </select>
                  </div>
                </div>
                
                <!-- 物流資訊 -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">物流資訊</label>
                  <input
                    type="text"
                    v-model="editForm.logistics"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入物流相關資訊"
                    required
                  />
                </div>
                
                <!-- 金額 -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">金額</label>
                  <input
                    type="number"
                    v-model.number="editForm.amount"
                    min="0"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入金額（可選）"
                  />
                </div>
                
                <!-- 分店選擇 -->
                <div v-if="accessibleStores.length > 1">
                  <label class="block text-sm font-medium text-gray-300 mb-1">分店</label>
                  <select
                    v-model="editForm.store_id"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option v-for="store in accessibleStores" :key="store.id" :value="store.id">
                      {{ store.name }}
                    </option>
                  </select>
                </div>
                
                <!-- 備註 -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">備註</label>
                  <textarea
                    v-model="editForm.remarks"
                    rows="2"
                    class="w-full px-2 xs:px-3 py-2 text-sm xs:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入備註（可選）"
                  ></textarea>
                </div>
                
                <div class="mt-4 xs:mt-5 sm:mt-4 flex flex-col xs:flex-row gap-2 xs:gap-3 sm:flex-row-reverse">
                  <button
                    type="submit"
                    :disabled="isUpdating"
                    class="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto order-2 xs:order-1"
                  >
                    <svg v-if="isUpdating" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isUpdating ? '更新中...' : '更新' }}
                  </button>
                  <button
                    type="button"
                    @click="closeEditModal"
                    class="inline-flex w-full justify-center rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-300 shadow-sm hover:bg-gray-600 sm:mt-0 sm:w-auto order-1 xs:order-2"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 刪除確認對話框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeDeleteModal">
      <div class="flex min-h-full items-end justify-center p-3 xs:p-4 text-center sm:items-center sm:p-0">
        <div class="fixed inset-0 bg-black/50 transition-opacity"></div>
        
        <div class="relative transform overflow-hidden rounded-xl bg-gray-800 px-3 xs:px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-xs xs:max-w-sm sm:my-8 sm:max-w-md sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex h-10 w-10 xs:h-12 xs:w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-5 w-5 xs:h-6 xs:w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 class="text-base xs:text-lg font-medium leading-6 text-white">確認刪除</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-300">
                  確定要刪除客戶 <span class="font-semibold text-white">{{ orderToDelete?.customer_name }}</span> 的訂單嗎？
                </p>
                <div class="mt-2 xs:mt-3 p-2 xs:p-3 bg-gray-700/50 rounded-lg">
                  <p class="text-xs text-gray-400 mb-1">訂單詳情：</p>
                  <p class="text-sm text-gray-200 break-words">{{ orderToDelete?.products }}</p>
                  <p class="text-xs text-gray-400 mt-1">訂單日期：{{ formatDateForDisplay(orderToDelete?.order_date || '') }}</p>
                </div>
                <p class="text-sm text-red-400 mt-2 xs:mt-3 font-medium">
                  ⚠️ 此操作無法恢復
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4 xs:mt-5 sm:mt-4 flex flex-col xs:flex-row gap-2 xs:gap-3 sm:flex-row-reverse">
            <button
              @click="confirmDelete"
              :disabled="isDeleting"
              class="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto order-2 xs:order-1"
            >
              <svg v-if="isDeleting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isDeleting ? '刪除中...' : '是，刪除' }}
            </button>
            <button
              @click="closeDeleteModal"
              :disabled="isDeleting"
              class="inline-flex w-full justify-center rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-300 shadow-sm hover:bg-gray-600 disabled:opacity-50 sm:mt-0 sm:w-auto order-1 xs:order-2"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { customerOrderApi, storeApi, getCurrentUserInfo, type CustomerOrderRecord, type StoreData, type UserRecord } from '@/utils/api'

const router = useRouter()

// 響應式數據
const orders = ref<CustomerOrderRecord[]>([])
const stores = ref<StoreData[]>([])
const currentUser = ref<UserRecord | null>(null)
const isLoading = ref(false)
const showEditModal = ref(false)
const isUpdating = ref(false)
const editingOrder = ref<CustomerOrderRecord | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const orderToDelete = ref<CustomerOrderRecord | null>(null)

// 篩選條件
const filter = reactive({
  status: '進行中',
  paymentStatus: '',
  storeId: '',
  searchQuery: '',
  dateRange: 'all', // all, today, week, month, custom
  customStartDate: '',
  customEndDate: ''
})

// 視圖模式
const isCompactMode = ref(false)

// 篩選區域展開狀態
const isFilterExpanded = ref(true)

// 編輯表單
const editForm = reactive({
  order_date: '',
  products: '',
  customer_name: '',
  customer_phone: '',
  payment_status: '',
  status: '',
  logistics: '',
  remarks: '',
  amount: null as number | null,
  store_id: null as number | null
})

// 統計數據
const stats = computed(() => {
  // 使用篩選後的訂單來計算統計數據（不包括狀態篩選）
  let relevantOrders = orders.value
  
  // 根據用戶權限過濾訂單
  if (currentUser.value && currentUser.value.role !== 'admin') {
    const userAccessibleStoreIds = accessibleStores.value.map(store => store.id)
    relevantOrders = relevantOrders.filter(order => userAccessibleStoreIds.includes(order.store_id))
  }
  
  const total = relevantOrders.length
  const inProgress = relevantOrders.filter(order => order.status === '進行中').length
  const completed = relevantOrders.filter(order => order.status === '已完成').length
  const paid = relevantOrders.filter(order => order.payment_status === '已付款').length
  
  return { total, inProgress, completed, paid }
})

// 根據用戶權限篩選的分店
const accessibleStores = computed(() => {
  if (!currentUser.value) return []
  
  // 管理員可以看到所有分店
  if (currentUser.value.role === 'admin') {
    return stores.value
  }
  
  // 一般用戶只能看到有權限的分店
  if (currentUser.value.accessible_stores && currentUser.value.accessible_stores.length > 0) {
    return stores.value.filter(store => currentUser.value!.accessible_stores!.includes(store.id))
  }
  
  // 如果有指定的分店 ID，只顯示該分店
  if (currentUser.value.store_id) {
    return stores.value.filter(store => store.id === currentUser.value!.store_id)
  }
  
  return []
})

// 篩選後的訂單
const filteredOrders = computed(() => {
  let filtered = orders.value

  // 根據用戶權限過濾訂單
  if (currentUser.value && currentUser.value.role !== 'admin') {
    const userAccessibleStoreIds = accessibleStores.value.map(store => store.id)
    filtered = filtered.filter(order => userAccessibleStoreIds.includes(order.store_id))
  }

  // 狀態篩選
  if (filter.status) {
    filtered = filtered.filter(order => order.status === filter.status)
  }

  // 付款狀態篩選
  if (filter.paymentStatus) {
    filtered = filtered.filter(order => order.payment_status === filter.paymentStatus)
  }

  // 分店篩選
  if (filter.storeId) {
    filtered = filtered.filter(order => order.store_id === parseInt(filter.storeId))
  }

  // 搜尋篩選
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase()
    filtered = filtered.filter(order =>
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_phone.includes(query) ||
      order.products.toLowerCase().includes(query) ||
      (order.remarks && order.remarks.toLowerCase().includes(query))
    )
  }

  // 日期範圍篩選
  if (filter.dateRange !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.order_date)

      switch (filter.dateRange) {
        case 'today':
          return orderDate >= today
        case 'week':
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return orderDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return orderDate >= monthAgo
        case 'custom':
          if (filter.customStartDate && filter.customEndDate) {
            const startDate = new Date(filter.customStartDate)
            const endDate = new Date(filter.customEndDate)
            endDate.setHours(23, 59, 59, 999) // 包含結束日期整天
            return orderDate >= startDate && orderDate <= endDate
          }
          return true
        default:
          return true
      }
    })
  }

  // 依狀態排序：進行中在前，已完成在後
  return filtered.sort((a, b) => {
    if (a.status === '進行中' && b.status === '已完成') return -1
    if (a.status === '已完成' && b.status === '進行中') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

// 載入數據
const loadData = async () => {
  isLoading.value = true
  try {
    const [ordersResponse, storesResponse, userResponse] = await Promise.all([
      customerOrderApi.getAll(),
      storeApi.getAll(),
      getCurrentUserInfo()
    ])
    
    orders.value = ordersResponse.data.orders
    stores.value = storesResponse.data
    currentUser.value = userResponse
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

// 重新整理數據
const refreshData = () => {
  loadData()
}

// 輔助函數：將日期格式化為 HTML date input 所需的 YYYY-MM-DD 格式
const formatDateForInput = (dateString: string): string => {
  console.log('formatDateForInput 輸入:', dateString)
  if (!dateString) {
    console.log('formatDateForInput 輸出: 空字符串')
    return ''
  }
  
  let result = ''
  // 處理各種可能的日期格式
  if (dateString.includes('T')) {
    // ISO 8601 格式: 2024-01-15T10:30:00Z
    result = dateString.split('T')[0]
    console.log('formatDateForInput ISO格式處理:', result)
  } else if (dateString.includes(' ')) {
    // 包含時間: 2024-01-15 10:30:00
    result = dateString.split(' ')[0]
    console.log('formatDateForInput 時間格式處理:', result)
  } else if (dateString.includes('/')) {
    // 斜線格式: 2025/08/07
    result = dateString.replace(/\//g, '-')
    console.log('formatDateForInput 斜線格式處理:', result)
  } else {
    // 已經是 YYYY-MM-DD 格式
    result = dateString
    console.log('formatDateForInput 直接返回:', result)
  }
  
  return result
}

// 輔助函數：將日期格式化為顯示用的 YYYY / MM / DD 格式
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return ''
  
  // 先取得基本的 YYYY-MM-DD 格式
  let baseDate = dateString
  if (dateString.includes('T')) {
    baseDate = dateString.split('T')[0]
  } else if (dateString.includes(' ')) {
    baseDate = dateString.split(' ')[0]
  }
  
  // 轉換為 YYYY / MM / DD 格式
  if (baseDate.includes('-')) {
    return baseDate.replace(/-/g, ' / ')
  }
  
  return baseDate
}

// 編輯客訂單
const editOrder = (order: CustomerOrderRecord) => {
  editingOrder.value = order
  // 填充編輯表單
  // 確保日期格式正確 (YYYY-MM-DD)
  console.log('原始日期:', order.order_date)
  const formattedDate = formatDateForInput(order.order_date)
  console.log('格式化後:', formattedDate)
  
  // 使用 Object.assign 確保響應式更新
  Object.assign(editForm, {
    order_date: formattedDate,
    products: order.products,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    payment_status: order.payment_status,
    status: order.status,
    logistics: order.logistics,
    remarks: order.remarks || '',
    amount: order.amount || null,
    store_id: order.store_id
  })
  
  showEditModal.value = true
}

// 關閉編輯對話框
const closeEditModal = () => {
  showEditModal.value = false
  editingOrder.value = null
  // 重置表單
  Object.assign(editForm, {
    order_date: '',
    products: '',
    customer_name: '',
    customer_phone: '',
    payment_status: '',
    status: '',
    logistics: '',
    remarks: '',
    amount: null,
    store_id: null
  })
}

// 更新客訂單
const updateOrder = async () => {
  if (!editingOrder.value) return
  
  isUpdating.value = true
  try {
    const updateData: any = { ...editForm }
    // 移除空值和未改變的值
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === null) {
        delete updateData[key]
      }
    })
    
    const response = await customerOrderApi.update(editingOrder.value.id, updateData)
    
    // 更新本地數據
    const index = orders.value.findIndex(o => o.id === editingOrder.value!.id)
    if (index !== -1) {
      orders.value[index] = { ...orders.value[index], ...response.data.order }
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Failed to update order:', error)
    alert('更新失敗，請稍後再試')
  } finally {
    isUpdating.value = false
  }
}

// 標記為已完成
const markAsCompleted = async (order: CustomerOrderRecord) => {
  try {
    await customerOrderApi.updateStatus(order.id, '已完成')
    order.status = '已完成'
  } catch (error) {
    console.error('Failed to mark as completed:', error)
  }
}

// 標記為進行中
const markAsInProgress = async (order: CustomerOrderRecord) => {
  try {
    await customerOrderApi.updateStatus(order.id, '進行中')
    order.status = '進行中'
  } catch (error) {
    console.error('Failed to mark as in progress:', error)
  }
}

// 顯示刪除確認對話框
const deleteOrder = (order: CustomerOrderRecord) => {
  orderToDelete.value = order
  showDeleteModal.value = true
}

// 關閉刪除確認對話框
const closeDeleteModal = () => {
  showDeleteModal.value = false
  orderToDelete.value = null
}

// 確認刪除訂單
const confirmDelete = async () => {
  if (!orderToDelete.value) return
  
  isDeleting.value = true
  try {
    await customerOrderApi.delete(orderToDelete.value.id)
    orders.value = orders.value.filter(o => o.id !== orderToDelete.value!.id)
    closeDeleteModal()
  } catch (error) {
    console.error('Failed to delete order:', error)
    alert('刪除失敗，請稍後再試')
  } finally {
    isDeleting.value = false
  }
}

// 返回上一頁
const goBack = () => {
  router.back()
}

// 跳轉到付款表單頁面
const goToPaymentForm = () => {
  router.push('/')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>