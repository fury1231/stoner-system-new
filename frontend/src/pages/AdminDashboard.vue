<template>
  <div class="h-screen-safe bg-gray-50 pt-safe-top overflow-hidden flex flex-col">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-lg xs:text-base-mobile sm:text-xl font-semibold">
              管理後台
              <span class="ml-2 text-xs xs:text-xxs sm:text-sm font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">v3.73</span>
            </h1>
          </div>
          
          <!-- 桌面版導航 -->
          <div class="hidden md:flex items-center space-x-3">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              @click="goToPaymentForm"
            >
              回到提交表單
            </button>
            
            <button
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
              @click="goToCustomerOrders"
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
                  v-model="debugMode" 
                  type="checkbox"
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
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              @click="logout"
            >
              登出
            </button>
          </div>
          
          <!-- 手機版菜單按鈕 -->
          <div class="md:hidden flex items-center">
            <button
              class="text-gray-400 hover:text-gray-600 p-2"
              @click="mobileMenuOpen = !mobileMenuOpen"
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
              class="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 xs:py-3.5 rounded-md text-sm xs:text-sm-mobile font-medium flex items-center space-x-2 min-h-touch"
              @click="goToPaymentFormAndCloseMobileMenu"
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
                  v-model="debugMode" 
                  type="checkbox"
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
              class="w-full text-left bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              @click="logout"
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
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
              @click="activeTab = tab.id"
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

        <!-- 儀表板 Tab 切換器 -->
        <div class="mb-4">
          <div class="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              :class="dashboardTab === 'today'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
              class="py-2 px-4 sm:px-6 rounded-md text-sm font-medium transition-all"
              @click="dashboardTab = 'today'"
            >
              📅 當日統計
            </button>
            <button
              :class="dashboardTab === 'period'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
              class="py-2 px-4 sm:px-6 rounded-md text-sm font-medium transition-all"
              @click="dashboardTab = 'period'"
            >
              📊 期間統計
            </button>
          </div>
        </div>

        <!-- 當日統計卡片 -->
        <div v-show="dashboardTab === 'today'" class="mb-4">
          <!-- 標題 -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-medium text-gray-900">當日營收統計</h2>
              <p v-if="selectedStoreForDateStats" class="text-sm text-blue-600">
                {{ accessibleStores.find(s => s.id === parseInt(selectedStoreForDateStats))?.name }}
              </p>
            </div>
            <button
              :disabled="activeTab !== 'dashboard'"
              class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition-colors disabled:opacity-50"
              title="立即刷新"
              @click="manualRefresh"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>刷新</span>
            </button>
          </div>

          <!-- 控制面板 -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 lg:p-2 mb-4 lg:mb-3">
            <div class="flex flex-wrap items-center gap-3 lg:gap-2">
              <!-- 日期選擇 -->
              <div class="flex items-center space-x-2">
                <span class="text-sm lg:text-xs text-gray-500">日期</span>
                <input
                  v-model="selectedDate"
                  type="date"
                  class="border border-gray-200 rounded-md px-2 py-1 text-sm lg:text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  @change="updateDateStats"
                />
              </div>

              <!-- 分店選擇 -->
              <div class="flex items-center space-x-2">
                <span class="text-sm lg:text-xs text-gray-500">分店</span>
                <select
                  v-model="selectedStoreForDateStats"
                  class="border border-gray-200 rounded-md px-2 py-1 text-sm lg:text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  @change="() => { updateDateStats(); updateRangeStats(); }"
                >
                  <option value="">全部分店</option>
                  <option v-for="store in accessibleStores" :key="store.id" :value="store.id">
                    {{ store.name }}
                  </option>
                </select>
              </div>

              <!-- 自動刷新狀態 -->
              <div class="flex items-center space-x-2 ml-auto">
                <div :class="autoRefreshEnabled ? 'w-2 h-2 bg-green-500 rounded-full animate-pulse' : 'w-2 h-2 bg-gray-300 rounded-full'"></div>
                <span class="text-xs text-gray-500">自動刷新</span>
                <span v-if="autoRefreshEnabled && refreshCountdown > 0" class="text-xs text-gray-400 font-mono">
                  {{ formatCountdown() }}
                </span>
                <button
                  :disabled="activeTab !== 'dashboard'"
                  class="lg:hidden p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                  @click="manualRefresh"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 主要指標卡片 (桌面版 6 欄，含匯款確認狀態) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <!-- 店內營收 -->
            <div class="col-span-2 sm:col-span-1 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">店內營收</p>
              <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(todayStats.storeRevenueAmount) }}</p>
            </div>
            <!-- 匯款 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">匯款</p>
              <p class="text-xl font-semibold text-gray-900">{{ formatCurrency(todayStats.remittanceAmount) }}</p>
            </div>
            <!-- 現金 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">現金</p>
              <p class="text-xl font-semibold text-gray-900">{{ formatCurrency(todayStats.cashAmount) }}</p>
            </div>
            <!-- 電子支付 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">電子支付</p>
              <p class="text-xl font-semibold text-gray-900">{{ formatCurrency(todayStats.electronicAmount) }}</p>
            </div>
            <!-- 未確認 (桌面版併入主要指標) -->
            <div class="hidden lg:block bg-yellow-50 rounded-lg border border-yellow-200 p-4">
              <p class="text-sm text-yellow-700 mb-1">🏦 未確認</p>
              <p class="text-xl font-semibold text-yellow-600">{{ todayStats.pendingCount }} 筆</p>
            </div>
            <!-- 已入帳 (桌面版併入主要指標) -->
            <div class="hidden lg:block bg-green-50 rounded-lg border border-green-200 p-4">
              <p class="text-sm text-green-700 mb-1">✓ 已入帳</p>
              <p class="text-xl font-semibold text-green-600">{{ todayStats.confirmedCount }} 筆</p>
            </div>
          </div>

          <!-- 匯款確認狀態 (手機/平板版獨立區塊) -->
          <div class="lg:hidden bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span class="mr-2">🏦</span>匯款確認狀態
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p class="text-xs text-yellow-700 mb-1">未確認</p>
                <p class="text-2xl font-semibold text-yellow-600">{{ todayStats.pendingCount }} 筆</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                <p class="text-xs text-green-700 mb-1">已入帳</p>
                <p class="text-2xl font-semibold text-green-600">{{ todayStats.confirmedCount }} 筆</p>
              </div>
            </div>
          </div>

          <!-- 次要指標 -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <!-- 提領 -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <p class="text-xs text-gray-500 mb-1">提領</p>
              <p class="text-lg font-semibold text-red-600">{{ formatCurrency(todayStats.withdrawalAmount) }}</p>
            </div>
            <!-- 店內支出 -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <p class="text-xs text-gray-500 mb-1">店內支出</p>
              <p class="text-lg font-semibold text-orange-600">{{ formatCurrency(todayStats.storeExpenseAmount) }}</p>
            </div>
            <!-- 員工購物 -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <p class="text-xs text-gray-500 mb-1">員工購物</p>
              <p class="text-lg font-semibold text-purple-600">{{ formatCurrency(todayStats.employeePurchaseAmount) }}</p>
            </div>
            <!-- 贈品 -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <p class="text-xs text-gray-500 mb-1">贈品/公關</p>
              <p class="text-lg font-semibold text-pink-600">{{ todayStats.giftCount }} 筆</p>
            </div>
          </div>

          <!-- 詳細統計區塊 (桌面版 3 欄) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <!-- 電子支付明細 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-700">電子支付明細</h3>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{ todayStats.electronicCount }} 筆</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="border-l-2 border-green-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">街口</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(todayStats.jkopayAmount) }}</p>
                </div>
                <div class="border-l-2 border-emerald-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">LINE</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(todayStats.linepayAmount) }}</p>
                </div>
                <div class="border-l-2 border-blue-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">刷卡</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(todayStats.cardAmount) }}</p>
                </div>
                <div class="border-l-2 border-indigo-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">TapPay</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(todayStats.tappayAmount) }}</p>
                </div>
              </div>
            </div>

            <!-- 員工購物明細 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-700">員工購物</h3>
                <span class="text-sm font-semibold text-purple-600">{{ formatCurrency(todayStats.employeePurchaseAmount) }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="border-l-2 border-purple-300 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">現金</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(todayStats.employeeCashAmount) }}</p>
                </div>
                <div class="border-l-2 border-purple-400 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">匯款</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(todayStats.employeeRemittanceAmount) }}</p>
                </div>
                <div class="border-l-2 border-purple-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">電子</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(todayStats.employeeElectronicAmount) }}</p>
                </div>
              </div>
            </div>

            <!-- 贈品/公關品 (桌面版併入同列) -->
            <div v-if="todayStats.giftCount > 0" class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-700">贈品/公關</h3>
                <span class="text-sm font-semibold text-pink-600">{{ todayStats.giftCount }} 筆</span>
              </div>
              <div class="space-y-1 max-h-24 overflow-y-auto">
                <div
