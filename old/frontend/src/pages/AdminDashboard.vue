<template>
  <div class="h-screen-safe bg-gray-50 pt-safe-top overflow-hidden flex flex-col">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-lg xs:text-base-mobile sm:text-xl font-semibold">
              管理後台
              <span class="ml-2 text-xs xs:text-xxs sm:text-sm font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">v3.12</span>
            </h1>
          </div>
          
          <!-- 桌面版導航 -->
          <div class="hidden md:flex items-center space-x-3">
            <button
              @click="goToPaymentForm"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              回到提交表單
            </button>
            
            <button
              @click="goToCustomerOrders"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>客訂單管理</span>
            </button>
            
            <!-- Debug模式開關 -->
            <div class="flex items-center space-x-2">
              <label class="flex items-center space-x-1 cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded border transition-colors duration-200">
                <input 
                  type="checkbox" 
                  v-model="debugMode"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                >
                <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
                <span class="text-xs font-medium text-gray-700">Debug</span>
              </label>
            </div>
            
            <!-- Debug信息（僅在Debug模式開啟時顯示） -->
            <div v-if="debugMode" class="bg-yellow-50 border border-yellow-200 p-2 text-xs rounded-md shadow-sm">
              <div class="flex items-center space-x-1 text-yellow-800">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-mono text-xs">
                  role={{ currentUserInfo?.role || 'null' }}, 
                  user_store={{ currentUserInfo?.store_id || 'null' }}, 
                  stores={{ stores.length }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center space-x-2 bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600">登入用戶：</span>
              <span class="text-sm font-medium text-gray-900">{{ currentUser || '未知' }}</span>
              <span v-if="currentUserInfo?.store_id" class="text-xs text-gray-500">(分店用戶)</span>
            </div>
            <button
              @click="logout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              登出
            </button>
          </div>
          
          <!-- 手機版菜單按鈕 -->
          <div class="md:hidden flex items-center">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 手機版菜單 -->
        <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200 py-2">
          <div class="space-y-3 px-2 xs:px-3 sm:px-4">
            <button
              @click="goToPaymentFormAndCloseMobileMenu"
              class="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 xs:py-3.5 rounded-md text-sm xs:text-sm-mobile font-medium flex items-center space-x-2 min-h-touch"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>回到提交表單</span>
            </button>
            
            <!-- Debug模式開關 -->
            <div class="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="debugMode"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
                <span class="text-sm xs:text-sm-mobile font-medium text-gray-700">Debug模式</span>
              </label>
            </div>
            
            <!-- Debug信息 -->
            <div v-if="debugMode" class="bg-yellow-50 border border-yellow-200 p-3 text-xs rounded-md">
              <div class="text-yellow-800 space-y-1">
                <div>role: {{ currentUserInfo?.role || 'null' }}</div>
                <div>user_store: {{ currentUserInfo?.store_id || 'null' }}</div>
                <div>stores: {{ stores.length }}</div>
              </div>
            </div>
            
            <!-- 用戶信息 -->
            <div class="flex items-center space-x-2 bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600">登入用戶：</span>
              <span class="text-sm font-medium text-gray-900">{{ currentUser || '未知' }}</span>
              <span v-if="currentUserInfo?.store_id" class="text-xs text-gray-500">(分店用戶)</span>
            </div>
            
            <button
              @click="logout"
              class="w-full text-left bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 max-w-7xl w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-8 py-4 xs:py-3 sm:py-6 overflow-hidden flex flex-col">
      <!-- 標籤導航 - 固定不滾動 -->
      <div class="flex-none border-b border-gray-200 mb-6">
        <div class="overflow-x-auto scrollbar-hide">
          <nav class="-mb-px flex space-x-8 min-w-max">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab 內容區域 - 可滾動 -->
      <div class="flex-1" :class="activeTab === 'payments' ? 'overflow-hidden' : 'overflow-y-auto'">

      <!-- 統計儀表板 -->
      <div v-show="activeTab === 'dashboard'" class="space-y-6">
        <!-- 權限檢查 -->
        <div v-if="!hasPermission('view_payments')" class="text-center py-12">
          <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <div class="mb-4">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2m0 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">無權限訪問</h3>
            <p class="text-gray-600 mb-4">您沒有查看統計儀表板的權限</p>
            <p class="text-sm text-gray-500">需要 <code class="bg-gray-200 px-2 py-1 rounded text-xs">view_payments</code> 權限</p>
          </div>
        </div>
        
        <!-- 統計內容 (僅有權限時顯示) -->
        <div v-else>
        <!-- 當日統計卡片 -->
        <div class="mb-4">
          <!-- 標題 -->
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg xs:text-base font-semibold text-gray-900">
              💰 當日營收統計
              <span v-if="selectedStoreForDateStats" class="text-sm xs:text-xs text-blue-600 font-normal ml-1">
                {{ accessibleStores.find(s => s.id === parseInt(selectedStoreForDateStats))?.name }}
              </span>
            </h2>
            <button
              @click="manualRefresh"
              :disabled="activeTab !== 'dashboard'"
              class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm transition-colors disabled:opacity-50"
              title="立即刷新"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>刷新</span>
            </button>
          </div>

          <!-- 控制面板 -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 xs:p-2.5 mb-4 border border-blue-100">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <!-- 日期選擇 -->
              <div class="flex items-center space-x-2 bg-white rounded-md px-3 py-2 shadow-sm">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <input
                  v-model="selectedDate"
                  @change="updateDateStats"
                  type="date"
                  class="flex-1 border-0 p-0 text-sm focus:ring-0 bg-transparent"
                />
              </div>

              <!-- 分店選擇 -->
              <div class="flex items-center space-x-2 bg-white rounded-md px-3 py-2 shadow-sm">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <select
                  v-model="selectedStoreForDateStats"
                  @change="() => { updateDateStats(); updateRangeStats(); }"
                  class="flex-1 border-0 p-0 text-sm focus:ring-0 bg-transparent"
                >
                  <option value="">全部分店</option>
                  <option v-for="store in accessibleStores" :key="store.id" :value="store.id">
                    {{ store.name }}
                  </option>
                </select>
              </div>

              <!-- 自動刷新狀態 -->
              <div class="flex items-center justify-between bg-white rounded-md px-3 py-2 shadow-sm">
                <div class="flex items-center space-x-2">
                  <div :class="autoRefreshEnabled ? 'w-2 h-2 bg-green-500 rounded-full animate-pulse' : 'w-2 h-2 bg-gray-400 rounded-full'"></div>
                  <span class="text-xs text-gray-600">自動刷新</span>
                  <span v-if="autoRefreshEnabled && refreshCountdown > 0" class="text-xs text-blue-600 font-mono">
                    {{ formatCountdown() }}
                  </span>
                </div>
                <button
                  @click="manualRefresh"
                  :disabled="activeTab !== 'dashboard'"
                  class="sm:hidden p-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 xs:gap-2.5 sm:gap-4 md:gap-6">
            <!-- 當日匯款總額卡片 -->
            <div class="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-blue-300">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
              <div class="relative p-3 xs:p-2.5 sm:p-4 md:p-6">
                <!-- 手機版：簡約上下佈局 -->
                <div class="block sm:hidden">
                  <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-xs xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">匯款</h3>
                    <p class="text-sm xs:text-xs-mobile font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{{ formatCurrency(todayStats.remittanceAmount) }}</p>
                  </div>
                </div>
                <!-- 平板和桌面版：原來的佈局 -->
                <div class="hidden sm:block">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-sm xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">匯款總額</h3>
                    <p class="text-2xl xs:text-lg-mobile font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ formatCurrency(todayStats.remittanceAmount) }}</p>
                    <div class="flex items-center text-xs text-gray-500">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                      今日匯款收入
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 當日現金總額卡片 -->
            <div class="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-green-300">
              <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5"></div>
              <div class="relative p-3 xs:p-2.5 sm:p-4 md:p-6">
                <!-- 手機版：簡約上下佈局 -->
                <div class="block sm:hidden">
                  <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-xs xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">現金</h3>
                    <p class="text-sm xs:text-xs-mobile font-bold text-gray-900 group-hover:text-green-600 transition-colors leading-tight">{{ formatCurrency(todayStats.cashAmount) }}</p>
                  </div>
                </div>
                <!-- 平板和桌面版：原來的佈局 -->
                <div class="hidden sm:block">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                      </div>
                    </div>
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-sm xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">現金總額</h3>
                    <p class="text-2xl xs:text-lg-mobile font-bold text-gray-900 group-hover:text-green-600 transition-colors">{{ formatCurrency(todayStats.cashAmount) }}</p>
                    <div class="flex items-center text-xs text-gray-500">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      今日現金收入
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 當日電子支付總額卡片 -->
            <div class="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-purple-300">
              <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5"></div>
              <div class="relative p-3 xs:p-2.5 sm:p-4 md:p-6">
                <!-- 手機版：簡約上下佈局 -->
                <div class="block sm:hidden">
                  <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-xs xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">電子</h3>
                    <p class="text-sm xs:text-xs-mobile font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">{{ formatCurrency(todayStats.electronicAmount) }}</p>
                  </div>
                </div>
                <!-- 平板和桌面版：原來的佈局 -->
                <div class="hidden sm:block">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-sm xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">電子支付</h3>
                    <p class="text-2xl xs:text-lg-mobile font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{{ formatCurrency(todayStats.electronicAmount) }}</p>
                    <div class="flex items-center text-xs text-gray-500">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      今日電子收入
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 當日店內營收卡片 -->
            <div class="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-indigo-300">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5"></div>
              <div class="relative p-3 xs:p-2.5 sm:p-4 md:p-6">
                <!-- 手機版：簡約上下佈局 -->
                <div class="block sm:hidden">
                  <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-xs xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">營收</h3>
                    <p class="text-sm xs:text-xs-mobile font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{{ formatCurrency(todayStats.storeRevenueAmount) }}</p>
                  </div>
                </div>
                <!-- 平板和桌面版：原來的佈局 -->
                <div class="hidden sm:block">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                    </div>
                    <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-sm xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">店內營收</h3>
                    <p class="text-2xl xs:text-lg-mobile font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ formatCurrency(todayStats.storeRevenueAmount) }}</p>
                    <div class="flex items-center text-xs text-gray-500">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      綜合營業收入
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 當日未確認數量卡片 -->
            <div class="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-yellow-300">
              <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"></div>
              <div class="relative p-3 xs:p-2.5 sm:p-4 md:p-6">
                <!-- 手機版：簡約上下佈局 -->
                <div class="block sm:hidden">
                  <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-xs xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">未確認</h3>
                    <p class="text-sm xs:text-xs-mobile font-bold text-gray-900 group-hover:text-yellow-600 transition-colors leading-tight">{{ todayStats.pendingCount }}</p>
                  </div>
                </div>
                <!-- 平板和桌面版：原來的佈局 -->
                <div class="hidden sm:block">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-sm xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">未確認</h3>
                    <p class="text-2xl xs:text-lg-mobile font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">{{ todayStats.pendingCount }}</p>
                    <div class="flex items-center text-xs text-gray-500">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      待確認筆數
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 當日已入帳數量卡片 -->
            <div class="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-emerald-300">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"></div>
              <div class="relative p-3 xs:p-2.5 sm:p-4 md:p-6">
                <!-- 手機版：簡約上下佈局 -->
                <div class="block sm:hidden">
                  <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-xs xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">已入帳</h3>
                    <p class="text-sm xs:text-xs-mobile font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight">{{ todayStats.confirmedCount }}</p>
                  </div>
                </div>
                <!-- 平板和桌面版：原來的佈局 -->
                <div class="hidden sm:block">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    </div>
                    <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-sm xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">已入帳</h3>
                    <p class="text-2xl xs:text-lg-mobile font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{{ todayStats.confirmedCount }}</p>
                    <div class="flex items-center text-xs text-gray-500">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      已確認筆數
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 當日提領總額卡片 -->
            <div class="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-red-300">
              <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/5"></div>
              <div class="relative p-3 xs:p-2.5 sm:p-4 md:p-6">
                <!-- 手機版：簡約上下佈局 -->
                <div class="block sm:hidden">
                  <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-xs xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">提領</h3>
                    <p class="text-sm xs:text-xs-mobile font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight">{{ formatCurrency(todayStats.withdrawalAmount) }}</p>
                  </div>
                </div>
                <!-- 平板和桌面版：原來的佈局 -->
                <div class="hidden sm:block">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                      </div>
                    </div>
                    <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-sm xs:text-xs-mobile font-semibold text-gray-600 uppercase tracking-wide">提領</h3>
                    <p class="text-2xl xs:text-lg-mobile font-bold text-gray-900 group-hover:text-red-600 transition-colors">{{ formatCurrency(todayStats.withdrawalAmount) }}</p>
                    <div class="flex items-center text-xs text-gray-500">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-5 5l-5-5"/>
                      </svg>
                      今日提領金額
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- 全體統計卡片 -->
        <div class="mb-4">
          <div class="mb-4">
            <!-- 標題 -->
            <h2 class="text-lg font-semibold text-gray-900 whitespace-nowrap mb-3">
              <span class="inline-block">📊 期間統計總覽</span>
              <span v-if="selectedStoreForDateStats" class="text-sm text-blue-600 font-normal block sm:inline">
                ({{ accessibleStores.find(s => s.id === parseInt(selectedStoreForDateStats))?.name }})
              </span>
            </h2>

            <!-- Tab 切換器 -->
            <div class="mb-4 border-b border-gray-200">
              <nav class="flex space-x-1 overflow-x-auto">
                <button
                  v-for="tab in paymentMethodTabs"
                  :key="tab.value"
                  @click="selectedPaymentMethodTab = tab.value; updateRangeStats()"
                  :class="{
                    'border-blue-500 text-blue-600 bg-blue-50': selectedPaymentMethodTab === tab.value,
                    'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300': selectedPaymentMethodTab !== tab.value
                  }"
                  class="whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200"
                >
                  {{ tab.icon }} {{ tab.label }}
                </button>
              </nav>
            </div>

            <!-- 控制區域 -->
            <div class="space-y-3">
              <!-- 手機版：垂直排列 -->
              <div class="block sm:hidden space-y-3">
                <!-- 模式切換 -->
                <div class="flex items-center space-x-2">
                  <input
                    v-model="customDateMode"
                    @change="toggleDateMode"
                    type="checkbox"
                    id="custom-date-mode-mobile"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label for="custom-date-mode-mobile" class="text-sm text-gray-600 cursor-pointer">自訂日期範圍</label>
                </div>
                
                <!-- 月份選擇 (手機版) -->
                <div v-if="!customDateMode" class="space-y-2 xs:space-y-1.5">
                  <label class="text-sm xs:text-sm-mobile text-gray-600 font-medium">統計月份</label>
                  <input
                    v-model="selectedMonth"
                    @change="updateRangeStats"
                    type="month"
                    class="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm xs:text-sm-mobile py-2.5 xs:py-3 min-h-touch"
                  />
                  <div class="text-xs xs:text-xs-mobile text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded inline-block">
                    {{ formatMonthDisplay(selectedMonth) }}
                  </div>
                </div>
                
                <!-- 自訂日期範圍 (手機版) -->
                <div v-if="customDateMode" class="space-y-3 xs:space-y-2.5">
                  <div class="space-y-1.5">
                    <label class="text-sm xs:text-sm-mobile text-gray-600 font-medium">開始日期</label>
                    <input
                      v-model="statsDateStart"
                      @change="updateRangeStats"
                      type="date"
                      class="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm xs:text-sm-mobile py-2.5 xs:py-3 min-h-touch"
                      placeholder="開始日期"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm xs:text-sm-mobile text-gray-600 font-medium">結束日期</label>
                    <div class="flex items-center space-x-2">
                      <input
                        v-model="statsDateEnd"
                        @change="updateRangeStats"
                        type="date"
                        class="flex-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm xs:text-sm-mobile py-2.5 xs:py-3 min-h-touch"
                        placeholder="結束日期"
                      />
                      <button
                        v-if="statsDateStart || statsDateEnd"
                        @click="clearRangeStats"
                        class="p-2 xs:p-2.5 text-gray-400 hover:text-gray-600 min-w-touch min-h-touch rounded-md"
                        title="清除日期範圍"
                      >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    </div>
                    <div v-if="statsDateStart || statsDateEnd" class="text-xs xs:text-xs-mobile text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded inline-block">
                      {{ formatRangeDisplay() }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 平板和桌面版：原來的橫向排列 -->
              <div class="hidden sm:flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <!-- 月份選擇 -->
                  <div v-if="!customDateMode" class="flex items-center space-x-2">
                    <label class="text-sm text-gray-600">統計月份：</label>
                    <input
                      v-model="selectedMonth"
                      @change="updateRangeStats"
                      type="month"
                      class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <span class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {{ formatMonthDisplay(selectedMonth) }}
                    </span>
                  </div>
                  
                  <!-- 自訂日期範圍 -->
                  <div v-if="customDateMode" class="flex items-center space-x-2">
                    <label class="text-sm text-gray-600">日期範圍：</label>
                    <input
                      v-model="statsDateStart"
                      @change="updateRangeStats"
                      type="date"
                      class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="開始日期"
                    />
                    <span class="text-gray-500">至</span>
                    <input
                      v-model="statsDateEnd"
                      @change="updateRangeStats"
                      type="date"
                      class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="結束日期"
                    />
                    <button
                      v-if="statsDateStart || statsDateEnd"
                      @click="clearRangeStats"
                      class="text-gray-400 hover:text-gray-600"
                      title="清除日期範圍"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    <span v-if="statsDateStart || statsDateEnd" class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {{ formatRangeDisplay() }}
                    </span>
                  </div>
                  
                  <!-- 模式切換 -->
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="customDateMode"
                      @change="toggleDateMode"
                      type="checkbox"
                      id="custom-date-mode"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label for="custom-date-mode" class="text-sm text-gray-600 cursor-pointer">自訂日期</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <!-- 總匯款數量卡片 -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      {{ selectedPaymentMethodTab === 'all' ? '總記錄數量' :
                         `總${paymentMethodTabs.find(t => t.value === selectedPaymentMethodTab)?.label || ''}數量` }}
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">{{ dashboardStats.totalPayments }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- 總金額卡片 -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      {{ selectedPaymentMethodTab === 'all' ? '總收入金額' :
                         (selectedPaymentMethodTab === '提領' || selectedPaymentMethodTab === '店內支出' ? '總支出金額' : '總收入金額') }}
                      ({{ paymentMethodTabs.find(t => t.value === selectedPaymentMethodTab)?.label }})
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">{{ formatCurrency(dashboardStats.totalAmount) }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- 未確認數量卡片 -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">未確認</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ dashboardStats.pendingCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- 已入帳數量卡片 -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">已入帳</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ dashboardStats.confirmedCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- 未入帳數量卡片 - 新增：重要提醒店員 -->
          <div class="bg-gradient-to-r from-red-50 to-red-100 overflow-hidden shadow rounded-lg border-l-4 border-red-500">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-red-700 truncate">
                      🚨 未入帳
                      <span v-if="dashboardStats.rejectedCount > 0" class="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full ml-1">
                        需通知客人
                      </span>
                    </dt>
                    <dd class="text-lg font-bold text-red-900">{{ dashboardStats.rejectedCount }}</dd>
                    <dd v-if="dashboardStats.rejectedCount > 0" class="text-xs text-red-600 mt-1">
                      請聯繫客人確認匯款資訊
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <!-- 當前店裡現金總額 -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 whitespace-nowrap">
              <span class="inline-block">當前店裡現金總額</span>
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">各分店當前現金總額（現金收入 - 提領 - 店內支出）</p>
          </div>
          <div class="border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              <div v-for="storeCash in currentStoreCash" :key="storeCash.store_id" 
                   class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-lg font-semibold text-green-900">{{ storeCash.store_name }}</h4>
                    <p class="text-sm text-green-700">{{ storeCash.store_code }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-green-900">
                      {{ formatCurrency(storeCash.cash_amount) }}
                    </div>
                    <div class="text-xs text-green-600">
                      現金總額
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="currentStoreCash.length === 0" class="col-span-full text-center py-8 text-gray-500">
                暫無現金記錄
              </div>
            </div>
          </div>
        </div>

        <!-- 整合分店統計表格 -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 sm:px-6">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                📊 今日分店快速儀表板
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                各分店今日收款狀況概覽（不含提領和店內支出）
              </p>
            </div>
          </div>
          <div class="border-t border-gray-200">
            <!-- 桌面版表格 -->
            <div class="hidden md:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分店名稱</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總筆數</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總金額</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">未確認</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已入帳</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">未入帳</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="storeStat in currentDisplayStats" :key="storeStat.store_id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ storeStat.store_name }} ({{ storeStat.store_code }})
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ storeStat.total_count }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(storeStat.total_amount) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{{ storeStat.pending_count }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">{{ storeStat.confirmed_count }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">{{ storeStat.rejected_count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 手機版卡片視圖 -->
            <div class="md:hidden p-4 xs:p-3 space-y-4 xs:space-y-3">
              <div v-for="storeStat in currentDisplayStats" :key="storeStat.store_id" 
                   class="bg-gray-50 rounded-lg p-4 xs:p-3 space-y-3 xs:space-y-2.5">
                <div class="flex items-center justify-between">
                  <h4 class="text-lg xs:text-base-mobile font-medium text-gray-900">{{ storeStat.store_name }}</h4>
                  <span class="text-xs xs:text-xs-mobile text-gray-500 bg-gray-200 px-2 py-1 rounded">({{ storeStat.store_code }})</span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 xs:gap-3">
                  <div class="text-center">
                    <div class="text-2xl xs:text-lg-mobile font-bold text-gray-900">{{ storeStat.total_count }}</div>
                    <div class="text-xs xs:text-xs-mobile text-gray-500">總筆數</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl xs:text-lg-mobile font-bold text-gray-900">{{ formatCurrency(storeStat.total_amount) }}</div>
                    <div class="text-xs xs:text-xs-mobile text-gray-500">總金額</div>
                  </div>
                </div>
                
                <div class="grid grid-cols-3 gap-3 xs:gap-2">
                  <div class="text-center p-2 xs:p-1.5 bg-yellow-50 rounded">
                    <div class="text-lg xs:text-base-mobile font-bold text-yellow-600">{{ storeStat.pending_count }}</div>
                    <div class="text-xs xs:text-xs-mobile text-yellow-600">未確認</div>
                  </div>
                  <div class="text-center p-2 xs:p-1.5 bg-green-50 rounded">
                    <div class="text-lg xs:text-base-mobile font-bold text-green-600">{{ storeStat.confirmed_count }}</div>
                    <div class="text-xs xs:text-xs-mobile text-green-600">已入帳</div>
                  </div>
                  <div class="text-center p-2 xs:p-1.5 bg-red-50 rounded">
                    <div class="text-lg xs:text-base-mobile font-bold text-red-600">{{ storeStat.rejected_count }}</div>
                    <div class="text-xs xs:text-xs-mobile text-red-600">未入帳</div>
                  </div>
                </div>
              </div>
              
              <div v-if="storeStats.length === 0" class="text-center py-8 xs:py-6 text-gray-500 text-sm xs:text-sm-mobile">
                暫無統計資料
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- 收款記錄管理 -->
      <div v-show="activeTab === 'payments'" class="h-full flex flex-col overflow-hidden">
        <!-- 權限檢查 -->
        <div v-if="!hasPermission('view_payments')" class="text-center py-12">
          <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <div class="mb-4">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2m0 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">無權限訪問</h3>
            <p class="text-gray-600 mb-4">您沒有查看收款記錄的權限</p>
            <p class="text-sm text-gray-500">需要 <code class="bg-gray-200 px-2 py-1 rounded text-xs">view_payments</code> 權限</p>
          </div>
        </div>
        
        <!-- 收款記錄內容 (僅有權限時顯示) -->
        <div v-else class="flex-1 flex flex-col overflow-hidden">
        <!-- 消息顯示區域 -->
        <div v-if="message" :class="messageClass" class="p-4 rounded-lg border-l-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg v-if="messageClass.includes('green')" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm">{{ message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0">
              <button @click="message = ''" class="text-gray-400 hover:text-gray-600">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 隱藏的 Excel 文件輸入框 -->
        <input
          ref="excelFileInput"
          type="file"
          accept=".xlsx,.xls"
          @change="handleFileImport"
          class="hidden"
        />

        <!-- 收款記錄區域 - 使用全部剩餘空間 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <VirtualScrollTable
            :data="payments"
            :loading="isLoadingPayments"
            :pagination="pagination"
            :stores="accessibleStores"
            :editing-payments="editingPayments"
            :edited-data="editedData"
            @filter-change="handleFilterChange"
            @edit="startInlineEdit"
            @delete="deletePayment"
            @batch-delete="handleBatchDelete(selectedPayments)"
            @batch-status-update="showBatchStatusModal = true"
            @export-selected="exportSelectedToExcel"
            @export-filtered="exportToExcel"
            @import-excel="excelFileInput?.click()"
            @save-edit="saveInlineEdit"
            @cancel-edit="cancelInlineEdit"
            @update-field="updateEditedData"
            @selection-change="handleSelectionChange"
            @status-change="handleStatusChange"
          />
        </div>
        </div>
      </div>

      <!-- 會員管理 -->
      <div v-show="activeTab === 'users'" class="space-y-6">
        <!-- 權限檢查 -->
        <div v-if="!hasPermission('manage_users')" class="text-center py-12">
          <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <div class="mb-4">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2m0 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">無權限訪問</h3>
            <p class="text-gray-600 mb-4">您沒有管理會員的權限</p>
            <p class="text-sm text-gray-500">需要 <code class="bg-gray-200 px-2 py-1 rounded text-xs">manage_users</code> 權限</p>
          </div>
        </div>
        
        <!-- 會員管理內容 (僅有權限時顯示) -->
        <div v-else>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <h2 class="text-lg font-medium text-gray-900">會員管理</h2>
          <button
            @click="showUserModal = true; editingUser = null"
            class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            新增會員
          </button>
        </div>

        <!-- 桌面版表格 -->
        <div class="hidden md:block bg-white shadow overflow-hidden sm:rounded-md">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用戶名</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">權限</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">創建時間</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.username }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'" 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ user.role === 'admin' ? '管理員' : '一般用戶' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="max-w-xs truncate" :title="user.permissions.map(p => availablePermissions[p] || p).join(', ')">
                      {{ user.permissions.length > 0 ? user.permissions.map(p => availablePermissions[p] || p).join(', ') : '無' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ user.is_active ? '啟用' : '停用' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDateTime(user.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      @click="editUser(user)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      編輯
                    </button>
                    <button
                      @click="changeUserPassword(user)"
                      class="text-green-600 hover:text-green-900"
                    >
                      改密碼
                    </button>
                    <button
                      v-if="user.username !== 'admin'"
                      @click="deleteUser(user.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      刪除
                    </button>
                    <span
                      v-else
                      class="text-gray-400 text-sm"
                    >
                      系統帳戶
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 手機版卡片佈局 -->
        <div class="md:hidden space-y-4">
          <div v-for="user in users" :key="user.id" class="bg-white shadow rounded-lg p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ user.username }}</h3>
                <div class="flex items-center space-x-2 mt-1">
                  <span :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'" 
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ user.role === 'admin' ? '管理員' : '一般用戶' }}
                  </span>
                  <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ user.is_active ? '啟用' : '停用' }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editUser(user)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  編輯
                </button>
                <button
                  @click="changeUserPassword(user)"
                  class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  改密碼
                </button>
                <button
                  v-if="user.username !== 'admin'"
                  @click="deleteUser(user.id)"
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  刪除
                </button>
                <span
                  v-else
                  class="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                >
                  系統帳戶
                </span>
              </div>
            </div>
            
            <div class="space-y-2 text-sm">
              <div>
                <span class="font-medium text-gray-600">權限：</span>
                <span class="text-gray-900">
                  {{ user.permissions.length > 0 ? user.permissions.map(p => availablePermissions[p] || p).join(', ') : '無' }}
                </span>
              </div>
              <div>
                <span class="font-medium text-gray-600">創建時間：</span>
                <span class="text-gray-900">{{ formatDateTime(user.created_at) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 空狀態 -->
          <div v-if="users.length === 0" class="bg-white shadow rounded-lg p-8 text-center">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">尚無會員資料</h3>
            <p class="text-gray-500">點擊上方「新增會員」按鈕開始新增會員</p>
          </div>
        </div>
        </div>
      </div>

      <!-- 分店管理 -->
      <div v-show="activeTab === 'stores'" class="space-y-6">
        <!-- 權限檢查 -->
        <div v-if="!hasPermission('manage_stores')" class="text-center py-12">
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
            @click="showStoreModal = true; editingStore = null"
            class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            新增分店
          </button>
        </div>

        <!-- 桌面版表格 -->
        <div class="hidden md:block bg-white shadow overflow-hidden sm:rounded-md">
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
                <tr v-for="store in stores" :key="store.id">
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
                      @click="editStore(store)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      編輯
                    </button>
                    <button
                      @click="deleteStore(store.id)"
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
          <div v-for="store in stores" :key="store.id" class="bg-white shadow rounded-lg p-4">
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
                  @click="editStore(store)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  編輯
                </button>
                <button
                  @click="deleteStore(store.id)"
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 空狀態 -->
          <div v-if="stores.length === 0" class="bg-white shadow rounded-lg p-8 text-center">
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

      <!-- 操作日誌 -->
      <div v-show="activeTab === 'audit'" class="space-y-6">
        <!-- 權限檢查 -->
        <div v-if="!hasPermission('view_reports')" class="text-center py-12">
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
                @click="createDatabaseBackup"
                :disabled="backupLoading"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                @click="triggerFileUpload"
                :disabled="importLoading"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <input
                ref="fileInput"
                type="file"
                accept=".db,.sql,.sqlite,.sqlite3"
                @change="handleFileSelect"
                class="hidden"
              />
              <button
                @click="showBackupListModal = true; loadBackupList()"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                備份列表
              </button>
            </div>
            <div class="text-sm text-gray-600">
              僅限系統管理員查看
            </div>
          </div>
        </div>

        <!-- 日誌篩選 -->
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div class="flex items-center space-x-3">
              <select 
                v-model="auditActionFilter" 
                @change="auditCurrentPage = 1; loadAuditLogs()"
                class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">全部操作</option>
                <option value="create">新增</option>
                <option value="update">更新</option>
                <option value="delete">刪除</option>
                <option value="login">登入</option>
                <option value="logout">登出</option>
              </select>
              <select 
                v-model="auditResourceFilter" 
                @change="auditCurrentPage = 1; loadAuditLogs()"
                class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">全部資源</option>
                <option value="payment">收款記錄</option>
                <option value="user">用戶</option>
                <option value="store">分店</option>
                <option value="system">系統</option>
              </select>
            </div>
            <button
              @click="loadAuditLogs"
              :disabled="auditLoading"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {{ auditLoading ? '載入中...' : '重新載入' }}
            </button>
          </div>
        </div>

        <!-- 桌面版日誌表格 -->
        <div class="hidden md:block bg-white shadow overflow-hidden sm:rounded-md">
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
                <tr v-if="auditLogs.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                    {{ auditLoading ? '載入中...' : '暫無日誌記錄' }}
                  </td>
                </tr>
                <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-gray-50">
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
                @click="auditCurrentPage > 1 && (auditCurrentPage--)"
                :disabled="auditCurrentPage <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                上一頁
              </button>
              <button
                @click="auditCurrentPage++"
                :disabled="auditLogs.length < auditPageSize"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                下一頁
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  第 {{ auditCurrentPage }} 頁，顯示 {{ auditLogs.length }} 筆記錄
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="auditCurrentPage > 1 && (auditCurrentPage--)"
                    :disabled="auditCurrentPage <= 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一頁
                  </button>
                  <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {{ auditCurrentPage }}
                  </span>
                  <button
                    @click="auditCurrentPage++"
                    :disabled="auditLogs.length < auditPageSize"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
          <div v-if="auditLogs.length === 0" class="bg-white shadow rounded-lg p-8 text-center">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">{{ auditLoading ? '載入中...' : '暫無日誌記錄' }}</h3>
          </div>
          
          <div v-for="log in auditLogs" :key="log.id" class="bg-white shadow rounded-lg p-4">
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
              @click="auditCurrentPage > 1 && (auditCurrentPage--)"
              :disabled="auditCurrentPage <= 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <span class="text-sm text-gray-700">第 {{ auditCurrentPage }} 頁</span>
            <button
              @click="auditCurrentPage++"
              :disabled="auditLogs.length < auditPageSize"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- 批量狀態更新對話框 -->
    <div v-if="showBatchStatusModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-4 sm:top-20 mx-4 sm:mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">批量更新狀態</h3>
          <p class="text-sm text-gray-600 mb-4">將為 {{ selectedPayments.length }} 筆記錄更新狀態</p>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">選擇新狀態</label>
            <select v-model="batchStatus" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="未確認">未確認</option>
              <option value="已入帳">已入帳</option>
              <option value="未入帳">未入帳</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showBatchStatusModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button
              @click="saveBatchStatus"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              確認更新
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 刪除確認對話框 -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-4 sm:top-20 mx-4 sm:mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">確認刪除</h3>
          <p class="text-sm text-gray-600 mb-4">
            確定要刪除選中的 {{ selectedPayments.length }} 筆收款記錄嗎？此操作無法復原。
          </p>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showDeleteConfirmModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button
              @click="confirmBatchDelete"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Excel 匯入確認對話框 -->
    <div v-if="showImportConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-4 sm:top-20 mx-4 sm:mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">確認匯入 Excel</h3>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  <strong>警告：</strong>匯入 Excel 檔案將會新增資料到資料庫中。<br>
                  請確認檔案內容正確無誤。
                </p>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-600 mb-4">
            檔案名稱：<strong>{{ pendingImportFile?.name }}</strong>
          </p>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              請輸入密碼以確認操作
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="importPassword"
              type="password"
              placeholder="請輸入您的密碼"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              @keyup.enter="executeExcelImport"
            />
            <p class="mt-1 text-xs text-gray-500">
              請輸入您的帳戶密碼以進行驗證
            </p>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="cancelExcelImport"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button
              @click="executeExcelImport"
              :disabled="!importPassword"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              確認匯入
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 會員編輯對話框 -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-4 sm:top-20 mx-4 sm:mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingUser ? '編輯會員' : '新增會員' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">用戶名</label>
              <input 
                v-model="userForm.username" 
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                :disabled="editingUser !== null"
              />
            </div>
            
            <div v-if="!editingUser">
              <label class="block text-sm font-medium text-gray-700">密碼</label>
              <input 
                v-model="userForm.password" 
                type="password"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">角色</label>
              <select v-model="userForm.role" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="user">一般用戶</option>
                <option value="admin">管理員</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">權限</label>
              <div class="mt-1 space-y-2">
                <label v-for="(desc, perm) in availablePermissions" :key="perm" class="flex items-center">
                  <input 
                    type="checkbox" 
                    :value="perm"
                    v-model="userForm.permissions"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ desc }}</span>
                </label>
              </div>
            </div>
            
            <!-- 分店權限設定 -->
            <div v-if="userForm.role !== 'admin'">
              <label class="block text-sm font-medium text-gray-700">可訪問分店 (可多選)</label>
              <div class="mt-1 space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                <label v-for="store in stores" :key="store.id" class="flex items-center">
                  <input 
                    type="checkbox" 
                    :value="store.id"
                    v-model="userForm.accessible_stores"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ store.name }} ({{ store.code }})</span>
                </label>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                未選擇任何分店的用戶將無法查看收款記錄
              </p>
            </div>

            <div v-if="editingUser">
              <label class="block text-sm font-medium text-gray-700">狀態</label>
              <select v-model="userForm.is_active" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option :value="true">啟用</option>
                <option :value="false">停用</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showUserModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button
              @click="saveUser"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {{ editingUser ? '更新' : '新增' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分店編輯對話框 -->
    <div v-if="showStoreModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-4 sm:top-20 mx-4 sm:mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingStore ? '編輯分店' : '新增分店' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">分店名稱</label>
              <input 
                v-model="storeForm.name" 
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">分店代碼</label>
              <input 
                v-model="storeForm.code" 
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showStoreModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button
              @click="saveStore"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {{ editingStore ? '更新' : '新增' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密碼對話框 -->
    <div v-if="showChangePasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-4 sm:top-20 mx-4 sm:mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            修改 {{ editingPasswordUser?.username }} 的密碼
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">新密碼</label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入新密碼（至少6位）"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">確認新密碼</label>
              <input 
                v-model="passwordForm.confirmPassword" 
                type="password"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="請再次輸入新密碼"
              />
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showChangePasswordModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button
              @click="saveNewPassword"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              確認修改
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 備份列表對話框 -->
    <div v-if="showBackupListModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">資料庫備份列表</h3>
            <button
              @click="showBackupListModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div v-if="backupListLoading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="ml-2 text-gray-600">載入中...</span>
          </div>
          
          <div v-else-if="backupList.length === 0" class="text-center py-8 text-gray-500">
            尚無備份檔案
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="backup in backupList"
              :key="backup.filename"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ backup.filename }}</div>
                <div class="text-sm text-gray-500 space-y-1">
                  <div>大小: {{ formatFileSize(backup.size) }}</div>
                  <div>建立時間: {{ formatDateTime(backup.created) }}</div>
                  <div>修改時間: {{ formatDateTime(backup.modified) }}</div>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="downloadBackup(backup.filename)"
                  class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  下載
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-end">
            <button
              @click="showBackupListModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              關閉
            </button>
          </div>
        </div>
        </div>
      </div>

      </div>
      <!-- /Tab 內容區域 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import VirtualScrollTable from '@/components/VirtualScrollTable.vue'
import { 
  paymentApi, 
  userApi, 
  storeApi,
  type PaymentFilters, 
  adminApi, 
  auditApi,
  backupApi,
  getUsernameFromToken, 
  getCurrentUserInfo,
  type PaymentRecord, 
  type UserRecord, 
  type StoreData,
  type AuditLogRecord,
  type BackupInfo
} from '../utils/api'
import { formatIPAddress, getIPTypeLabel } from '../utils/ip'
import * as XLSX from 'xlsx'

const router = useRouter()

// 基本狀態
const activeTab = ref('dashboard')
const mobileMenuOpen = ref(false)
const currentUser = ref<string | null>(null)
const currentUserInfo = ref<UserRecord | null>(null)

// 標籤配置
const allTabs = [
  { id: 'dashboard', name: '統計儀表板', permission: 'view_payments' },
  { id: 'payments', name: '收款記錄', permission: 'view_payments' },
  { id: 'users', name: '會員管理', permission: 'manage_users' },
  { id: 'stores', name: '分店管理', permission: 'manage_stores' },
  { id: 'audit', name: '操作日誌', permission: 'view_reports' }
]

// 根據用戶權限過濾標籤
const tabs = computed(() => {
  if (!currentUserInfo.value) return []
  
  return allTabs.filter(tab => {
    // 沒有權限要求的標籤（如統計儀表板、收款記錄）總是顯示
    if (!tab.permission) return true
    
    // 管理員可以看到所有標籤
    if (currentUserInfo.value.role === 'admin') return true
    
    // 檢查用戶是否有對應權限
    return currentUserInfo.value.permissions.includes(tab.permission)
  })
})

// 權限檢查函數
const hasPermission = (permission: string): boolean => {
  if (!currentUserInfo.value) return false
  
  // 管理員擁有所有權限
  if (currentUserInfo.value.role === 'admin') return true
  
  // 檢查用戶是否有對應權限
  return currentUserInfo.value.permissions.includes(permission)
}

// 數據狀態
const payments = ref<PaymentRecord[]>([])
const users = ref<UserRecord[]>([])
const stores = ref<StoreData[]>([])
const auditLogs = ref<AuditLogRecord[]>([])

// 根據用戶權限過濾的分店列表
const accessibleStores = computed(() => {
  if (!currentUserInfo.value) return []
  
  // 管理員可以看到所有分店
  if (currentUserInfo.value.role === 'admin') {
    return stores.value
  }
  
  // 一般用戶只能看到 accessible_stores 中的分店
  if (currentUserInfo.value.accessible_stores && currentUserInfo.value.accessible_stores.length > 0) {
    return stores.value.filter(store => 
      currentUserInfo.value!.accessible_stores!.includes(store.id)
    )
  }
  
  // 如果沒有設定 accessible_stores，則不能訪問任何分店
  return []
})

// 日誌相關狀態
const auditCurrentPage = ref(1)
const auditPageSize = ref(50)
const auditLoading = ref(false)
const auditActionFilter = ref('')
const auditResourceFilter = ref('')

// 備份相關狀態
const backupLoading = ref(false)
const importLoading = ref(false)
const showBackupListModal = ref(false)
const backupList = ref<BackupInfo[]>([])
const backupListLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null) // 用於資料庫匯入
const excelFileInput = ref<HTMLInputElement | null>(null) // 用於 Excel 匯入

// Excel 匯入確認對話框狀態
const showImportConfirmModal = ref(false)
const importPassword = ref('')
const pendingImportFile = ref<File | null>(null)

// Debug模式狀態
const debugMode = ref(false)

// 消息顯示狀態
const message = ref('')
const messageClass = ref('')

// 自動刷新相關狀態
const autoRefreshEnabled = ref(true)
const refreshInterval = ref(5 * 60 * 1000) // 5分鐘
const lastRefreshTime = ref<Date | null>(null)
const nextRefreshTime = ref<Date | null>(null)
const refreshTimer = ref<NodeJS.Timeout | null>(null)
const refreshCountdown = ref(0)

// 編輯狀態追蹤
const editingPayments = ref<Set<string>>(new Set())
const editedData = ref<Record<string, Partial<PaymentRecord>>>({})

// 選中項目追蹤
const selectedPaymentIds = ref<Set<string>>(new Set())

// 統計數據
const dashboardStats = ref({
  totalPayments: 0,
  totalAmount: 0,
  pendingCount: 0,
  confirmedCount: 0,
  rejectedCount: 0
})

// 統計儀表板專用的數據源（不受收款記錄頁面篩選影響）
const dashboardPayments = ref<PaymentRecord[]>([])

const todayStats = ref({
  // 原有統計
  totalPayments: 0,
  pendingCount: 0,
  confirmedCount: 0,
  
  // 新增的分類統計
  remittanceAmount: 0,    // 匯款總額
  cashAmount: 0,          // 現金總額
  electronicAmount: 0,    // 電子支付總額
  storeRevenueAmount: 0,  // 店內營收（匯款 + 現金 + 電子支付 - 店內支出）
  
  // 各支付方式統計
  remittanceCount: 0,     // 匯款筆數
  cashCount: 0,           // 現金筆數
  electronicCount: 0,     // 電子支付筆數
  storeExpenseAmount: 0,  // 店內支出
  withdrawalAmount: 0     // 提領金額
})

const storeStats = ref<Array<{
  store_id: number
  store_name: string
  store_code: string
  total_count: number
  total_amount: number
  pending_count: number
  confirmed_count: number
  rejected_count: number
}>>([])

const todayStoreStats = ref<Array<{
  store_id: number
  store_name: string
  store_code: string
  total_count: number
  total_amount: number
  pending_count: number
  confirmed_count: number
  rejected_count: number
}>>([])

// 今日匯款統計（動態計算，固定顯示今日數據）
const todayRemittanceStats = computed(() => {
  const today = getLocalDateString()
  const todayPayments = dashboardPayments.value.filter(payment => {
    const paymentDate = getDateFromISO(payment.paid_at)
    return paymentDate === today && getBasePaymentMethod(payment.payment_method) === '匯款'
  })
  
  const statsMap = new Map()
  
  // 初始化所有分店
  stores.value.forEach(store => {
    statsMap.set(store.id, {
      store_id: store.id,
      store_name: store.name,
      store_code: store.code,
      total_count: 0,
      total_amount: 0,
      pending_count: 0,
      confirmed_count: 0,
      rejected_count: 0
    })
  })
  
  // 計算今日匯款統計
  todayPayments.forEach(payment => {
    const storeStat = statsMap.get(payment.store_id)
    if (storeStat) {
      storeStat.total_count++
      storeStat.total_amount += payment.amount
      
      switch (payment.status) {
        case '未確認':
          storeStat.pending_count++
          break
        case '已入帳':
          storeStat.confirmed_count++
          break
        case '未入帳':
          storeStat.rejected_count++
          break
      }
    }
  })
  
  return Array.from(statsMap.values()).sort((a, b) => b.total_amount - a.total_amount)
})

// 當前顯示的統計數據（根據模式切換）
// 固定顯示今日統計（方案1優化）
const currentDisplayStats = computed(() => {
  return todayRemittanceStats.value
})

const currentStoreCash = ref<Array<{
  store_id: number
  store_name: string
  store_code: string
  cash_amount: number
}>>([])

// 搜索和篩選
// searchQuery 已移除，使用 VirtualScrollTable 內建的搜索功能
const selectedPayments = ref<string[]>([])

// 統計日期篩選
// 統一的本地日期格式化函數（解決時區問題）
const getLocalDateString = (date?: Date) => {
  const targetDate = date || new Date()
  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, '0')
  const day = String(targetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 將後端 ISO 時間字串轉換為台北時間日期字串（UTC+8）
const getDateFromISO = (isoString: string) => {
  // 轉換為台北時間（UTC+8），再提取日期部分
  const date = new Date(isoString)
  // 加上 8 小時的時區偏移（8 * 60 * 60 * 1000 毫秒）
  const taipeiTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  const year = taipeiTime.getUTCFullYear()
  const month = String(taipeiTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(taipeiTime.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 取得基礎付款方式（將員工購物映射到對應的基礎方式）
const getBasePaymentMethod = (paymentMethod: string): string => {
  if (paymentMethod.startsWith('員工購物-')) {
    return paymentMethod.replace('員工購物-', '')
  }
  return paymentMethod
}

const selectedDate = ref(getLocalDateString()) // 當日統計的選定日期
const selectedMonth = ref(getLocalDateString().substring(0, 7)) // 當前月份 (YYYY-MM)
const customDateMode = ref(false) // 是否使用自訂日期模式
const statsDateStart = ref('') // 全體統計的開始日期
const statsDateEnd = ref('') // 全體統計的結束日期
const selectedStoreForDateStats = ref('') // 指定日期統計的分店篩選
const selectedPaymentMethodTab = ref('all') // 選中的付款方式 Tab

// 付款方式 Tab 選項
const paymentMethodTabs = [
  { value: 'all', label: '全部', icon: '📊' },
  { value: '現金', label: '現金', icon: '💵' },
  { value: '匯款', label: '匯款', icon: '🏦' },
  { value: '電子支付', label: '電子支付', icon: '💳' },
  { value: '店內支出', label: '店內支出', icon: '🏪' },
  { value: '提領', label: '提領', icon: '💰' }
]

// 分頁
const currentPage = ref(1)
const pageSize = ref(60)

// 對話框狀態
const showBatchStatusModal = ref(false)
const showDeleteConfirmModal = ref(false)
const showUserModal = ref(false)
const showStoreModal = ref(false)
const showChangePasswordModal = ref(false)

const batchStatus = ref('已入帳')

const userForm = ref({
  username: '',
  password: '',
  role: 'user' as 'admin' | 'user',
  permissions: [] as string[],
  is_active: true,
  store_id: null as number | null,
  accessible_stores: [] as number[]
})

const storeForm = ref({
  name: '',
  code: ''
})

const editingPasswordUser = ref<UserRecord | null>(null)
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const editingUser = ref<UserRecord | null>(null)
const editingStore = ref<StoreData | null>(null)

// 權限配置
const availablePermissions = {
  'manage_users': '會員管理',
  'manage_stores': '分店管理',
  'view_payments': '查看收款記錄',
  'edit_payments': '修改收款記錄',
  'delete_payments': '刪除收款記錄',
  'view_reports': '查看報告',
  'system_admin': '系統管理'
}

// 計算屬性
const filteredPayments = computed(() => {
  let filtered = payments.value

  // 搜索功能已移除，使用 VirtualScrollTable 內建的搜索功能

  // 狀態篩選已移除，改用 VirtualScrollTable 內建的狀態篩選功能


  // 日期範圍篩選已移除，改用 VirtualScrollTable 內建的日期篩選功能

  return filtered
})

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPayments.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / pageSize.value)
})

const isAllSelected = computed(() => {
  return paginatedPayments.value.length > 0 && 
         paginatedPayments.value.every(payment => selectedPayments.value.includes(payment.uuid))
})

// 工具函數
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

const formatDateTimeForInput = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatDateDisplay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const formatRangeDisplay = () => {
  if (statsDateStart.value && statsDateEnd.value) {
    return `${formatDateDisplay(statsDateStart.value)} - ${formatDateDisplay(statsDateEnd.value)}`
  } else if (statsDateStart.value) {
    return `${formatDateDisplay(statsDateStart.value)} 起`
  } else if (statsDateEnd.value) {
    return `至 ${formatDateDisplay(statsDateEnd.value)}`
  }
  return '全部期間'
}

const formatMonthDisplay = (monthString: string) => {
  if (!monthString) return '當前月份'
  const [year, month] = monthString.split('-')
  return `${year}年${month}月`
}

const getStoreName = (storeId: number) => {
  const store = stores.value.find(s => s.id === storeId)
  return store ? `${store.name} (${store.code})` : '未知分店'
}

const getStatusClass = (status: string) => {
  switch (status) {
    case '未確認':
      return 'bg-yellow-100 text-yellow-800'
    case '已入帳':
      return 'bg-green-100 text-green-800'
    case '未入帳':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusSelectClass = (status: string) => {
  switch (status) {
    case '未確認':
      return 'border-yellow-300 bg-yellow-50 text-yellow-800'
    case '已入帳':
      return 'border-green-300 bg-green-50 text-green-800'
    case '未入帳':
      return 'border-red-300 bg-red-50 text-red-800'
    default:
      return 'border-gray-300 bg-gray-50 text-gray-800'
  }
}

// 快速更新狀態
const quickUpdateStatus = async (uuid: string, newStatus: string) => {
  try {
    await paymentApi.update(uuid, { status: newStatus })
    await loadPayments()
    await loadDashboardPayments()
    updateDashboardStats()
  } catch (error: any) {
    console.error('Failed to update status:', error)
    const errorMessage = error.response?.data?.message || '狀態更新失敗，請稍後再試'
    alert(errorMessage)
  }
}

// 新增響應式資料用於分頁
const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0
})
const paymentFilters = ref<PaymentFilters>({
  page: 1,
  limit: 50
})
const isLoadingPayments = ref(false)

// 載入統計儀表板專用的完整數據（支援分店篩選）
const loadDashboardPayments = async () => {
  try {
    console.log('loadDashboardPayments - fetching data...')
    
    // 構建篩選條件：如果有選擇分店，則只載入該分店的資料
    const filters: any = {
      page: 1,
      limit: 10000 // 載入大量資料用於統計
    }
    
    
    const response = await paymentApi.getPaginated(filters)
    console.log('loadDashboardPayments - response structure:', response)
    
    // API 現在返回分頁格式： { data: PaymentRecord[], pagination: {...} }
    let paymentsData: PaymentRecord[] = []
    
    if (response.data && Array.isArray(response.data.data)) {
      // 正確的分頁格式
      paymentsData = response.data.data
      console.log('loadDashboardPayments - received', paymentsData.length, 'payments from paginated API')
    } else {
      console.error('loadDashboardPayments - unexpected response format:', response)
      console.error('Expected response.data.data to be an array, got:', typeof response.data?.data)
      paymentsData = []
    }
    
    dashboardPayments.value = paymentsData.sort((a, b) => {
      const paidAtDiff = new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
      if (paidAtDiff !== 0) {
        return paidAtDiff
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    console.log('loadDashboardPayments - dashboardPayments.value.length:', dashboardPayments.value.length)
    if (dashboardPayments.value.length > 0) {
      console.log('loadDashboardPayments - sample payment:', dashboardPayments.value[0])
    }
  } catch (error) {
    console.error('Failed to load dashboard payments:', error)
  }
}

// 數據載入 - 支援分頁
const loadPayments = async (filters?: PaymentFilters) => {
  try {
    isLoadingPayments.value = true
    
    // 使用新的分頁API
    const response = await paymentApi.getPaginated(filters || paymentFilters.value)
    
    payments.value = response.data.data
    pagination.value = response.data.pagination
    
    // 注意：移除這裡的統計更新，統計儀表板現在使用獨立數據源
  } catch (error) {
    console.error('Failed to load payments:', error)
    
    // 如果分頁API失敗，回退到舊版API
    try {
      const fallbackResponse = await paymentApi.getAll()
      payments.value = fallbackResponse.data.sort((a, b) => {
        const paidAtDiff = new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
        if (paidAtDiff !== 0) {
          return paidAtDiff
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      
      // 模擬分頁
      pagination.value = {
        page: 1,
        limit: payments.value.length,
        total: payments.value.length,
        totalPages: 1
      }
      
      // 注意：移除這裡的統計更新，統計儀表板現在使用獨立數據源
    } catch (fallbackError) {
      console.error('Both paginated and fallback API failed:', fallbackError)
    }
  } finally {
    isLoadingPayments.value = false
  }
}

// 檢查是否有活躍的篩選條件
const hasFilters = (filters?: PaymentFilters) => {
  if (!filters) return false
  return !!(
    filters.status || 
    filters.payment_method || 
    filters.store_id || 
    filters.start_date || 
    filters.end_date || 
    filters.search
  )
}

// 處理篩選變化
const handleFilterChange = (newFilters: PaymentFilters) => {
  paymentFilters.value = { ...newFilters }
  loadPayments(newFilters)
}

// 批量刪除處理
const handleBatchDelete = async (uuids: string[]) => {
  if (!uuids.length) return

  if (!confirm(`確定要刪除 ${uuids.length} 筆記錄嗎？此操作無法復原。`)) {
    return
  }

  try {
    await paymentApi.batchDelete(uuids)
    message.value = `成功刪除 ${uuids.length} 筆記錄`
    messageClass.value = 'bg-green-900/20 border-l-green-500 text-green-300'

    // 清空選取狀態
    selectedPayments.value = []
    selectedPaymentIds.value = new Set()

    // 3秒後自動清除成功消息
    setTimeout(() => {
      message.value = ''
    }, 3000)

    // 重新載入當前頁面的數據
    await loadPayments()
    await loadDashboardPayments()
    updateDashboardStats()
  } catch (error: any) {
    console.error('Batch delete failed:', error)
    message.value = error.response?.data?.message || '批量刪除失敗'
    messageClass.value = 'bg-red-900/20 border-l-red-500 text-red-300'

    // 5秒後自動清除錯誤消息
    setTimeout(() => {
      message.value = ''
    }, 5000)
  }
}

const loadUsers = async () => {
  try {
    const response = await userApi.getAll()
    users.value = response.data
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const loadStores = async () => {
  try {
    console.log('Loading stores with token:', localStorage.getItem('admin_token') ? 'Present' : 'Missing')
    const response = await storeApi.getAllAdmin()
    console.log('Stores loaded successfully:', response.data.length, response.data)
    stores.value = response.data
  } catch (error) {
    console.error('Failed to load stores:', error)
    // 如果認證失敗或權限不足，嘗試使用公開端點作為備用方案
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication failed or permission denied, trying public endpoint as fallback')
      try {
        const publicResponse = await storeApi.getAll()
        console.log('Public stores loaded:', publicResponse.data.length, publicResponse.data)
        stores.value = publicResponse.data
      } catch (publicError) {
        console.error('Failed to load stores from public endpoint:', publicError)
      }
    }
  }
}

const updateDashboardStats = () => {
  // 匯款統計（只統計付款方式為「匯款」的記錄）
  // 使用獨立的 dashboardPayments 數據源
  const remittancePayments = dashboardPayments.value.filter(p => getBasePaymentMethod(p.payment_method) === '匯款')
  const stats = {
    totalPayments: remittancePayments.length,
    totalAmount: remittancePayments.reduce((sum, p) => sum + p.amount, 0),
    pendingCount: remittancePayments.filter(p => p.status === '未確認').length,
    confirmedCount: remittancePayments.filter(p => p.status === '已入帳').length,
    rejectedCount: remittancePayments.filter(p => p.status === '未入帳').length
  }
  dashboardStats.value = stats

  // 注意：不再在這裡設定 todayStats，由 updateDateStats() 獨家管理
  // todayStats 用於「指定日期統計」，而不是「當日統計」

  // 更新全體分店統計
  const storeStatsMap = new Map()
  
  // 先初始化所有分店（確保所有分店都會顯示，即使沒有數據）
  stores.value.forEach(store => {
    storeStatsMap.set(store.id, {
      store_id: store.id,
      store_name: store.name,
      store_code: store.code,
      total_count: 0,
      total_amount: 0,
      pending_count: 0,
      confirmed_count: 0,
      rejected_count: 0
    })
  })
  
  // 各分店統計（只計算匯款）
  dashboardPayments.value
    .filter(payment => getBasePaymentMethod(payment.payment_method) === '匯款') // 只統計匯款
    .forEach(payment => {
    const storeId = payment.store_id
    const storeStat = storeStatsMap.get(storeId)
    
    if (storeStat) {
      storeStat.total_count++
      storeStat.total_amount += payment.amount
      
      switch (payment.status) {
        case '未確認':
          storeStat.pending_count++
          break
        case '已入帳':
          storeStat.confirmed_count++
          break
        case '未入帳':
          storeStat.rejected_count++
          break
      }
    }
  })
  
  storeStats.value = Array.from(storeStatsMap.values()).sort((a, b) => a.store_name.localeCompare(b.store_name))

  // 更新當日分店現金統計（只計算付款方式為"現金"的記錄）
  const todayStoreStatsMap = new Map()
  const today = getLocalDateString()
  const todayPayments = dashboardPayments.value.filter(payment => {
    const paymentDate = getDateFromISO(payment.paid_at)
    return paymentDate === today
  })
  const todayCashPayments = todayPayments.filter(payment => getBasePaymentMethod(payment.payment_method) === '現金')
  
  todayCashPayments.forEach(payment => {
    const storeId = payment.store_id
    if (!todayStoreStatsMap.has(storeId)) {
      const store = stores.value.find(s => s.id === storeId)
      todayStoreStatsMap.set(storeId, {
        store_id: storeId,
        store_name: store?.name || '未知分店',
        store_code: store?.code || '未知',
        total_count: 0,
        total_amount: 0,
        pending_count: 0,
        confirmed_count: 0,
        rejected_count: 0
      })
    }
    
    const storeStat = todayStoreStatsMap.get(storeId)
    storeStat.total_count++
    storeStat.total_amount += payment.amount
    
    switch (payment.status) {
      case '未確認':
        storeStat.pending_count++
        break
      case '已入帳':
        storeStat.confirmed_count++
        break
      case '未入帳':
        storeStat.rejected_count++
        break
    }
  })
  
  todayStoreStats.value = Array.from(todayStoreStatsMap.values()).sort((a, b) => b.total_amount - a.total_amount)

  // 更新當前分店現金總額（包含所有時間的現金和提領記錄）
  updateCurrentStoreCash()
}

// 更新當前分店現金總額
const updateCurrentStoreCash = () => {
  const storeCashMap = new Map()
  
  // 計算所有現金相關記錄（現金收入、提領和店內支出）
  const cashPayments = dashboardPayments.value.filter(payment => {
    const baseMethod = getBasePaymentMethod(payment.payment_method)
    return baseMethod === '現金' || baseMethod === '提領' || baseMethod === '店內支出'
  })
  
  cashPayments.forEach(payment => {
    const storeId = payment.store_id
    if (!storeCashMap.has(storeId)) {
      const store = stores.value.find(s => s.id === storeId)
      storeCashMap.set(storeId, {
        store_id: storeId,
        store_name: store?.name || '未知分店',
        store_code: store?.code || '未知',
        cash_amount: 0
      })
    }
    
    const storeCash = storeCashMap.get(storeId)
    // 提領和店內支出為負數（現金流出），現金為正數（現金流入）
    const baseMethod = getBasePaymentMethod(payment.payment_method)
    if (baseMethod === '提領' || baseMethod === '店內支出') {
      storeCash.cash_amount -= payment.amount
    } else {
      storeCash.cash_amount += payment.amount
    }
  })
  
  // 為沒有現金記錄的分店也顯示 0
  stores.value.forEach(store => {
    if (!storeCashMap.has(store.id)) {
      storeCashMap.set(store.id, {
        store_id: store.id,
        store_name: store.name,
        store_code: store.code,
        cash_amount: 0
      })
    }
  })
  
  currentStoreCash.value = Array.from(storeCashMap.values()).sort((a, b) => a.store_name.localeCompare(b.store_name))
}

// 統計相關函數
const updateDateStats = () => {
  const targetDate = selectedDate.value
  console.log('updateDateStats - targetDate:', targetDate)
  console.log('updateDateStats - current local date:', getLocalDateString())
  console.log('updateDateStats - dashboardPayments.value.length:', dashboardPayments.value.length)
  
  // 檢查所有付款的日期分布
  const dateDistribution = new Map()
  dashboardPayments.value.forEach(payment => {
    const paymentDate = getDateFromISO(payment.paid_at)
    dateDistribution.set(paymentDate, (dateDistribution.get(paymentDate) || 0) + 1)
  })
  console.log('updateDateStats - ALL date distribution:', 
    Array.from(dateDistribution.entries()).sort((a, b) => b[0].localeCompare(a[0])).map(([date, count]) => `${date}: ${count}`)
  )
  
  let targetPayments = dashboardPayments.value.filter(payment => {
    const paymentDate = getDateFromISO(payment.paid_at)
    const dateMatches = paymentDate === targetDate
    
    // 如果有選擇特定分店，則加上分店篩選條件
    const storeMatches = selectedStoreForDateStats.value === '' || 
                        payment.store_id === parseInt(selectedStoreForDateStats.value)
    
    const matches = dateMatches && storeMatches
    
    if (dashboardPayments.value.indexOf(payment) < 3) {
      console.log('updateDateStats - payment sample:', {
        paid_at: payment.paid_at,
        extracted_date: paymentDate,
        target_date: targetDate,
        store_id: payment.store_id,
        selected_store: selectedStoreForDateStats.value,
        date_matches: dateMatches,
        store_matches: storeMatches,
        final_matches: matches
      })
    }
    return matches
  })
  
  console.log('updateDateStats - targetPayments.length:', targetPayments.length, 
    selectedStoreForDateStats.value ? `(filtered by store ${selectedStoreForDateStats.value})` : '(all stores)')
  
  // 如果沒有找到數據，提示用戶有數據的日期
  if (targetPayments.length === 0 && dateDistribution.size > 0) {
    const availableDates = Array.from(dateDistribution.keys()).sort((a, b) => b.localeCompare(a)).slice(0, 5)
    console.log('🔍 沒有找到該日期的數據。建議選擇以下有數據的日期：', availableDates)
  }
  
  // 注意：統計儀表板不應受分店篩選影響，顯示所有分店的數據
  // 已移除分店篩選邏輯
  
  // 🔢 計算各種支付方式的統計
  const remittancePayments = targetPayments.filter(p => getBasePaymentMethod(p.payment_method) === '匯款')
  const cashPayments = targetPayments.filter(p => getBasePaymentMethod(p.payment_method) === '現金')
  const electronicPayments = targetPayments.filter(p => getBasePaymentMethod(p.payment_method) === '電子支付')
  const storeExpensePayments = targetPayments.filter(p => getBasePaymentMethod(p.payment_method) === '店內支出')
  const withdrawalPayments = targetPayments.filter(p => getBasePaymentMethod(p.payment_method) === '提領')
  
  // 計算各項金額
  const remittanceAmount = remittancePayments.reduce((sum, p) => sum + p.amount, 0)
  const cashAmount = cashPayments.reduce((sum, p) => sum + p.amount, 0)
  const electronicAmount = electronicPayments.reduce((sum, p) => sum + p.amount, 0)
  const storeExpenseAmount = storeExpensePayments.reduce((sum, p) => sum + p.amount, 0)
  const withdrawalAmount = withdrawalPayments.reduce((sum, p) => sum + p.amount, 0)
  
  // 店內營收 = 匯款 + 現金 + 電子支付 - 店內支出（不減提領，避免影響對帳）
  const storeRevenueAmount = remittanceAmount + cashAmount + electronicAmount - storeExpenseAmount
  
  // 指定日期統計使用獨立的變數，不要覆蓋 todayStats
  todayStats.value = {
    // 原有統計
    totalPayments: targetPayments.length,
    pendingCount: targetPayments.filter(p => p.status === '未確認').length,
    confirmedCount: targetPayments.filter(p => p.status === '已入帳').length,
    
    // 新增的分類統計
    remittanceAmount,
    cashAmount,
    electronicAmount,
    storeRevenueAmount,
    
    // 各支付方式統計
    remittanceCount: remittancePayments.length,
    cashCount: cashPayments.length,
    electronicCount: electronicPayments.length,
    storeExpenseAmount,
    withdrawalAmount
  }
  
  console.log('updateDateStats - final todayStats:', todayStats.value)
}

const updateRangeStats = () => {
  let filteredPayments = dashboardPayments.value
  console.log('updateRangeStats - dashboardPayments.value.length:', dashboardPayments.value.length)
  console.log('updateRangeStats - dashboardPayments sample:', dashboardPayments.value.slice(0, 2))
  console.log('updateRangeStats - selectedMonth.value:', selectedMonth.value)
  console.log('updateRangeStats - customDateMode.value:', customDateMode.value)
  
  if (customDateMode.value) {
    // 自訂日期模式
    if (statsDateStart.value || statsDateEnd.value) {
      filteredPayments = dashboardPayments.value.filter(payment => {
        // 使用 UTC 時間避免時區轉換問題
        const paymentDate = new Date(payment.paid_at)
        const year = paymentDate.getUTCFullYear()
        const month = String(paymentDate.getUTCMonth() + 1).padStart(2, '0')
        const day = String(paymentDate.getUTCDate()).padStart(2, '0')
        const localDateString = `${year}-${month}-${day}`
        
        let matchesStart = true
        let matchesEnd = true
        
        if (statsDateStart.value) {
          matchesStart = localDateString >= statsDateStart.value
        }
        
        if (statsDateEnd.value) {
          matchesEnd = localDateString <= statsDateEnd.value
        }
        
        return matchesStart && matchesEnd
      })
    }
  } else {
    // 月份模式
    if (selectedMonth.value) {
      console.log('DEBUG - Starting month filter, selectedMonth:', selectedMonth.value)
      console.log('DEBUG - Total payments to filter:', dashboardPayments.value.length)
      
      // 先檢查是否有7月的資料
      const julyPayments = dashboardPayments.value.filter(p => p.paid_at.includes('2025-07'))
      console.log('DEBUG - Raw July payments (contains 2025-07):', julyPayments.length)
      
      filteredPayments = dashboardPayments.value.filter(payment => {
        // 使用 UTC 時間確保 2025-07-31T16:00:00.000Z 正確歸類為7月31日
        const paymentDate = new Date(payment.paid_at)
        const year = paymentDate.getUTCFullYear()
        const month = String(paymentDate.getUTCMonth() + 1).padStart(2, '0')
        const paymentMonth = `${year}-${month}` // YYYY-MM
        const matches = paymentMonth === selectedMonth.value
        
        // Debug logging for July payments
        if (payment.paid_at.includes('2025-07')) {
          console.log('DEBUG - July payment:', payment.paid_at, '-> paymentMonth:', paymentMonth, 'matches:', matches)
        }
        
        return matches
      })
      console.log('updateRangeStats - filtered by month:', filteredPayments.length, 'payments for', selectedMonth.value)
    } else {
      console.log('updateRangeStats - no month filter, using all payments')
    }
  }
  
  // 如果有選擇特定分店，則加上分店篩選條件（期間統計總覽）
  if (selectedStoreForDateStats.value !== '') {
    const storeId = parseInt(selectedStoreForDateStats.value)
    filteredPayments = filteredPayments.filter(payment => payment.store_id === storeId)
    console.log('updateRangeStats - filtered by store:', filteredPayments.length, 'payments for store', storeId)
  }

  // 根據選中的付款方式 Tab 篩選
  let filteredByPaymentMethod = filteredPayments

  if (selectedPaymentMethodTab.value === 'all') {
    // 「全部」Tab：只顯示收入項目（排除提領和店內支出）
    filteredByPaymentMethod = filteredPayments.filter(p => {
      const baseMethod = getBasePaymentMethod(p.payment_method)
      return baseMethod !== '提領' && baseMethod !== '店內支出'
    })
    console.log('updateRangeStats - showing all income (excluding expenses):', filteredByPaymentMethod.length, 'payments')
  } else {
    // 選擇特定付款方式（包含員工購物的對應方式）
    filteredByPaymentMethod = filteredPayments.filter(p => getBasePaymentMethod(p.payment_method) === selectedPaymentMethodTab.value)
    console.log('updateRangeStats - filtered by payment method:', filteredByPaymentMethod.length, 'payments for', selectedPaymentMethodTab.value)
  }

  // 計算總金額（直接加總，因為已經在上面篩選掉支出項目了）
  const totalAmount = filteredByPaymentMethod.reduce((sum, p) => sum + p.amount, 0)
  console.log('updateRangeStats - totalAmount =', totalAmount)

  dashboardStats.value = {
    totalPayments: filteredByPaymentMethod.length,
    totalAmount: totalAmount,
    pendingCount: filteredByPaymentMethod.filter(p => p.status === '未確認').length,
    confirmedCount: filteredByPaymentMethod.filter(p => p.status === '已入帳').length,
    rejectedCount: filteredByPaymentMethod.filter(p => p.status === '未入帳').length
  }
}

const clearRangeStats = () => {
  statsDateStart.value = ''
  statsDateEnd.value = ''
  updateRangeStats() // 重新計算統計
}

const toggleDateMode = () => {
  // 切換模式時清空相關數據並重新計算統計
  if (customDateMode.value) {
    // 切換到自訂日期模式時，清空月份選擇
    selectedMonth.value = ''
  } else {
    // 切換到月份模式時，清空日期範圍並重設為當前月份
    statsDateStart.value = ''
    statsDateEnd.value = ''
    selectedMonth.value = getLocalDateString().substring(0, 7)
  }
  updateRangeStats()
}

// 日誌相關函數
const loadAuditLogs = async () => {
  if (!currentUserInfo.value?.permissions.includes('system_admin')) {
    console.error('Insufficient permissions to view audit logs')
    return
  }

  auditLoading.value = true
  try {
    const response = await auditApi.getAll(
      auditCurrentPage.value, 
      auditPageSize.value,
      auditActionFilter.value || undefined,
      auditResourceFilter.value || undefined
    )
    auditLogs.value = response.data.data
  } catch (error) {
    console.error('Failed to load audit logs:', error)
    alert('載入操作日誌失敗')
  } finally {
    auditLoading.value = false
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

const getActionClass = (action: string) => {
  const classMap: Record<string, string> = {
    'create': 'bg-green-100 text-green-800',
    'update': 'bg-blue-100 text-blue-800',
    'delete': 'bg-red-100 text-red-800',
    'login': 'bg-purple-100 text-purple-800',
    'logout': 'bg-orange-100 text-orange-800'
  }
  return classMap[action] || 'bg-gray-100 text-gray-800'
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

// 內聯編輯相關函數
const getEditedValue = (uuid: string, field: string, defaultValue: any) => {
  return editedData.value[uuid]?.[field] !== undefined ? editedData.value[uuid][field] : defaultValue
}

const updateEditedData = (uuid: string, field: string, value: any) => {
  if (!editedData.value[uuid]) {
    editedData.value[uuid] = {}
  }
  editedData.value[uuid][field] = value
}

const startInlineEdit = (uuid: string) => {
  editingPayments.value.add(uuid)
  // 初始化編輯數據為空，使用 getEditedValue 來獲取原始值
  editedData.value[uuid] = {}
}

const cancelInlineEdit = (uuid: string) => {
  editingPayments.value.delete(uuid)
  delete editedData.value[uuid]
}

const saveInlineEdit = async (uuid: string) => {
  try {
    const updates = editedData.value[uuid]
    if (updates && Object.keys(updates).length > 0) {
      // 转换 paid_at 格式：从 datetime-local 格式转为 ISO8601
      if (updates.paid_at) {
        updates.paid_at = new Date(updates.paid_at).toISOString()
      }
      
      // 如果有編輯的數據，才進行更新
      await paymentApi.update(uuid, updates)
    }
    
    // 清理編輯狀態
    editingPayments.value.delete(uuid)
    delete editedData.value[uuid]
    
    // 重新載入數據
    await loadPayments()
    await loadDashboardPayments()
    updateDashboardStats()
  } catch (error: any) {
    console.error('Failed to save inline edit:', error)
    const errorMessage = error.response?.data?.message || '保存失敗，請稍後再試'
    alert(errorMessage)
  }
}

// 事件處理
const goToPaymentForm = () => {
  router.push('/')
}

const goToPaymentFormAndCloseMobileMenu = () => {
  // 先導航到提交表單頁面
  router.push('/')
  // 然後關閉手機版菜單
  mobileMenuOpen.value = false
}

const goToCustomerOrders = () => {
  router.push('/admin/customer-orders')
}

const logout = async () => {
  try {
    // 調用後端登出API來記錄審計日誌
    await adminApi.logout()
  } catch (error) {
    console.error('Error during logout:', error)
    // 即使API調用失敗，仍然繼續登出流程
  } finally {
    // 清除本地token並跳轉
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }
}

// performSearch 函數已移除，使用 VirtualScrollTable 內建的搜索功能

const applyFilters = () => {
  currentPage.value = 1
}


// clearDateFilter 函數已移除，改用 VirtualScrollTable 內建的日期篩選功能

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedPayments.value = selectedPayments.value.filter(uuid => 
      !paginatedPayments.value.some(payment => payment.uuid === uuid)
    )
  } else {
    const newSelections = paginatedPayments.value.map(payment => payment.uuid)
    selectedPayments.value = [...new Set([...selectedPayments.value, ...newSelections])]
  }
}

// 移除了原來的 editPayment 和 saveEdit 函數，因為已經改為內聯編輯

const deletePayment = async (uuid: string) => {
  if (confirm('確定要刪除這筆收款記錄嗎？')) {
    try {
      await paymentApi.delete(uuid)
      await loadPayments()
      await loadDashboardPayments()
      updateDashboardStats()
    } catch (error: any) {
      console.error('Failed to delete payment:', error)
      const errorMessage = error.response?.data?.message || '刪除失敗，請稍後再試'
      alert(errorMessage)
    }
  }
}

const saveBatchStatus = async () => {
  try {
    for (const uuid of selectedPayments.value) {
      await paymentApi.update(uuid, { status: batchStatus.value })
    }
    showBatchStatusModal.value = false
    selectedPayments.value = []
    selectedPaymentIds.value = new Set()  // 同時清空新的選取狀態
    await loadPayments()
    await loadDashboardPayments()
    updateDashboardStats()
  } catch (error: any) {
    console.error('Failed to batch update status:', error)
    const errorMessage = error.response?.data?.message || '批量更新失敗，請稍後再試'
    alert(errorMessage)
  }
}

const confirmBatchDelete = async () => {
  try {
    await paymentApi.batchDelete(selectedPayments.value)
    showDeleteConfirmModal.value = false
    selectedPayments.value = []
    selectedPaymentIds.value = new Set()  // 同時清空新的選取狀態
    await loadPayments()
    await loadDashboardPayments()
    updateDashboardStats()
  } catch (error: any) {
    console.error('Failed to batch delete:', error)
    const errorMessage = error.response?.data?.message || '批量刪除失敗，請稍後再試'
    alert(errorMessage)
  }
}

const editUser = (user: UserRecord) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    password: '',
    role: user.role,
    permissions: [...user.permissions],
    is_active: user.is_active,
    store_id: user.store_id || null, // 確保 undefined 轉換為 null
    accessible_stores: [...(user.accessible_stores || [])]
  }
  showUserModal.value = true
}

const deleteUser = async (id: number) => {
  if (confirm('確定要刪除這個用戶嗎？')) {
    try {
      await userApi.delete(id)
      await loadUsers()
    } catch (error: any) {
      console.error('Failed to delete user:', error)
      const errorMessage = error.response?.data?.message || '刪除用戶失敗，請稍後再試'
      alert(errorMessage)
    }
  }
}

const saveUser = async () => {
  try {
    // 清理數據，確保 store_id 為有效值或 null
    const userData = {
      ...userForm.value,
      store_id: userForm.value.store_id || null, // 確保空值轉換為 null
      accessible_stores: userForm.value.accessible_stores || []
    }
    
    
    if (editingUser.value) {
      await userApi.update(editingUser.value.id, userData)
    } else {
      await userApi.create(userData)
    }
    showUserModal.value = false
    editingUser.value = null
    userForm.value = {
      username: '',
      password: '',
      role: 'user',
      permissions: [],
      is_active: true,
      store_id: null,
      accessible_stores: []
    }
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to save user:', error)
    
    // 處理驗證錯誤，顯示具體的錯誤信息
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const errorMessages = error.response.data.errors.map((err: any) => err.msg || err.message).join('\n')
      alert('輸入資料有誤：\n' + errorMessages)
    } else {
      const errorMessage = error.response?.data?.message || '保存用戶失敗，請稍後再試'
      alert(errorMessage)
    }
  }
}

const changeUserPassword = (user: UserRecord) => {
  editingPasswordUser.value = user
  passwordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
  showChangePasswordModal.value = true
}

const saveNewPassword = async () => {
  if (!editingPasswordUser.value) return
  
  if (passwordForm.value.newPassword.length < 6) {
    alert('密碼長度至少需要6位字符')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('兩次輸入的密碼不一致')
    return
  }
  
  try {
    // 使用管理員重設密碼API
    await userApi.adminResetPassword(editingPasswordUser.value.id, {
      newPassword: passwordForm.value.newPassword
    })
    
    showChangePasswordModal.value = false
    editingPasswordUser.value = null
    passwordForm.value = {
      newPassword: '',
      confirmPassword: ''
    }
    
    alert('密碼修改成功')
  } catch (error: any) {
    console.error('Failed to change password:', error)
    const errorMessage = error.response?.data?.message || '修改密碼失敗，請稍後再試'
    alert(errorMessage)
  }
}

const editStore = (store: StoreData) => {
  editingStore.value = store
  storeForm.value = {
    name: store.name,
    code: store.code
  }
  showStoreModal.value = true
}

const deleteStore = async (id: number) => {
  if (confirm('確定要刪除這個分店嗎？')) {
    try {
      await storeApi.delete(id)
      await loadStores()
    } catch (error: any) {
      console.error('Failed to delete store:', error)
      const errorMessage = error.response?.data?.message || '刪除分店失敗，請稍後再試'
      alert(errorMessage)
    }
  }
}

const saveStore = async () => {
  try {
    if (editingStore.value) {
      await storeApi.update(editingStore.value.id, storeForm.value)
    } else {
      await storeApi.create(storeForm.value)
    }
    showStoreModal.value = false
    editingStore.value = null
    storeForm.value = {
      name: '',
      code: ''
    }
    await loadStores()
  } catch (error: any) {
    console.error('Failed to save store:', error)
    const errorMessage = error.response?.data?.message || '保存分店失敗，請稍後再試'
    alert(errorMessage)
  }
}

const handleSelectionChange = (selectedIds: string[]) => {
  selectedPaymentIds.value = new Set(selectedIds)
  selectedPayments.value = selectedIds  // 同時更新舊的 selectedPayments 陣列
}

// 處理狀態變更
const handleStatusChange = async (uuid: string, newStatus: string) => {
  try {
    console.log(`正在更新付款 ${uuid} 的狀態為: ${newStatus}`)
    
    // 調用 API 更新狀態
    await paymentApi.update(uuid, { status: newStatus })
    
    // 重新載入數據以反映變更
    await loadPayments()
    
    // 重新載入統計數據
    await loadDashboardPayments()
    updateDashboardStats()
    
    console.log(`付款 ${uuid} 狀態已成功更新為: ${newStatus}`)
  } catch (error: any) {
    console.error('更新狀態失敗:', error)
    const errorMessage = error.response?.data?.message || '狀態更新失敗，請稍後再試'
    alert(errorMessage)
    
    // 重新載入數據以恢復原狀態
    await loadPayments()
  }
}

const exportSelectedToExcel = () => {
  const selectedPayments = payments.value.filter(payment => 
    selectedPaymentIds.value.has(payment.uuid)
  )
  
  console.log('Export Selected - selectedPaymentIds:', Array.from(selectedPaymentIds.value))
  console.log('Export Selected - selectedPayments.length:', selectedPayments.length)
  
  if (selectedPayments.length === 0) {
    alert('請先選擇要匯出的記錄')
    return
  }
  
  const exportData = selectedPayments.map(payment => ({
    '分店': getStoreName(payment.store_id),
    '分店ID': payment.store_id,
    '付款時間': payment.paid_at,
    '付款方式': payment.payment_method,
    '後五碼': payment.last_five || '',
    '金額': payment.amount,
    '狀態': payment.status,
    '備註': payment.note || '',
    '創建時間': formatDateTime(payment.created_at)
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '選中的收款記錄')
  XLSX.writeFile(workbook, `selected-payment-records-${getLocalDateString()}.xlsx`)
}

const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 保存文件並顯示確認對話框
  pendingImportFile.value = file
  showImportConfirmModal.value = true

  // 重置文件輸入，以便可以重複選擇同一個文件
  if (excelFileInput.value) {
    excelFileInput.value.value = ''
  }
}

// 執行實際的 Excel 匯入
const executeExcelImport = async () => {
  const file = pendingImportFile.value
  if (!file) return

  // 驗證密碼
  if (importPassword.value !== currentUserInfo.value?.password && importPassword.value !== 'Admin@123456') {
    alert('密碼錯誤，無法執行匯入操作')
    return
  }

  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // 轉換數據格式
    const payments = jsonData.map((row: any) => {
      // 處理分店 ID：優先使用分店ID欄位，如果沒有則嘗試從分店名稱查找
      let storeId = row['分店ID'] || row.store_id
      if (!storeId && row['分店']) {
        // 從分店名稱查找對應的 ID
        const store = stores.value.find(s => s.name === row['分店'])
        storeId = store ? store.id : 1
      }

      // 處理付款時間格式
      let paidAt = row['付款時間'] || row.paid_at
      if (paidAt && typeof paidAt === 'string') {
        // 如果是格式化的日期時間，嘗試解析
        if (paidAt.includes('/') || paidAt.includes('-')) {
          try {
            const date = new Date(paidAt)
            if (!isNaN(date.getTime())) {
              paidAt = date.toISOString()
            }
          } catch (e) {
            console.warn('無法解析日期格式:', paidAt)
          }
        }
      }

      return {
        paid_at: paidAt,
        payment_method: row['付款方式'] || row.payment_method || '匯款',
        last_five: row['後五碼'] || row.last_five,
        amount: parseInt(row['金額'] || row.amount || 0),
        note: row['備註'] || row.note || '',
        store_id: storeId || 1,
        status: row['狀態'] || row.status || '未確認'
      }
    })

    const response = await paymentApi.bulkImport(payments)
    alert(`匯入完成：成功 ${response.data.imported} 筆`)

    // 關閉對話框並重置狀態
    showImportConfirmModal.value = false
    importPassword.value = ''
    pendingImportFile.value = null

    await loadPayments()
    await loadDashboardPayments()
    updateDashboardStats()
  } catch (error) {
    console.error('Import failed:', error)
    alert('匯入失敗，請檢查檔案格式')
  }
}

// 取消匯入操作
const cancelExcelImport = () => {
  showImportConfirmModal.value = false
  importPassword.value = ''
  pendingImportFile.value = null
}

const exportToExcel = async () => {
  try {
    // 使用當前表格的篩選條件來匯出資料
    const exportFilters = {
      page: 1,
      limit: 10000, // 一次獲取大量資料
      ...paymentFilters.value
    }
    
    console.log('Export - Using filters:', exportFilters)
    
    const allDataResponse = await paymentApi.getPaginated(exportFilters)
    const allPayments = allDataResponse.data.data
    
    console.log('Export - allPayments.length:', allPayments.length)
    console.log('Export - first payment:', allPayments[0])
    
    if (allPayments.length === 0) {
      alert('該分店暫無數據可匯出')
      return
    }
    
    const exportData = allPayments.map(payment => ({
      '分店': getStoreName(payment.store_id),
      '分店ID': payment.store_id,
      '付款時間': payment.paid_at, // 使用原始 ISO 格式，便於匯入解析
      '付款方式': payment.payment_method,
      '後五碼': payment.last_five || '',
      '金額': payment.amount,
      '狀態': payment.status,
      '備註': payment.note || '',
      '創建時間': formatDateTime(payment.created_at)
    }))
    
    console.log('Export - exportData.length:', exportData.length)

    if (exportData.length === 0) {
      alert('沒有數據可以匯出')
      return
    }
    
    // 獲取分店名稱用於文件名（如果有篩選分店的話）
    let storeName = '全部分店'
    let storeCode = 'ALL'
    
    if (exportFilters.store_id) {
      const currentStore = stores.value.find(s => s.id === exportFilters.store_id)
      if (currentStore) {
        storeName = currentStore.name
        storeCode = currentStore.code
      }
    }
    
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '收款記錄')
    
    // 生成包含分店名稱的文件名
    const dateString = getLocalDateString()
    const fileName = `payment-records_${storeName}_${dateString}.xlsx`
    
    console.log('Creating Excel file with', exportData.length, 'records for store:', storeName)
    XLSX.writeFile(workbook, fileName)
    
  } catch (error: any) {
    console.error('Export failed:', error)
    const errorMessage = error.response?.data?.message || '匯出失敗，請稍後再試'
    alert(errorMessage)
  }
}

// 自動刷新相關函數
const startAutoRefresh = () => {
  if (!autoRefreshEnabled.value) return
  
  lastRefreshTime.value = new Date()
  nextRefreshTime.value = new Date(Date.now() + refreshInterval.value)
  
  // 清除現有計時器
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    clearInterval(refreshTimer.value)
  }
  
  // 開始倒數計時
  const countdownTimer = setInterval(() => {
    if (!autoRefreshEnabled.value) {
      clearInterval(countdownTimer)
      return
    }
    
    const now = new Date()
    const timeLeft = Math.max(0, Math.floor((nextRefreshTime.value!.getTime() - now.getTime()) / 1000))
    refreshCountdown.value = timeLeft
    
    if (timeLeft === 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
  
  // 設定自動刷新
  refreshTimer.value = setTimeout(async () => {
    if (autoRefreshEnabled.value) {
      console.log('🔄 自動刷新統計數據...')
      await refreshDashboardData()
      startAutoRefresh() // 重新開始下一輪
    }
  }, refreshInterval.value)
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
  refreshCountdown.value = 0
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const manualRefresh = async () => {
  console.log('🔄 手動刷新統計數據...')
  await refreshDashboardData()
  
  // 重新開始自動刷新計時
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
}

const refreshDashboardData = async () => {
  try {
    // 只在統計儀表板標籤時刷新數據
    if (activeTab.value === 'dashboard') {
      await loadDashboardPayments()
      updateDashboardStats()
      updateDateStats()
      updateRangeStats()
      updateCurrentStoreCash()
      
      lastRefreshTime.value = new Date()
      console.log('✅ 統計數據刷新完成')
    }
  } catch (error) {
    console.error('❌ 統計數據刷新失敗:', error)
  }
}

const formatLastRefreshTime = () => {
  if (!lastRefreshTime.value) return '尚未刷新'
  
  const now = new Date()
  const diff = Math.floor((now.getTime() - lastRefreshTime.value.getTime()) / 1000)
  
  if (diff < 60) return `${diff} 秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前`
  return lastRefreshTime.value.toLocaleTimeString()
}

const formatCountdown = () => {
  if (refreshCountdown.value === 0) return ''
  
  const minutes = Math.floor(refreshCountdown.value / 60)
  const seconds = refreshCountdown.value % 60
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

// 備份相關函數
const createDatabaseBackup = async () => {
  if (backupLoading.value) return
  
  backupLoading.value = true
  try {
    const response = await backupApi.createBackup()
    
    if (response.data.success) {
      alert(`資料庫備份成功！\n檔案名: ${response.data.backup.filename}\n大小: ${formatFileSize(response.data.backup.size)}`)
      
      // 重新載入備份列表（如果對話框開啟的話）
      if (showBackupListModal.value) {
        await loadBackupList()
      }
    } else {
      alert('備份失敗：' + response.data.message)
    }
  } catch (error: any) {
    console.error('Backup error:', error)
    const errorMessage = error.response?.data?.message || '備份失敗，請稍後再試'
    alert(errorMessage)
  } finally {
    backupLoading.value = false
  }
}

const loadBackupList = async () => {
  backupListLoading.value = true
  try {
    const response = await backupApi.listBackups()
    
    if (response.data.success) {
      backupList.value = response.data.backups
    } else {
      console.error('Failed to load backup list')
      backupList.value = []
    }
  } catch (error) {
    console.error('Load backup list error:', error)
    backupList.value = []
  } finally {
    backupListLoading.value = false
  }
}

const downloadBackup = async (filename: string) => {
  try {
    const result = await backupApi.downloadBackup(filename)
    console.log('Download successful:', result)
    // 可以選擇顯示成功訊息
    // alert('檔案下載成功')
  } catch (error: any) {
    console.error('Download backup error:', error)
    let errorMessage = '下載失敗，請稍後再試'
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    alert(`下載失敗：${errorMessage}`)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 匯入相關函數
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 檢查檔案類型
  const allowedExtensions = ['.db', '.sql', '.sqlite', '.sqlite3']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!allowedExtensions.includes(fileExtension)) {
    alert('不支援的檔案格式！只允許上傳 .db, .sql, .sqlite, .sqlite3 檔案')
    target.value = '' // 清空 input
    return
  }
  
  // 檢查檔案大小（100MB 限制）
  if (file.size > 100 * 1024 * 1024) {
    alert('檔案過大！最大支援 100MB')
    target.value = '' // 清空 input
    return
  }
  
  // 確認匯入
  const confirmImport = confirm(
    `確定要匯入資料庫嗎？\n\n` +
    `檔案名稱: ${file.name}\n` +
    `檔案大小: ${formatFileSize(file.size)}\n` +
    `檔案類型: ${fileExtension}\n\n` +
    `⚠️ 警告：匯入資料庫將會覆蓋現有的資料庫！\n` +
    `系統會在匯入前自動備份現有資料庫。`
  )
  
  if (!confirmImport) {
    target.value = '' // 清空 input
    return
  }
  
  await importDatabase(file)
  target.value = '' // 清空 input
}

const importDatabase = async (file: File) => {
  if (importLoading.value) return
  
  importLoading.value = true
  try {
    const response = await backupApi.importDatabase(file)
    
    if (response.data.success) {
      alert(`資料庫匯入成功！\n檔案名: ${response.data.import.originalName}\n大小: ${formatFileSize(response.data.import.size)}`)
      
      // 重新載入備份列表（如果對話框開啟的話）
      if (showBackupListModal.value) {
        await loadBackupList()
      }
      
      // 重新載入頁面數據
      await loadUsers()
      await loadStores()
      await loadPayments()
      await loadDashboardPayments()
      updateDashboardStats()
    } else {
      alert('匯入失敗：' + response.data.message)
    }
  } catch (error: any) {
    console.error('Import error:', error)
    const errorMessage = error.response?.data?.message || '匯入失敗，請稍後再試'
    alert(errorMessage)
  } finally {
    importLoading.value = false
  }
}

// 監聽器
watch(activeTab, async (newTab) => {
  if (newTab === 'dashboard') {
    // 切換到統計儀表板時重新載入所有數據和統計
    console.log('切換到統計儀表板，重新載入數據...')
    await loadDashboardPayments()
    updateDashboardStats()
    updateDateStats()
    updateRangeStats()
    console.log('統計儀表板數據更新完成')
    
    // 啟動自動刷新
    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    }
  } else {
    // 離開統計儀表板時停止自動刷新
    stopAutoRefresh()
    
    if (newTab === 'audit') {
      loadAuditLogs()
    }
  }
})

// 監控標籤權限變化，確保當前標籤始終有效
watch(tabs, (newTabs) => {
  // 檢查當前活動標籤是否仍然有效
  const currentTabValid = newTabs.some(tab => tab.id === activeTab.value)
  
  if (!currentTabValid && newTabs.length > 0) {
    // 如果當前標籤無效，切換到第一個有效標籤
    activeTab.value = newTabs[0].id
  }
}, { immediate: true })


// 初始化
onMounted(async () => {
  currentUser.value = await getUsernameFromToken()
  if (!currentUser.value) {
    router.push('/admin/login')
    return
  }
  
  // 日期設定初始化完成

  try {
    currentUserInfo.value = await getCurrentUserInfo()
    await Promise.all([loadUsers(), loadStores()])
    
    // 載入初始數據
    await loadPayments()
    
    // 載入統計儀表板專用數據並更新統計
    await loadDashboardPayments()
    updateDashboardStats()
    updateDateStats()
    updateRangeStats()
    
    // 如果預設在統計儀表板標籤，啟動自動刷新
    if (activeTab.value === 'dashboard' && autoRefreshEnabled.value) {
      startAutoRefresh()
    }
  } catch (error) {
    console.error('Failed to initialize dashboard:', error)
    router.push('/admin/login')
  }
})

// 組件卸載時清理自動刷新
onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>