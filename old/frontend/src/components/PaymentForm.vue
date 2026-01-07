<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black flex items-center justify-center py-4 px-4 xs:px-3 sm:py-12 sm:px-6 lg:px-8 relative pt-safe-top pb-safe-bottom">
    <!-- ERP 背景網格 -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- 網格線 -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <!-- 掃描線效果 -->
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan-line"></div>
      </div>
      <!-- 科技感光暈 -->
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
      <!-- 數據流線條 -->
      <div class="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent opacity-40"></div>
      <div class="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-40"></div>
    </div>
    
    <!-- 用戶信息顯示 - 響應式版本 -->
    <div class="absolute top-4 right-4 xs:top-3 xs:right-3 flex items-center space-x-2 sm:space-x-4 z-50">
      <!-- 桌面版 -->
      <div class="hidden sm:flex items-center space-x-4">
        <button
          @click="goToAdmin"
          class="flex items-center space-x-2 bg-blue-600/90 hover:bg-blue-700 backdrop-blur-xl border border-blue-500/50 rounded-lg px-4 py-2 text-white text-sm font-medium transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>管理後台</span>
        </button>
        <button
          @click="goToOrders"
          class="flex items-center space-x-2 bg-emerald-600/90 hover:bg-emerald-700 backdrop-blur-xl border border-emerald-500/50 rounded-lg px-4 py-2 text-white text-sm font-medium transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span>客訂單管理</span>
        </button>
        <div class="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg px-4 py-2">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-300">登入用戶：</span>
            <span class="text-sm font-medium text-white">{{ currentUser || '未知' }}</span>
          </div>
        </div>
        <button
          @click="logout"
          class="flex items-center space-x-2 bg-red-600/90 hover:bg-red-700 backdrop-blur-xl border border-red-500/50 rounded-lg px-4 py-2 text-white text-sm font-medium transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>登出</span>
        </button>
      </div>
      
      <!-- 手機版 - 優化佈局防止重疊 -->
      <div class="sm:hidden">
        <div class="flex items-center justify-end space-x-1.5 xs:space-x-1 mb-2">
          <button
            @click="goToAdmin"
            class="flex items-center justify-center w-9 h-9 xs:w-10 xs:h-10 min-w-touch min-h-touch bg-slate-800/95 hover:bg-slate-700 backdrop-blur-xl border border-cyan-500/60 rounded-lg text-cyan-100 transition-all duration-200 hover:border-cyan-400/80 hover:shadow-lg hover:shadow-cyan-500/25 shadow-md"
            title="管理後台"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          <button
            @click="goToOrders"
            class="flex items-center justify-center w-9 h-9 xs:w-10 xs:h-10 min-w-touch min-h-touch bg-slate-800/95 hover:bg-emerald-700 backdrop-blur-xl border border-emerald-500/60 rounded-lg text-emerald-100 transition-all duration-200 hover:border-emerald-400/80 hover:shadow-lg hover:shadow-emerald-500/25 shadow-md"
            title="客訂單管理"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </button>
          <button
            @click="logout"
            class="flex items-center justify-center w-9 h-9 xs:w-10 xs:h-10 min-w-touch min-h-touch bg-slate-800/95 hover:bg-red-900/60 backdrop-blur-xl border border-red-500/60 rounded-lg text-red-200 transition-all duration-200 hover:border-red-400/80 hover:shadow-lg hover:shadow-red-500/25 shadow-md"
            title="登出"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
        <div class="flex items-center justify-end">
          <div class="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-xl border border-emerald-500/60 rounded-lg px-2.5 py-1.5 xs:px-2 xs:py-1 shadow-md">
            <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span class="text-xs xs:text-xs-mobile font-medium text-emerald-100">{{ currentUser || '未知' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="relative w-full max-w-7xl mx-auto px-4">

      <!-- 標題區域 - 緊湊版 -->
      <div class="text-center mb-4 mt-20 xs:mt-16 sm:mt-0">
        <h2 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent mb-1 tracking-wide">
          石頭人煙具付款系統
        </h2>
        <div class="text-xs text-cyan-400/70 font-mono tracking-wider">
          ERP PAYMENT MANAGEMENT SYSTEM v3.0
        </div>
      </div>

      <!-- 表單卡片 - 橫向佈局 -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 p-6 relative overflow-hidden">
        <!-- ERP 表單頂部狀態條 -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500"></div>
        
        <!-- 表單標題區域 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span class="text-emerald-300 font-mono text-xs tracking-wider">PAYMENT ENTRY FORM</span>
          </div>
          <div class="text-xs text-slate-400 font-mono">
            ID: {{ new Date().getTime().toString().slice(-6) }}
          </div>
        </div>

        <form @submit.prevent="submitPayment">
          <!-- 字段鎖定控制區 - 緊湊橫向 -->
          <div class="bg-slate-800/30 border border-slate-600/50 rounded-lg p-3 mb-4">
            <div class="flex items-center justify-between flex-wrap gap-x-4 gap-y-2">
              <div class="flex items-center space-x-2">
                <svg class="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span class="text-cyan-300 font-medium text-xs">字段鎖定</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-2">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    v-model="lockSettings.time"
                    type="checkbox"
                    class="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 w-3.5 h-3.5 flex-shrink-0"
                  />
                  <span class="text-xs text-gray-300">時間</span>
                </label>
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    v-model="lockSettings.paymentMethod"
                    type="checkbox"
                    class="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 w-3.5 h-3.5 flex-shrink-0"
                  />
                  <span class="text-xs text-gray-300">付款方式</span>
                </label>
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    v-model="lockSettings.amount"
                    type="checkbox"
                    class="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 w-3.5 h-3.5 flex-shrink-0"
                  />
                  <span class="text-xs text-gray-300">金額</span>
                </label>
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    v-model="lockSettings.store"
                    type="checkbox"
                    class="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 w-3.5 h-3.5 flex-shrink-0"
                  />
                  <span class="text-xs text-gray-300">分店</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 第一行：時間、付款方式、匯款後五碼、分店 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">

            <!-- 付款時間 -->
            <div class="space-y-1">
              <label for="paid_at" class="flex items-center space-x-1 text-xs font-medium text-gray-200">
                <span>付款時間</span>
                <svg v-if="lockSettings.time" class="w-2.5 h-2.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </label>
              <input
                id="paid_at"
                v-model="form.paid_at"
                type="datetime-local"
                required
                class="block w-full px-2 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            <!-- 付款方式 -->
            <div class="space-y-1">
              <label for="payment_method" class="flex items-center space-x-1 text-xs font-medium text-gray-200">
                <span>付款方式</span>
                <svg v-if="lockSettings.paymentMethod" class="w-2.5 h-2.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </label>
              <select
                id="payment_method"
                v-model="form.payment_method"
                required
                class="block w-full px-2 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-sm"
              >
                <option value="" disabled>請選擇</option>

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

            <!-- 匯款後五碼（當選擇匯款或員工購物-匯款時顯示） -->
            <div v-if="form.payment_method === '匯款' || form.payment_method === '員工購物-匯款'" class="space-y-1">
              <label for="last_five" class="block text-xs font-medium text-gray-200">
                匯款後五碼
              </label>
              <input
                id="last_five"
                v-model="form.last_five"
                type="text"
                :required="form.payment_method === '匯款'"
                maxlength="5"
                pattern="[0-9]{5}"
                class="block w-full px-2 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="請輸入後五碼"
              />
            </div>

            <!-- 分店選擇 -->
            <div class="space-y-1" v-if="stores.length > 0">
              <label for="store_id" class="flex items-center space-x-1 text-xs font-medium text-gray-200">
                <span>選擇分店</span>
                <svg v-if="lockSettings.store" class="w-2.5 h-2.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </label>
              <!-- 分店員工：顯示鎖定的分店 -->
              <div v-if="currentUserStoreId" class="block w-full px-2 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white text-sm">
                {{ getCurrentStoreName() }}
              </div>
              <!-- 總部用戶：可選擇分店 -->
              <select
                v-else
                id="store_id"
                v-model="form.store_id"
                required
                class="block w-full px-2 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-sm"
              >
                <option value="" disabled>請選擇</option>
                <option v-for="store in stores" :key="store.id" :value="store.id">
                  {{ store.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 第二行：付款金額（獨立一行，客訂單時隱藏） -->
          <div v-if="form.payment_method !== '客訂單'" class="mb-3">
            <label for="amount" class="flex items-center space-x-1 text-xs font-medium text-gray-200 mb-1">
              <span>付款金額</span>
              <svg v-if="lockSettings.amount" class="w-2.5 h-2.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </label>
            <input
              id="amount"
              v-model.number="form.amount"
              type="number"
              required
              min="0"
              class="block w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base font-medium"
              placeholder="請輸入金額（贈品/公關品可設為 0）"
            />

            <!-- 提領/店內支出提醒 -->
            <div v-if="showWithdrawalReminder" class="mt-3 bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-lg">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-blue-300">
                    💡 {{ form.payment_method === '提領' ? '提領' : '店內支出' }}操作提醒
                  </h3>
                  <div class="mt-2 text-sm text-blue-200">
                    <p class="font-semibold text-blue-100">請先確認以下事項：</p>
                    <ol class="list-decimal ml-5 mt-1 space-y-1">
                      <li>檢查管理後台的「<strong class="text-blue-100">當前店裡現金總額</strong>」是否正確</li>
                      <li>如系統餘額不正確，請先補登遺漏的現金收入（備註註明「修正金額」）</li>
                      <li>確認系統餘額正確後，再記錄{{ form.payment_method === '提領' ? '提領' : '店內支出' }}</li>
                    </ol>
                    <p class="mt-2 text-xs text-blue-300 border-t border-blue-700 pt-2">
                      ℹ️ 您可以到「管理後台」查看各分店的現金總額
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 備註區域（客訂單時隱藏） -->
          <div v-if="form.payment_method !== '客訂單'" class="mb-3">
            <label for="note" class="block text-xs font-medium text-gray-200 mb-1">
              備註 <span class="text-gray-400 text-xs">(選填，最多 1000 字)</span>
            </label>
            <textarea
              id="note"
              v-model="form.note"
              rows="2"
              maxlength="1000"
              class="block w-full px-2 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
              placeholder="請輸入備註資訊..."
            />
          </div>

          <!-- 客訂單專用表單（當選擇客訂單時顯示） -->
          <div v-if="form.payment_method === '客訂單'" class="space-y-4 xs:space-y-3 bg-slate-800/30 border border-slate-600/50 rounded-lg p-4 xs:p-3">
            <div class="flex items-center space-x-2 mb-3">
              <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="text-cyan-300 font-medium text-sm xs:text-sm-mobile">客訂單交付進度</span>
            </div>
            
            <!-- 商品清單 -->
            <div class="space-y-2 xs:space-y-1.5">
              <label class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
                商品清單 <span class="text-red-400">*</span>
              </label>
              <textarea
                v-model="orderForm.products"
                :required="form.payment_method === '客訂單'"
                rows="2"
                class="block w-full px-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-base xs:text-base-mobile sm:text-sm"
                placeholder="例如：Actitube 6mm 50pc，Actitube 7mm"
              />
            </div>
            
            <!-- 取件人資訊 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-3">
              <div class="space-y-2 xs:space-y-1.5">
                <label class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
                  取件名稱 <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="orderForm.customerName"
                  type="text"
                  :required="form.payment_method === '客訂單'"
                  class="block w-full px-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base xs:text-base-mobile sm:text-sm min-h-touch"
                  placeholder="請輸入取件人姓名"
                />
              </div>
              
              <div class="space-y-2 xs:space-y-1.5">
                <label class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
                  取件電話 <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="orderForm.customerPhone"
                  type="tel"
                  :required="form.payment_method === '客訂單'"
                  class="block w-full px-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base xs:text-base-mobile sm:text-sm min-h-touch"
                  placeholder="請輸入聯絡電話"
                />
              </div>
            </div>
            
            <!-- 付款狀況 -->
            <div class="space-y-2 xs:space-y-1.5">
              <label class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
                付款狀況
              </label>
              <select
                v-model="orderForm.paymentStatus"
                class="block w-full px-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-base xs:text-base-mobile sm:text-sm min-h-touch"
              >
                <option value="未付款">未付款</option>
                <option value="已付款">已付款</option>
              </select>
            </div>
            
            <!-- 物流貨號/店取 -->
            <div class="space-y-2 xs:space-y-1.5">
              <label class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
                物流貨號/店取
              </label>
              <input
                v-model="orderForm.logistics"
                type="text"
                class="block w-full px-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base xs:text-base-mobile sm:text-sm min-h-touch"
                placeholder="例如：全家 台中墩對店"
              />
            </div>
            
            <!-- 客訂單備註 -->
            <div class="space-y-2 xs:space-y-1.5">
              <label class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
                客訂單備註
              </label>
              <textarea
                v-model="orderForm.remarks"
                rows="2"
                class="block w-full px-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-base xs:text-base-mobile sm:text-sm"
                placeholder="例如：全家15310693084"
              />
            </div>
          </div>

          <!-- 提交按鈕與訊息 - 合併在一起 -->
          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-shrink-0 flex justify-center items-center py-2.5 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{
                isSubmitting
                  ? (form.payment_method === '客訂單' ? '建立中...' : '提交中...')
                  : (form.payment_method === '客訂單' ? '建立客訂單' : '提交付款資訊')
              }}
            </button>

            <!-- 訊息顯示 - 橫向排列 -->
            <div v-if="message" class="flex-1 flex items-center p-2.5 rounded-lg border-l-4 text-xs" :class="messageClass">
              <div class="flex-shrink-0">
                <svg v-if="messageClass.includes('green')" class="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <p class="ml-2 text-xs">{{ message }}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { paymentApi, storeApi, customerOrderApi, type PaymentData, type StoreData, type CustomerOrderData, getCurrentUserInfo } from '@/utils/api'

const router = useRouter()

const form = reactive<PaymentData>({
  paid_at: '',
  payment_method: '',
  last_five: '',
  amount: 0,
  note: '',
  store_id: undefined
})

// 客訂單專用表單資料
const orderForm = reactive({
  products: '',
  customerName: '',
  customerPhone: '',
  paymentStatus: '未付款' as '未付款' | '已付款',
  logistics: '',
  remarks: ''
})

const isSubmitting = ref(false)
const message = ref('')
const messageClass = ref('')
const currentUser = ref<string | null>(null)
const stores = ref<StoreData[]>([])
const currentUserStoreId = ref<number | null>(null)

// 字段鎖定設定
const lockSettings = reactive({
  time: false,
  paymentMethod: false,
  amount: false,
  store: false
})

// 用於保存鎖定的字段值
const lockedValues = reactive({
  paid_at: '',
  payment_method: '',
  amount: 0,
  store_id: undefined as number | undefined
})

// 顯示提領/店內支出提醒
const showWithdrawalReminder = ref<boolean>(false)

// 統一的台北時間格式化函數 (UTC+8)
const getTaipeiDateTimeString = (date?: Date) => {
  const targetDate = date || new Date()
  // 轉換為台北時間 (UTC+8)
  const taipeiDate = new Date(targetDate.getTime() + (8 * 60 * 60 * 1000))
  const year = taipeiDate.getUTCFullYear()
  const month = String(taipeiDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(taipeiDate.getUTCDate()).padStart(2, '0')
  const hours = String(taipeiDate.getUTCHours()).padStart(2, '0')
  const minutes = String(taipeiDate.getUTCMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}


const goToAdmin = () => {
  router.push('/admin')
}

const logout = async () => {
  try {
    // 導入adminApi
    const { adminApi } = await import('@/utils/api')
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

// 獲取當前用戶所屬分店名稱
const getCurrentStoreName = () => {
  if (!currentUserStoreId.value) return ''
  const store = stores.value.find(s => s.id === currentUserStoreId.value)
  return store ? `${store.name} (${store.code})` : ''
}

// 獲取當前選中的分店名稱
const getSelectedStoreName = () => {
  const targetStoreId = form.store_id || currentUserStoreId.value
  if (!targetStoreId) return ''
  const store = stores.value.find(s => s.id === targetStoreId)
  return store ? store.name : ''
}

// 監聽付款方式變化
watch(() => form.payment_method, (newMethod) => {
  if (newMethod === '提領') {
    // 自動設定為當前台北時間
    form.paid_at = getTaipeiDateTimeString()
    
    // 自動填入備註
    const storeName = getSelectedStoreName()
    const taipeiNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000))
    const month = taipeiNow.getUTCMonth() + 1
    const date = taipeiNow.getUTCDate()
    const amount = form.amount || 0
    
    if (storeName) {
      form.note = `${storeName}已於${month}月${date}號提領店內現金$${amount}`
    }
  }
})

// 監聽金額變化，更新提領備註
watch(() => form.amount, (newAmount) => {
  if (form.payment_method === '提領' && newAmount > 0) {
    const storeName = getSelectedStoreName()
    const taipeiNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000))
    const month = taipeiNow.getUTCMonth() + 1
    const date = taipeiNow.getUTCDate()
    
    if (storeName) {
      form.note = `${storeName}已於${month}月${date}號提領店內現金$${newAmount}`
    }
  }
})

// 監聽分店變化，更新提領備註
watch(() => form.store_id, (newStoreId) => {
  if (form.payment_method === '提領' && form.amount > 0) {
    const store = stores.value.find(s => s.id === newStoreId)
    if (store) {
      const taipeiNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000))
      const month = taipeiNow.getUTCMonth() + 1
      const date = taipeiNow.getUTCDate()

      form.note = `${store.name}已於${month}月${date}號提領店內現金$${form.amount}`
    }
  }
})

// 監聽付款方式變化，顯示提醒
watch(() => form.payment_method, (paymentMethod) => {
  // 當選擇「提領」或「店內支出」時顯示提醒
  showWithdrawalReminder.value = paymentMethod === '提領' || paymentMethod === '店內支出'
})

// 監聽鎖定設定變化，保存當前值
watch(() => lockSettings.time, (isLocked) => {
  if (isLocked) {
    lockedValues.paid_at = form.paid_at
  }
})

watch(() => lockSettings.paymentMethod, (isLocked) => {
  if (isLocked) {
    lockedValues.payment_method = form.payment_method
  }
})

watch(() => lockSettings.amount, (isLocked) => {
  if (isLocked) {
    lockedValues.amount = form.amount
  }
})

watch(() => lockSettings.store, (isLocked) => {
  if (isLocked) {
    lockedValues.store_id = form.store_id
  }
})

// 載入分店清單 - 根據用戶權限過濾
const loadStores = async () => {
  try {
    const response = await storeApi.getAll()
    let allStores = response.data
    
    // 🔒 根據用戶權限過濾分店
    const userInfo = await getCurrentUserInfo()
    if (userInfo) {
      // 管理員可以看到所有分店
      if (userInfo.role === 'admin') {
        stores.value = allStores
      } 
      // 如果用戶有 accessible_stores，只顯示有權限的分店
      else if (userInfo.accessible_stores && userInfo.accessible_stores.length > 0) {
        stores.value = allStores.filter(store => 
          userInfo.accessible_stores!.includes(store.id)
        )
      }
      // 如果用戶只有單一分店權限，只顯示該分店
      else if (userInfo.store_id) {
        stores.value = allStores.filter(store => store.id === userInfo.store_id)
      }
      // 如果沒有任何分店權限，顯示空列表
      else {
        stores.value = []
        console.warn('用戶沒有任何分店權限')
      }
    } else {
      stores.value = allStores // 備用邏輯
    }
  } catch (error) {
    console.error('Failed to load stores:', error)
    // 如果無法載入分店，根據當前用戶權限設定預設分店
    const userInfo = await getCurrentUserInfo()
    if (userInfo?.store_id) {
      // 只顯示用戶有權限的分店
      const defaultStores = [
        { id: 1, name: '大安店', code: 'DA', is_active: true, created_at: '', address: '', phone: '', manager: '' },
        { id: 2, name: '益民店', code: 'YM', is_active: true, created_at: '', address: '', phone: '', manager: '' },
        { id: 3, name: '逢甲店', code: 'FC', is_active: true, created_at: '', address: '', phone: '', manager: '' },
        { id: 4, name: '漢神店', code: 'HS', is_active: true, created_at: '', address: '', phone: '', manager: '' }
      ]
      
      if (userInfo.accessible_stores && userInfo.accessible_stores.length > 0) {
        stores.value = defaultStores.filter(store => 
          userInfo.accessible_stores!.includes(store.id)
        )
      } else if (userInfo.store_id) {
        stores.value = defaultStores.filter(store => store.id === userInfo.store_id)
      } else {
        stores.value = defaultStores // 管理員備用
      }
    } else {
      stores.value = [] // 沒有權限
    }
  }
}

// 初始化用戶資訊和表單
const initializeForm = async () => {
  try {
    // 設定預設日期為今天（使用台北時間）
    form.paid_at = getTaipeiDateTimeString()
    
    // 強制要求用戶登入
    try {
      const userInfo = await getCurrentUserInfo()
      if (userInfo) {
        currentUser.value = userInfo.username
        currentUserStoreId.value = userInfo.store_id || null
        
        // 如果用戶屬於特定分店，自動設定分店ID
        if (userInfo.store_id) {
          form.store_id = userInfo.store_id
        }
      } else {
        // 沒有用戶信息，重定向到登入頁面
        router.push('/admin/login')
        return
      }
    } catch (authError) {
      // 認證失敗，重定向到登入頁面
      console.log('Authentication failed, redirecting to login')
      router.push('/admin/login')
      return
    }
    
    // 載入分店清單
    await loadStores()
  } catch (error) {
    console.error('Failed to initialize form:', error)
  }
}

const submitPayment = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  message.value = ''
  
  try {
    // 客訂單使用新的 API 端點
    if (form.payment_method === '客訂單') {
      const customerOrderData: CustomerOrderData = {
        order_date: new Date().toLocaleDateString('zh-TW', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\//g, '/'),
        products: orderForm.products,
        customer_name: orderForm.customerName,
        customer_phone: orderForm.customerPhone,
        payment_status: orderForm.paymentStatus,
        logistics: orderForm.logistics,
        remarks: orderForm.remarks,
        store_id: form.store_id || currentUserStoreId.value || 1
      }
      
      console.log('Submitting customer order:', customerOrderData)
      
      const response = await customerOrderApi.create(customerOrderData)
      message.value = `客訂單已成功建立！訂單編號：${response.data.order.id}`
      messageClass.value = 'bg-green-900/20 border-l-green-500 text-green-300'
      
      // 保存當前鎖定字段的值
      if (lockSettings.time) lockedValues.paid_at = form.paid_at
      if (lockSettings.paymentMethod) lockedValues.payment_method = form.payment_method
      if (lockSettings.amount) lockedValues.amount = form.amount
      if (lockSettings.store) lockedValues.store_id = form.store_id

      // 重置表單，但保留鎖定的字段
      Object.assign(form, {
        paid_at: lockSettings.time ? lockedValues.paid_at : getTaipeiDateTimeString(),
        payment_method: lockSettings.paymentMethod ? lockedValues.payment_method : '',
        last_five: '',
        amount: lockSettings.amount ? lockedValues.amount : 0,
        note: '',
        store_id: lockSettings.store ? lockedValues.store_id : (currentUserStoreId.value || undefined)
      })
      
      // 重置客訂單表單
      Object.assign(orderForm, {
        products: '',
        customerName: '',
        customerPhone: '',
        paymentStatus: '未付款' as '未付款' | '已付款',
        logistics: '',
        remarks: ''
      })
      
      return
    }
    
    // 一般付款記錄的處理邏輯
    // 處理付款時間：統一使用台北時間 (UTC+8) 轉換為 ISO 格式
    let paidAtDate = ''
    if (form.payment_method === '提領') {
      // 提領使用當前台北時間
      const taipeiNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000))
      paidAtDate = new Date(taipeiNow.getTime() - (8 * 60 * 60 * 1000)).toISOString()
    } else {
      // 其他付款方式使用用戶選定的日期時間
      if (form.paid_at) {
        // form.paid_at 是 datetime-local 格式 (YYYY-MM-DDTHH:mm)
        // 假設輸入是台北時間，轉換為 UTC 再轉成 ISO 字符串
        const selectedDate = new Date(`${form.paid_at}:00+08:00`)
        paidAtDate = selectedDate.toISOString()
      } else {
        paidAtDate = ''
      }
    }
    
    const submitData = {
      ...form,
      paid_at: paidAtDate,
      store_id: form.store_id || currentUserStoreId.value || 1 // 預設第一個分店
    }
    
    console.log('Submitting payment data:', submitData)
    
    const response = await paymentApi.create(submitData)
    message.value = `付款資訊已成功提交！追蹤編號：${response.data.uuid}`
    messageClass.value = 'bg-green-900/20 border-l-green-500 text-green-300'
    
    // 保存當前鎖定字段的值
    if (lockSettings.time) lockedValues.paid_at = form.paid_at
    if (lockSettings.paymentMethod) lockedValues.payment_method = form.payment_method
    if (lockSettings.amount) lockedValues.amount = form.amount
    if (lockSettings.store) lockedValues.store_id = form.store_id

    // 重置表單，但保留鎖定的字段
    Object.assign(form, {
      paid_at: lockSettings.time ? lockedValues.paid_at : getTaipeiDateTimeString(), // 重置為今天日期（台北時間）
      payment_method: lockSettings.paymentMethod ? lockedValues.payment_method : '',
      last_five: '',
      amount: lockSettings.amount ? lockedValues.amount : 0,
      note: '',
      store_id: lockSettings.store ? lockedValues.store_id : (currentUserStoreId.value || undefined)
    })
    
  } catch (error: any) {
    console.error('Submit error:', error)
    
    // 顯示具體的驗證錯誤
    if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors.map((err: any) => err.message).join(', ')
      message.value = `驗證錯誤：${errorMessages}`
    } else {
      message.value = error.response?.data?.message || '提交失敗，請稍後再試'
    }
    messageClass.value = 'bg-red-900/20 border-l-red-500 text-red-300'
  } finally {
    isSubmitting.value = false
  }
}

const goToOrders = () => {
  router.push('/admin/customer-orders')
}

onMounted(() => {
  initializeForm()
})
</script>