v-for="(gift, index) in todayStats.giftRecords.slice(0, 3)" :key="index"
                     class="flex items-center justify-between text-xs border-l-2 border-pink-400 pl-2 py-0.5">
                  <span class="truncate flex-1 mr-2">{{ gift.note || '無備註' }}</span>
                  <span class="text-gray-500 whitespace-nowrap">{{ gift.store_name }}</span>
                </div>
              </div>
            </div>
            <!-- 佔位 (當沒有贈品時) -->
            <div v-else class="hidden lg:block"></div>
          </div>

        </div>

        <!-- 全體統計卡片 -->
        <div v-show="dashboardTab === 'period'" class="mb-4">
          <div class="mb-3">
            <!-- 標題 -->
            <div class="mb-3">
              <h2 class="text-lg font-medium text-gray-900">期間統計總覽</h2>
              <p v-if="selectedStoreForDateStats" class="text-sm text-blue-600">
                {{ accessibleStores.find(s => s.id === parseInt(selectedStoreForDateStats))?.name }}
              </p>
            </div>

            <!-- Tab 切換器 -->
            <div class="mb-3">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tab in paymentMethodTabs"
                  :key="tab.value"
                  :class="selectedPaymentMethodTab === tab.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  @click="selectedPaymentMethodTab = tab.value; updateRangeStats()"
                >
                  {{ tab.icon }} {{ tab.label }}
                </button>
              </div>
            </div>

            <!-- 控制區域 -->
            <div class="space-y-3">
              <!-- 手機版：垂直排列 -->
              <div class="block sm:hidden space-y-3">
                <!-- 模式切換 -->
                <div class="flex items-center space-x-2">
                  <input
                    id="custom-date-mode-mobile"
                    v-model="customDateMode"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="toggleDateMode"
                  />
                  <label for="custom-date-mode-mobile" class="text-sm text-gray-600 cursor-pointer">自訂日期範圍</label>
                </div>
                
                <!-- 月份選擇 (手機版) - 滑動式 -->
                <div v-if="!customDateMode" class="space-y-2">
                  <div class="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-2">
                    <button
                      class="p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      @click="goToPreviousMonth"
                    >
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button
                      class="flex-1 text-center py-2 px-4"
                      :class="isCurrentMonth ? 'text-gray-900' : 'text-blue-600 hover:text-blue-700'"
                      @click="goToCurrentMonth"
                    >
                      <span class="text-lg font-semibold">{{ formatMonthDisplay(selectedMonth) }}</span>
                      <span v-if="!isCurrentMonth" class="block text-xs text-gray-400 mt-0.5">點擊回到本月</span>
                    </button>
                    <button
                      class="p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      @click="goToNextMonth"
                    >
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- 自訂日期範圍 (手機版) -->
                <div v-if="customDateMode" class="space-y-3 xs:space-y-2.5">
                  <div class="space-y-1.5">
                    <label class="text-sm xs:text-sm-mobile text-gray-600 font-medium">開始日期</label>
                    <input
                      v-model="statsDateStart"
                      type="date"
                      class="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm xs:text-sm-mobile py-2.5 xs:py-3 min-h-touch"
                      placeholder="開始日期"
                      @change="updateRangeStats"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm xs:text-sm-mobile text-gray-600 font-medium">結束日期</label>
                    <div class="flex items-center space-x-2">
                      <input
                        v-model="statsDateEnd"
                        type="date"
                        class="flex-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm xs:text-sm-mobile py-2.5 xs:py-3 min-h-touch"
                        placeholder="結束日期"
                        @change="updateRangeStats"
                      />
                      <button
                        v-if="statsDateStart || statsDateEnd"
                        class="p-2 xs:p-2.5 text-gray-400 hover:text-gray-600 min-w-touch min-h-touch rounded-md"
                        title="清除日期範圍"
                        @click="clearRangeStats"
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
                  <!-- 月份選擇 - 滑動式 -->
                  <div v-if="!customDateMode" class="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      class="p-2 rounded-md hover:bg-gray-100 transition-colors"
                      title="上個月"
                      @click="goToPreviousMonth"
                    >
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button
                      class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                      :class="isCurrentMonth ? 'text-gray-900' : 'text-blue-600 hover:bg-blue-50'"
                      :title="isCurrentMonth ? '' : '回到本月'"
                      @click="goToCurrentMonth"
                    >
                      {{ formatMonthDisplay(selectedMonth) }}
                    </button>
                    <button
                      class="p-2 rounded-md hover:bg-gray-100 transition-colors"
                      title="下個月"
                      @click="goToNextMonth"
                    >
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- 自訂日期範圍 -->
                  <div v-if="customDateMode" class="flex items-center space-x-2">
                    <label class="text-sm text-gray-600">日期範圍：</label>
                    <input
                      v-model="statsDateStart"
                      type="date"
                      class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="開始日期"
                      @change="updateRangeStats"
                    />
                    <span class="text-gray-500">至</span>
                    <input
                      v-model="statsDateEnd"
                      type="date"
                      class="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="結束日期"
                      @change="updateRangeStats"
                    />
                    <button
                      v-if="statsDateStart || statsDateEnd"
                      class="text-gray-400 hover:text-gray-600"
                      title="清除日期範圍"
                      @click="clearRangeStats"
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
                      id="custom-date-mode"
                      v-model="customDateMode"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      @change="toggleDateMode"
                    />
                    <label for="custom-date-mode" class="text-sm text-gray-600 cursor-pointer">自訂日期</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- GA 風格：期間主要指標 (桌面版 6 欄，含匯款確認狀態) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <!-- 總記錄數 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">
                {{ selectedPaymentMethodTab === 'all' ? '總記錄數' : paymentMethodTabs.find(t => t.value === selectedPaymentMethodTab)?.label + '記錄' }}
              </p>
              <p class="text-xl font-semibold text-gray-900">{{ dashboardStats.totalPayments }} 筆</p>
            </div>
            <!-- 總金額 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">
                {{ (selectedPaymentMethodTab === '提領' || selectedPaymentMethodTab === '店內支出') ? '總支出' : '總金額' }}
              </p>
              <p class="text-xl font-semibold text-gray-900">{{ formatCurrency(dashboardStats.totalAmount) }}</p>
            </div>
            <!-- 未入帳 (警示) -->
            <div
:class="dashboardStats.rejectedCount > 0 ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'"
                 class="rounded-lg border p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">未入帳</p>
              <p
:class="dashboardStats.rejectedCount > 0 ? 'text-red-600' : 'text-gray-900'"
                 class="text-xl font-semibold">{{ dashboardStats.rejectedCount }} 筆</p>
              <p v-if="dashboardStats.rejectedCount > 0" class="text-xs text-red-500 mt-1">需通知客人</p>
            </div>
            <!-- 贈品 (桌面版併入主要指標) -->
            <div class="hidden lg:block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p class="text-sm text-gray-500 mb-1">贈品/公關</p>
              <p class="text-xl font-semibold text-pink-600">{{ dashboardStats.giftCount }} 筆</p>
            </div>
            <!-- 未確認 (桌面版併入主要指標) -->
            <div class="hidden lg:block bg-yellow-50 rounded-lg border border-yellow-200 p-4">
              <p class="text-sm text-yellow-700 mb-1">🏦 未確認</p>
              <p class="text-xl font-semibold text-yellow-600">{{ dashboardStats.pendingCount }} 筆</p>
            </div>
            <!-- 已入帳 (桌面版併入主要指標) -->
            <div class="hidden lg:block bg-green-50 rounded-lg border border-green-200 p-4">
              <p class="text-sm text-green-700 mb-1">✓ 已入帳</p>
              <p class="text-xl font-semibold text-green-600">{{ dashboardStats.confirmedCount }} 筆</p>
            </div>
          </div>

          <!-- 匯款確認狀態 (手機/平板版獨立區塊) -->
          <div class="lg:hidden bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span class="mr-2">🏦</span>匯款確認狀態
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p class="text-xs text-yellow-700 mb-1">未確認</p>
                <p class="text-2xl font-semibold text-yellow-600">{{ dashboardStats.pendingCount }} 筆</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                <p class="text-xs text-green-700 mb-1">已入帳</p>
                <p class="text-2xl font-semibold text-green-600">{{ dashboardStats.confirmedCount }} 筆</p>
              </div>
            </div>
          </div>

          <!-- GA 風格：期間詳細統計 (桌面版 3 欄) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <!-- 電子支付明細 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-700">電子支付明細</h3>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {{ dashboardStats.jkopayCount + dashboardStats.linepayCount + dashboardStats.cardCount + dashboardStats.tappayCount }} 筆
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="border-l-2 border-green-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">街口</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(dashboardStats.jkopayAmount) }}</p>
                </div>
                <div class="border-l-2 border-emerald-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">LINE</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(dashboardStats.linepayAmount) }}</p>
                </div>
                <div class="border-l-2 border-blue-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">刷卡</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(dashboardStats.cardAmount) }}</p>
                </div>
                <div class="border-l-2 border-indigo-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">TapPay</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(dashboardStats.tappayAmount) }}</p>
                </div>
              </div>
            </div>

            <!-- 員工購物明細 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-700">員工購物明細</h3>
                <span class="text-sm font-semibold text-purple-600">{{ formatCurrency(dashboardStats.employeePurchaseAmount) }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="border-l-2 border-purple-300 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">現金</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(dashboardStats.employeeCashAmount) }}</p>
                </div>
                <div class="border-l-2 border-purple-400 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">匯款</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(dashboardStats.employeeRemittanceAmount) }}</p>
                </div>
                <div class="border-l-2 border-purple-500 pl-2 py-0.5">
                  <p class="text-xs text-gray-500">電子</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatCurrency(dashboardStats.employeeElectronicAmount) }}</p>
                </div>
              </div>
            </div>

            <!-- 贈品/公關品 (桌面版併入詳細統計列) -->
            <div v-if="dashboardStats.giftCount > 0" class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-700">贈品/公關</h3>
                <span class="text-sm font-semibold text-pink-600">{{ dashboardStats.giftCount }} 筆</span>
              </div>
              <div class="space-y-1 max-h-24 overflow-y-auto">
                <div
v-for="(gift, index) in dashboardStats.giftRecords.slice(0, 3)" :key="index"
                     class="flex items-center justify-between text-xs border-l-2 border-pink-400 pl-2 py-0.5">
                  <span class="truncate flex-1 mr-2">{{ gift.note || '無備註' }}</span>
                  <span class="text-gray-500 whitespace-nowrap">{{ gift.store_name }}</span>
                </div>
              </div>
            </div>
            <!-- 佔位 (當沒有贈品時) -->
            <div v-else class="hidden lg:block"></div>
          </div>
        </div>

        <!-- GA 風格：當前店裡現金總額 -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-700">當前店裡現金總額</h3>
            <span class="text-xs text-gray-500">現金收入 - 提領 - 店內支出</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
v-for="storeCash in currentStoreCash" :key="storeCash.store_id"
                 class="border-l-2 border-green-500 pl-2 py-1">
              <p class="text-xs text-gray-500">{{ storeCash.store_name }}</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(storeCash.cash_amount) }}</p>
            </div>
            <div v-if="currentStoreCash.length === 0" class="col-span-full text-center py-2 text-gray-400 text-sm">
              暫無現金記錄
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
              <button class="text-gray-400 hover:text-gray-600" @click="message = ''">
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
          class="hidden"
          @change="handleFileImport"
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
      <div v-show="activeTab === 'users'">
        <UsersTab
          :has-permission="hasPermission('manage_users')"
          :users="users"
          :available-permissions="availablePermissions"
          @add-user="showUserModal = true; editingUser = null"
          @edit-user="editUser"
          @change-password="changeUserPassword"
          @delete-user="deleteUser"
        />
      </div>

      <!-- 分店管理 -->
      <div v-show="activeTab === 'stores'">
        <StoresTab
          :has-permission="hasPermission('manage_stores')"
          :stores="stores"
          @add-store="showStoreModal = true; editingStore = null"
          @edit-store="editStore"
          @delete-store="deleteStore"
        />
      </div>

      <!-- 操作日誌 -->
      <div v-show="activeTab === 'audit'">
        <AuditTab
          :has-permission="hasPermission('view_reports')"
          :logs="auditLogs"
          :loading="auditLoading"
          :current-page="auditCurrentPage"
          :page-size="auditPageSize"
          :action-filter="auditActionFilter"
          :resource-filter="auditResourceFilter"
          :backup-loading="backupLoading"
          :import-loading="importLoading"
          :clear-data-loading="clearDataLoading"
          :debug-mode="debugMode"
          @create-backup="createDatabaseBackup"
          @trigger-file-upload="triggerFileUpload"
          @show-backup-list="showBackupListModal = true; loadBackupList()"
          @show-clear-data="showClearDataModal = true"
          @reload="loadAuditLogs"
          @filter-change="auditCurrentPage = 1; loadAuditLogs()"
          @prev-page="auditCurrentPage > 1 && auditCurrentPage--"
          @next-page="auditCurrentPage++"
          @update:action-filter="auditActionFilter = $event"
          @update:resource-filter="auditResourceFilter = $event"
        />
        <!-- Hidden file input for database import -->
        <input
          ref="fileInput"
          type="file"
          accept=".db,.sql,.sqlite,.sqlite3"
          class="hidden"
          @change="handleFileSelect"
        />
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
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              @click="showBatchStatusModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              @click="saveBatchStatus"
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
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              @click="showDeleteConfirmModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              @click="confirmBatchDelete"
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
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              @click="cancelExcelImport"
            >
              取消
            </button>
            <button
              :disabled="!importPassword"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              @click="executeExcelImport"
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
                    v-model="userForm.permissions" 
                    type="checkbox"
                    :value="perm"
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
                    v-model="userForm.accessible_stores" 
                    type="checkbox"
                    :value="store.id"
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
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              @click="showUserModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              @click="saveUser"
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
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              @click="showStoreModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              @click="saveStore"
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
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              @click="showChangePasswordModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              @click="saveNewPassword"
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
              class="text-gray-400 hover:text-gray-600"
              @click="showBackupListModal = false"
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
                  class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  @click="downloadBackup(backup.filename)"
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
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              @click="showBackupListModal = false"
            >
              關閉
            </button>
          </div>
        </div>
        </div>
      </div>

    <!-- 清空數據確認對話框 -->
    <div v-if="showClearDataModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-red-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            危險操作：清空所有數據
          </h3>
        </div>
        <div class="px-6 py-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-800 font-medium mb-2">此操作將刪除：</p>
            <ul class="text-red-700 text-sm list-disc list-inside space-y-1">
              <li>所有收款記錄 (payments)</li>
              <li>所有客訂單記錄 (customer_orders)</li>
              <li>所有操作日誌 (audit_logs)</li>
            </ul>
            <p class="text-red-800 font-bold mt-3">⚠️ 此操作無法復原！</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              請輸入管理員密碼確認：
            </label>
            <input
              v-model="clearDataPassword"
              type="password"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
              placeholder="輸入密碼"
            />
          </div>
          <div class="mb-4">
            <label class="flex items-center text-sm text-gray-700">
              <input
                v-model="clearDataConfirm"
                type="checkbox"
                class="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
              />
              我確認要刪除所有數據，且了解此操作無法復原
            </label>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            @click="showClearDataModal = false; clearDataPassword = ''; clearDataConfirm = false"
          >
            取消
          </button>
          <button
            :disabled="!clearDataConfirm || !clearDataPassword || clearDataLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="executeClearData"
          >
            {{ clearDataLoading ? '清空中...' : '確認清空' }}
          </button>
        </div>
      </div>
    </div>

      </div>
      <!-- /Tab 內容區域 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import VirtualScrollTable from '@/components/VirtualScrollTable.vue'
import AuditTab from '@/components/admin/AuditTab.vue'
import StoresTab from '@/components/admin/StoresTab.vue'
import UsersTab from '@/components/admin/UsersTab.vue'
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
import * as XLSX from 'xlsx'
// 引入 Composables
import {
  useDateUtils,
  usePaymentMethod,
  useFormatters
} from '@/composables'

// 使用 Composables
const { getLocalDateString, getDateFromISO } = useDateUtils()
const { getBasePaymentMethod } = usePaymentMethod()
const { formatCurrency, formatDateTime, formatFileSize } = useFormatters()

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

    // 如果用戶信息尚未載入，只顯示無權限要求的標籤
    if (!currentUserInfo.value) return false

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

// 清空數據對話框狀態
const showClearDataModal = ref(false)
const clearDataLoading = ref(false)
const clearDataPassword = ref('')
const clearDataConfirm = ref(false)

// Excel 匯入確認對話框狀態
const showImportConfirmModal = ref(false)
const importPassword = ref('')
const pendingImportFile = ref<File | null>(null)

// Debug模式狀態
const debugMode = ref(false)

// 展開狀態 (v3.14)
const showElectronicBreakdown = ref(false)
const showEmployeeStats = ref(false)
const showGiftTracking = ref(false)

// 快速篩選狀態 (v3.14)
const quickFilterType = ref<'all' | 'employee' | 'gift' | 'electronic-detail'>('all')

// 消息顯示狀態
const message = ref('')
const messageClass = ref('')

// 自動刷新相關狀態
const autoRefreshEnabled = ref(true)
const refreshInterval = ref(5 * 60 * 1000) // 5分鐘
const lastRefreshTime = ref<Date | null>(null)
const nextRefreshTime = ref<Date | null>(null)
const refreshTimer = ref<ReturnType<typeof setTimeout> | null>(null)
// 🔒 內存洩漏修復：追蹤倒數計時器以確保正確清理
const countdownTimerRef = ref<ReturnType<typeof setInterval> | null>(null)
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
  rejectedCount: 0,
  // 電子支付細分 (v3.19)
  jkopayAmount: 0,
  linepayAmount: 0,
  cardAmount: 0,
  tappayAmount: 0,
  jkopayCount: 0,
  linepayCount: 0,
  cardCount: 0,
  tappayCount: 0,
  // 員工購物 (v3.19)
  employeePurchaseAmount: 0,
  employeePurchaseCount: 0,
  employeeCashAmount: 0,
  employeeRemittanceAmount: 0,
  employeeElectronicAmount: 0,
  // 贈品/公關品 (v3.19)
  giftCount: 0,
  giftRecords: [] as Array<{ note: string; paid_at: string; store_name: string }>
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
  withdrawalAmount: 0,    // 提領金額

  // 電子支付細分統計 (v3.14)
  jkopayAmount: 0,        // 街口支付
  linepayAmount: 0,       // LINE PAY
  cardAmount: 0,          // 刷卡
  tappayAmount: 0,        // TapPay
  jkopayCount: 0,
  linepayCount: 0,
  cardCount: 0,
  tappayCount: 0,

  // 員工購物統計 (v3.14)
  employeePurchaseAmount: 0,     // 員工購物總額
  employeePurchaseCount: 0,      // 員工購物筆數
  employeeCashAmount: 0,         // 員工購物-現金
  employeeRemittanceAmount: 0,   // 員工購物-匯款
  employeeElectronicAmount: 0,   // 員工購物-電子支付

  // 贈品/公關品統計 (v3.14)
  giftCount: 0,           // 贈品/公關品筆數（金額為 0）
  giftRecords: [] as Array<{ note: string; paid_at: string; store_name: string }>
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
// 日期工具函數已從 composables 引入：getLocalDateString, getDateFromISO, getBasePaymentMethod

const selectedDate = ref(getLocalDateString()) // 當日統計的選定日期
const selectedMonth = ref(getLocalDateString().substring(0, 7)) // 當前月份 (YYYY-MM)
const customDateMode = ref(false) // 是否使用自訂日期模式
const statsDateStart = ref('') // 全體統計的開始日期
const statsDateEnd = ref('') // 全體統計的結束日期
const selectedStoreForDateStats = ref('') // 指定日期統計的分店篩選
const selectedPaymentMethodTab = ref('all') // 選中的付款方式 Tab
const dashboardTab = ref<'today' | 'period'>('today') // 儀表板統計 Tab

// 付款方式 Tab 選項
const paymentMethodTabs = [
  { value: 'all', label: '全部', icon: '📊' },
  { value: '現金', label: '現金', icon: '💵' },
  { value: '匯款', label: '匯款', icon: '🏦' },
  { value: '電子支付', label: '電子支付', icon: '💳' },
  { value: '店內支出', label: '店內支出', icon: '🏪' },
  { value: '提領', label: '提領', icon: '💰' }
]

// 月份切換函數
const goToPreviousMonth = () => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const date = new Date(year, month - 2, 1) // month - 2 because month is 1-indexed and we want previous
  selectedMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  updateRangeStats()
}

const goToNextMonth = () => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const date = new Date(year, month, 1) // month because month is 1-indexed
  selectedMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  updateRangeStats()
}

const goToCurrentMonth = () => {
  selectedMonth.value = getLocalDateString().substring(0, 7)
  updateRangeStats()
}

const isCurrentMonth = computed(() => {
  return selectedMonth.value === getLocalDateString().substring(0, 7)
})

// 監聽快速篩選變化，自動展開相關區域
watch(quickFilterType, (newValue) => {
  showElectronicBreakdown.value = newValue === 'electronic-detail'
  showEmployeeStats.value = newValue === 'employee'
  showGiftTracking.value = newValue === 'gift'
})

// 對話框狀態
const showBatchStatusModal = ref(false)
const showDeleteConfirmModal = ref(false)
const showUserModal = ref(false)
const showStoreModal = ref(false)
const showChangePasswordModal = ref(false)

const batchStatus = ref<'未確認' | '已入帳' | '未入帳'>('已入帳')

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
const availablePermissions: Record<string, string> = {
  'manage_users': '會員管理',
  'manage_stores': '分店管理',
  'view_payments': '查看收款記錄',
  'edit_payments': '修改收款記錄',
  'delete_payments': '刪除收款記錄',
  'view_reports': '查看報告',
  'system_admin': '系統管理'
}

// 工具函數已從 composables 引入：formatCurrency, formatDateTime, formatDateTimeForInput

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

// 狀態 CSS 類別函數已從 composables 引入：getStatusClass, getStatusSelectClass

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
    
    // 構建篩選條件：如果有選擇分店，則只載入該分店的資料
    const filters: any = {
      page: 1,
      limit: 10000 // 載入大量資料用於統計
    }
    
    
    const response = await paymentApi.getPaginated(filters)
    
    // API 現在返回分頁格式： { data: PaymentRecord[], pagination: {...} }
    let paymentsData: PaymentRecord[] = []
    
    if (response.data && Array.isArray(response.data.data)) {
      // 正確的分頁格式
      paymentsData = response.data.data
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
    
    // 數據已載入，可在此添加後續處理邏輯
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
      payments.value = fallbackResponse.data.data.sort((a, b) => {
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
    const response = await storeApi.getAllAdmin()
    stores.value = response.data
  } catch (error: unknown) {
    console.error('Failed to load stores:', error)
    // 如果認證失敗或權限不足，嘗試使用公開端點作為備用方案
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
      try {
        const publicResponse = await storeApi.getAll()
        stores.value = publicResponse.data
      } catch (publicError: unknown) {
        console.error('Failed to load stores from public endpoint:', publicError)
      }
    }
  }
}

const updateDashboardStats = () => {
  // 匯款統計（只統計付款方式為「匯款」的記錄）
  // 使用獨立的 dashboardPayments 數據源
  const remittancePayments = dashboardPayments.value.filter(p => getBasePaymentMethod(p.payment_method) === '匯款')

  // 保留原有的詳細統計欄位，只更新基本統計
  dashboardStats.value = {
    ...dashboardStats.value,
    totalPayments: remittancePayments.length,
    totalAmount: remittancePayments.reduce((sum, p) => sum + p.amount, 0),
    pendingCount: remittancePayments.filter(p => p.status === '未確認').length,
    confirmedCount: remittancePayments.filter(p => p.status === '已入帳').length,
    rejectedCount: remittancePayments.filter(p => p.status === '未入帳').length
  }

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

// 更新當前分店現金總額 - 使用後端 API 計算（支援百萬筆資料）
const updateCurrentStoreCash = async () => {
  try {
    const response = await paymentApi.getAllStoresCashStatistics()
    currentStoreCash.value = response.data.map(stat => ({
      store_id: stat.storeId,
      store_name: stat.storeName,
      store_code: stat.storeCode,
      cash_amount: stat.cashBalance
    })).sort((a, b) => a.store_name.localeCompare(b.store_name))
  } catch (error) {
    console.error('Failed to load store cash statistics:', error)
    // 如果 API 失敗，保持現有資料不變
  }
}

// 統計相關函數
const updateDateStats = () => {
  const targetDate = selectedDate.value
  
  // 檢查所有付款的日期分布
  const dateDistribution = new Map()
  dashboardPayments.value.forEach(payment => {
    const paymentDate = getDateFromISO(payment.paid_at)
    dateDistribution.set(paymentDate, (dateDistribution.get(paymentDate) || 0) + 1)
  })

  let targetPayments = dashboardPayments.value.filter(payment => {
    const paymentDate = getDateFromISO(payment.paid_at)
    const dateMatches = paymentDate === targetDate

    // 如果有選擇特定分店，則加上分店篩選條件
    const storeMatches = selectedStoreForDateStats.value === '' ||
                        payment.store_id === parseInt(selectedStoreForDateStats.value)

    const matches = dateMatches && storeMatches
    return matches
  })
  
  // 如果沒有找到數據，提示用戶有數據的日期
  if (targetPayments.length === 0 && dateDistribution.size > 0) {
    // 保留供未來使用（可用於顯示有數據的日期建議）
    const _availableDates = Array.from(dateDistribution.keys()).sort((a, b) => b.localeCompare(a)).slice(0, 5)
    void _availableDates // 避免 unused variable 警告
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

  // 電子支付細分統計 (v3.14)
  const jkopayPayments = targetPayments.filter(p => p.payment_method === '電子支付-街口支付')
  const linepayPayments = targetPayments.filter(p => p.payment_method === '電子支付-LINE PAY')
  const cardPayments = targetPayments.filter(p => p.payment_method === '電子支付-刷卡')
  const tappayPayments = targetPayments.filter(p => p.payment_method === '電子支付-TAP PAY')

  const jkopayAmount = jkopayPayments.reduce((sum, p) => sum + p.amount, 0)
  const linepayAmount = linepayPayments.reduce((sum, p) => sum + p.amount, 0)
  const cardAmount = cardPayments.reduce((sum, p) => sum + p.amount, 0)
  const tappayAmount = tappayPayments.reduce((sum, p) => sum + p.amount, 0)

  // 員工購物統計 (v3.14)
  const employeePurchases = targetPayments.filter(p => p.payment_method.startsWith('員工購物-'))
  const employeePurchaseAmount = employeePurchases.reduce((sum, p) => sum + p.amount, 0)
  const employeeCashAmount = targetPayments.filter(p => p.payment_method === '員工購物-現金').reduce((sum, p) => sum + p.amount, 0)
  const employeeRemittanceAmount = targetPayments.filter(p => p.payment_method === '員工購物-匯款').reduce((sum, p) => sum + p.amount, 0)
  const employeeElectronicAmount = targetPayments.filter(p => p.payment_method === '員工購物-電子支付').reduce((sum, p) => sum + p.amount, 0)

  // 贈品/公關品統計 (v3.14)
  const giftPayments = targetPayments.filter(p => p.amount === 0)
  const giftRecords = giftPayments.map(p => ({
    note: p.note || '',
    paid_at: p.paid_at,
    store_name: stores.value.find(s => s.id === p.store_id)?.name || '未知'
  }))

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
    withdrawalAmount,

    // 電子支付細分統計 (v3.14)
    jkopayAmount,
    linepayAmount,
    cardAmount,
    tappayAmount,
    jkopayCount: jkopayPayments.length,
    linepayCount: linepayPayments.length,
    cardCount: cardPayments.length,
    tappayCount: tappayPayments.length,

    // 員工購物統計 (v3.14)
    employeePurchaseAmount,
    employeePurchaseCount: employeePurchases.length,
    employeeCashAmount,
    employeeRemittanceAmount,
    employeeElectronicAmount,

    // 贈品/公關品統計 (v3.14)
    giftCount: giftPayments.length,
    giftRecords
  }

}

const updateRangeStats = () => {
  let filteredPayments = dashboardPayments.value
  
  if (customDateMode.value) {
    // 自訂日期模式
    if (statsDateStart.value || statsDateEnd.value) {
      filteredPayments = dashboardPayments.value.filter(payment => {
        // 使用本地時間 (台灣 UTC+8) 進行日期篩選
        const paymentDate = new Date(payment.paid_at)
        const year = paymentDate.getFullYear()  // 本地時間
        const month = String(paymentDate.getMonth() + 1).padStart(2, '0')
        const day = String(paymentDate.getDate()).padStart(2, '0')
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
      
      // 先檢查是否有7月的資料（調試用，保留供未來使用）
      const _julyPayments = dashboardPayments.value.filter(p => p.paid_at.includes('2025-07'))
      void _julyPayments
      
      filteredPayments = dashboardPayments.value.filter(payment => {
        // 使用本地時間 (台灣 UTC+8) 進行月份篩選
        // PostgreSQL 回傳 UTC 格式 (2025-12-31T22:00:00.000Z)，需轉換成台灣時間
        const paymentDate = new Date(payment.paid_at)
        const year = paymentDate.getFullYear()  // 本地時間年份
        const month = String(paymentDate.getMonth() + 1).padStart(2, '0')  // 本地時間月份
        const paymentMonth = `${year}-${month}` // YYYY-MM
        const matches = paymentMonth === selectedMonth.value

        return matches
      })
    }
    // 沒有選擇月份時不進行篩選
  }
  
  // 如果有選擇特定分店，則加上分店篩選條件（期間統計總覽）
  if (selectedStoreForDateStats.value !== '') {
    const storeId = parseInt(selectedStoreForDateStats.value)
    filteredPayments = filteredPayments.filter(payment => payment.store_id === storeId)
  }

  // 根據選中的付款方式 Tab 篩選
  let filteredByPaymentMethod = filteredPayments

  if (selectedPaymentMethodTab.value === 'all') {
    // 「全部」Tab：只顯示收入項目（排除提領和店內支出）
    filteredByPaymentMethod = filteredPayments.filter(p => {
      const baseMethod = getBasePaymentMethod(p.payment_method)
      return baseMethod !== '提領' && baseMethod !== '店內支出'
    })
  } else {
    // 選擇特定付款方式（包含員工購物的對應方式）
    filteredByPaymentMethod = filteredPayments.filter(p => getBasePaymentMethod(p.payment_method) === selectedPaymentMethodTab.value)
  }

  // 計算總金額（直接加總，因為已經在上面篩選掉支出項目了）
  const totalAmount = filteredByPaymentMethod.reduce((sum, p) => sum + p.amount, 0)

  // 電子支付細分統計 (v3.19) - 使用未篩選付款方式的資料
  const jkopayPayments = filteredPayments.filter(p => p.payment_method === '電子支付-街口支付')
  const linepayPayments = filteredPayments.filter(p => p.payment_method === '電子支付-LINE PAY')
  const cardPayments = filteredPayments.filter(p => p.payment_method === '電子支付-刷卡')
  const tappayPayments = filteredPayments.filter(p => p.payment_method === '電子支付-TAP PAY')

  // 員工購物統計 (v3.19)
  const employeePurchases = filteredPayments.filter(p => p.payment_method.startsWith('員工購物-'))

  // 贈品/公關品統計 (v3.19)
  const giftPayments = filteredPayments.filter(p => p.amount === 0)
  const giftRecords = giftPayments.map(p => ({
    note: p.note || '',
    paid_at: p.paid_at,
    store_name: stores.value.find(s => s.id === p.store_id)?.name || '未知'
  }))

  dashboardStats.value = {
    totalPayments: filteredByPaymentMethod.length,
    totalAmount: totalAmount,
    pendingCount: filteredByPaymentMethod.filter(p => p.status === '未確認').length,
    confirmedCount: filteredByPaymentMethod.filter(p => p.status === '已入帳').length,
    rejectedCount: filteredByPaymentMethod.filter(p => p.status === '未入帳').length,
    // 電子支付細分 (v3.19)
    jkopayAmount: jkopayPayments.reduce((sum, p) => sum + p.amount, 0),
    linepayAmount: linepayPayments.reduce((sum, p) => sum + p.amount, 0),
    cardAmount: cardPayments.reduce((sum, p) => sum + p.amount, 0),
    tappayAmount: tappayPayments.reduce((sum, p) => sum + p.amount, 0),
    jkopayCount: jkopayPayments.length,
    linepayCount: linepayPayments.length,
    cardCount: cardPayments.length,
    tappayCount: tappayPayments.length,
    // 員工購物 (v3.19)
    employeePurchaseAmount: employeePurchases.reduce((sum, p) => sum + p.amount, 0),
    employeePurchaseCount: employeePurchases.length,
    employeeCashAmount: filteredPayments.filter(p => p.payment_method === '員工購物-現金').reduce((sum, p) => sum + p.amount, 0),
    employeeRemittanceAmount: filteredPayments.filter(p => p.payment_method === '員工購物-匯款').reduce((sum, p) => sum + p.amount, 0),
    employeeElectronicAmount: filteredPayments.filter(p => p.payment_method === '員工購物-電子支付').reduce((sum, p) => sum + p.amount, 0),
    // 贈品/公關品 (v3.19)
    giftCount: giftPayments.length,
    giftRecords
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

const updateEditedData = (uuid: string, field: string, value: unknown) => {
  if (!editedData.value[uuid]) {
    editedData.value[uuid] = {}
  }
  (editedData.value[uuid] as Record<string, unknown>)[field] = value
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
    // 🔒 清除認證標記（JWT Cookie 由後端清除）
    localStorage.removeItem('is_authenticated')
    router.push('/admin/login')
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
    // 驗證狀態值
    if (newStatus !== '未確認' && newStatus !== '已入帳' && newStatus !== '未入帳') {
      console.error('無效的狀態值:', newStatus)
      return
    }

    // 調用 API 更新狀態
    await paymentApi.update(uuid, { status: newStatus as '未確認' | '已入帳' | '未入帳' })
    
    // 重新載入數據以反映變更
    await loadPayments()
    
    // 重新載入統計數據
    await loadDashboardPayments()
    updateDashboardStats()
    
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

  // 🔒 安全性改進：密碼驗證移至後端
  if (!importPassword.value) {
    alert('請輸入密碼')
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

    // 🔒 傳送密碼至後端驗證
    const response = await paymentApi.bulkImport(payments, importPassword.value)
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
    
    
    const allDataResponse = await paymentApi.getPaginated(exportFilters)
    const allPayments = allDataResponse.data.data
    
    
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
    

    if (exportData.length === 0) {
      alert('沒有數據可以匯出')
      return
    }
    
    // 獲取分店名稱用於文件名（如果有篩選分店的話）
    let storeName = '全部分店'

    if (exportFilters.store_id) {
      const currentStore = stores.value.find(s => s.id === exportFilters.store_id)
      if (currentStore) {
        storeName = currentStore.name
      }
    }
    
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '收款記錄')
    
    // 生成包含分店名稱的文件名
    const dateString = getLocalDateString()
    const fileName = `payment-records_${storeName}_${dateString}.xlsx`
    
    XLSX.writeFile(workbook, fileName)
    
  } catch (error: any) {
    console.error('Export failed:', error)
    const errorMessage = error.response?.data?.message || '匯出失敗，請稍後再試'
    alert(errorMessage)
  }
}

// 自動刷新相關函數
// 🔒 內存洩漏修復：確保所有計時器都被正確追蹤和清理
const startAutoRefresh = () => {
  if (!autoRefreshEnabled.value) return

  // 先停止所有現有計時器
  stopAutoRefresh()

  lastRefreshTime.value = new Date()
  nextRefreshTime.value = new Date(Date.now() + refreshInterval.value)

  // 開始倒數計時（存儲引用以便清理）
  countdownTimerRef.value = setInterval(() => {
    if (!autoRefreshEnabled.value || !nextRefreshTime.value) {
      if (countdownTimerRef.value) {
        clearInterval(countdownTimerRef.value)
        countdownTimerRef.value = null
      }
      return
    }

    const now = new Date()
    const timeLeft = Math.max(0, Math.floor((nextRefreshTime.value.getTime() - now.getTime()) / 1000))
    refreshCountdown.value = timeLeft

    if (timeLeft === 0 && countdownTimerRef.value) {
      clearInterval(countdownTimerRef.value)
      countdownTimerRef.value = null
    }
  }, 1000)

  // 設定自動刷新
  refreshTimer.value = setTimeout(async () => {
    if (autoRefreshEnabled.value) {
      await refreshDashboardData()
      startAutoRefresh() // 重新開始下一輪
    }
  }, refreshInterval.value)
}

const stopAutoRefresh = () => {
  // 🔒 確保清理所有計時器
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    refreshTimer.value = null
  }
  if (countdownTimerRef.value) {
    clearInterval(countdownTimerRef.value)
    countdownTimerRef.value = null
  }
  refreshCountdown.value = 0
}

const manualRefresh = async () => {
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
    }
  } catch (error) {
    console.error('❌ 統計數據刷新失敗:', error)
  }
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
    await backupApi.downloadBackup(filename)
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

// formatFileSize 已從 composables 引入

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

// 清空數據
const executeClearData = async () => {
  if (clearDataLoading.value) return
  if (!clearDataConfirm.value || !clearDataPassword.value) return

  clearDataLoading.value = true
  try {
    const response = await adminApi.clearData(clearDataPassword.value)

    if (response.data.success) {
      const { deleted } = response.data
      alert(`數據清空完成！\n\n已刪除:\n- ${deleted.payments} 筆收款記錄\n- ${deleted.customer_orders} 筆客訂單\n- ${deleted.audit_logs} 筆審計日誌`)

      // 關閉對話框並重置狀態
      showClearDataModal.value = false
      clearDataPassword.value = ''
      clearDataConfirm.value = false

      // 重新載入頁面數據
      await loadPayments()
      await loadDashboardPayments()
      updateDashboardStats()
      updateDateStats()
      updateRangeStats()
    } else {
      alert('清空失敗：' + response.data.message)
    }
  } catch (error: any) {
    console.error('Clear data error:', error)
    const errorMessage = error.response?.data?.message || '清空數據失敗，請稍後再試'
    alert(errorMessage)
  } finally {
    clearDataLoading.value = false
  }
}

// 監聽器
watch(activeTab, async (newTab) => {
  if (newTab === 'dashboard') {
    // 切換到統計儀表板時重新載入所有數據和統計
    await loadDashboardPayments()
    updateDashboardStats()
    updateDateStats()
    updateRangeStats()
    
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