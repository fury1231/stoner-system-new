<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black flex items-center justify-center py-4 px-4 xs:px-3 sm:py-12 sm:px-6 lg:px-8 relative pt-safe-top pb-safe-bottom">
    <!-- 背景效果 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
    </div>

    <!-- 頂部導航列 -->
    <div class="absolute top-4 right-4 xs:top-3 xs:right-3 flex items-center space-x-2 sm:space-x-3 z-50">
      <!-- 桌面版 -->
      <div class="hidden sm:flex items-center space-x-3">
        <button class="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-cyan-300 transition-colors" title="管理後台" @click="goToAdmin">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
        <button class="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-emerald-300 transition-colors" title="客訂單" @click="goToOrders">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </button>
        <div class="flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
          <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span class="text-sm text-slate-300">{{ currentUser }}</span>
        </div>
        <button class="p-2 bg-slate-800/80 hover:bg-red-900/50 border border-slate-600 hover:border-red-500/50 rounded-lg text-slate-400 hover:text-red-300 transition-colors" title="登出" @click="logout">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>

      <!-- 手機版 -->
      <div class="sm:hidden flex items-center space-x-1.5">
        <button class="p-2.5 bg-slate-800/90 border border-cyan-500/50 rounded-lg text-cyan-200" title="管理後台" @click="goToAdmin">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
        <button class="p-2.5 bg-slate-800/90 border border-emerald-500/50 rounded-lg text-emerald-200" title="客訂單" @click="goToOrders">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </button>
        <button class="p-2.5 bg-slate-800/90 border border-red-500/50 rounded-lg text-red-200" title="登出" @click="logout">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 主表單區域 -->
    <div class="relative w-full max-w-lg mx-auto flex flex-col" style="max-height: calc(100vh - 2rem); max-height: calc(100dvh - 2rem);">
      <!-- 標題 -->
      <div class="text-center mb-4 mt-16 sm:mt-0 flex-shrink-0">
        <p class="text-[10px] text-cyan-400/70 tracking-[0.2em] uppercase">Stonersmokeshop</p>
        <h1 class="text-sm sm:text-base font-light tracking-[0.25em] text-slate-300 uppercase">Payment System</h1>
        <p class="text-[10px] text-slate-600 tracking-widest">v4.0</p>
      </div>

      <!-- 表單卡片 -->
      <div class="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-visible flex flex-col flex-1 min-h-0">

        <!-- 表單內容 -->
        <div class="flex-1 min-h-0">
        <!-- 字段鎖定控制 -->
        <div class="px-6 pt-4 pb-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-1.5 text-xs text-slate-400">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>連續輸入鎖定</span>
            </div>
            <div class="flex items-center space-x-3">
              <label class="flex items-center space-x-1 cursor-pointer group">
                <input v-model="lockSettings.time" type="checkbox" class="sr-only peer" />
                <div class="w-7 h-4 bg-slate-700 rounded-full peer-checked:bg-cyan-500 transition-colors relative">
                  <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-slate-400 rounded-full peer-checked:translate-x-3 peer-checked:bg-white transition-all"></div>
                </div>
                <span class="text-xs text-slate-400 group-hover:text-slate-300" :class="{ 'text-cyan-400': lockSettings.time }">時間</span>
              </label>
              <label class="flex items-center space-x-1 cursor-pointer group">
                <input v-model="lockSettings.paymentMethod" type="checkbox" class="sr-only peer" />
                <div class="w-7 h-4 bg-slate-700 rounded-full peer-checked:bg-cyan-500 transition-colors relative">
                  <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-slate-400 rounded-full peer-checked:translate-x-3 peer-checked:bg-white transition-all"></div>
                </div>
                <span class="text-xs text-slate-400 group-hover:text-slate-300" :class="{ 'text-cyan-400': lockSettings.paymentMethod }">付款方式</span>
              </label>
              <label class="flex items-center space-x-1 cursor-pointer group">
                <input v-model="lockSettings.amount" type="checkbox" class="sr-only peer" />
                <div class="w-7 h-4 bg-slate-700 rounded-full peer-checked:bg-cyan-500 transition-colors relative">
                  <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-slate-400 rounded-full peer-checked:translate-x-3 peer-checked:bg-white transition-all"></div>
                </div>
                <span class="text-xs text-slate-400 group-hover:text-slate-300" :class="{ 'text-cyan-400': lockSettings.amount }">金額</span>
              </label>
              <label class="flex items-center space-x-1 cursor-pointer group">
                <input v-model="lockSettings.store" type="checkbox" class="sr-only peer" />
                <div class="w-7 h-4 bg-slate-700 rounded-full peer-checked:bg-cyan-500 transition-colors relative">
                  <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-slate-400 rounded-full peer-checked:translate-x-3 peer-checked:bg-white transition-all"></div>
                </div>
                <span class="text-xs text-slate-400 group-hover:text-slate-300" :class="{ 'text-cyan-400': lockSettings.store }">分店</span>
              </label>
            </div>
          </div>
          <p v-if="hasAnyLock" class="text-[10px] text-cyan-400/70 mt-1.5">🔒 鎖定的欄位在提交後會保留原值</p>
        </div>

        <!-- 付款方式選擇（先選付款方式） -->
        <div class="px-6 pt-2 pb-3 relative">
          <label class="text-sm text-slate-400 mb-2 block">付款方式</label>

          <!-- 主要付款方式按鈕（收入類） -->
          <div class="grid grid-cols-4 gap-1.5 mb-1.5 relative">
            <div
              v-for="method in primaryMethods"
              :key="method.value"
              class="relative"
              @mouseenter="handleMethodHover(method.value, true)"
              @mouseleave="handleMethodHover(method.value, false)"
            >
              <button
                type="button"
                :class="[
                  'w-full py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200',
                  (method.value === 'electronic' ? isElectronicSelected : method.value === 'employee' ? isEmployeeSelected : form.payment_method === method.value)
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : (method.value === 'electronic' && showElectronicMenu) || (method.value === 'employee' && showEmployeeMenu)
                      ? 'bg-slate-700 text-white border border-cyan-500/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                ]"
                @click="handlePrimaryMethodClick(method.value)"
              >
                <div class="text-base">{{ method.icon }}</div>
                <div class="text-[10px]">{{ method.label }}</div>
              </button>

              <!-- 電子支付浮動下拉選單 -->
              <div
                v-if="method.value === 'electronic' && showElectronicMenu"
                class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 bg-slate-800 border border-cyan-500/50 rounded-xl shadow-xl shadow-black/50 p-2 min-w-[200px]"
                @mouseenter="handleMethodHover('electronic', true)"
                @mouseleave="handleMethodHover('electronic', false)"
              >
                <div class="grid grid-cols-2 gap-1.5">
                  <button
                    v-for="sub in electronicMethods"
                    :key="sub.value"
                    type="button"
                    :class="[
                      'py-2 px-2 rounded-lg text-xs font-medium transition-all',
                      form.payment_method === sub.value
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    ]"
                    @click="selectPaymentMethod(sub.value)"
                  >
                    <span class="mr-1">{{ sub.icon }}</span>{{ sub.label }}
                  </button>
                </div>
              </div>

              <!-- 員工購物浮動下拉選單 -->
              <div
                v-if="method.value === 'employee' && showEmployeeMenu"
                class="absolute top-full right-0 mt-1 z-20 bg-slate-800 border border-amber-500/50 rounded-xl shadow-xl shadow-black/50 p-2 min-w-[180px]"
                @mouseenter="handleMethodHover('employee', true)"
                @mouseleave="handleMethodHover('employee', false)"
              >
                <div class="grid grid-cols-1 gap-1.5">
                  <button
                    v-for="sub in employeeMethods"
                    :key="sub.value"
                    type="button"
                    :class="[
                      'py-2 px-3 rounded-lg text-xs font-medium transition-all text-left',
                      form.payment_method === sub.value
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    ]"
                    @click="selectPaymentMethod(sub.value)"
                  >
                    <span class="mr-1">{{ sub.icon }}</span>{{ sub.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 次要付款方式按鈕（客訂單、支出類） -->
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="method in secondaryMethods"
              :key="method.value"
              type="button"
              :class="[
                'py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200',
                form.payment_method === method.value
                  ? (method.value === '店內支出' || method.value === '提領' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30')
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 border border-slate-700'
              ]"
              @click="selectPaymentMethod(method.value)"
            >
              <div class="text-base">{{ method.icon }}</div>
              <div class="text-[10px]">{{ method.label }}</div>
            </button>
          </div>
        </div>

        <!-- 金額輸入區（再輸入金額） -->
        <div class="px-6 sm:px-8 py-4">
          <div
            class="relative p-6 rounded-2xl transition-all duration-300"
            :class="[
              form.amount > 0
                ? 'bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 border-2 border-dashed border-slate-600 hover:border-slate-500'
            ]"
          >
            <label class="text-xs text-slate-400 mb-1 block text-center uppercase tracking-wider">輸入金額</label>
            <div class="relative flex items-center justify-center">
              <span
                class="text-3xl sm:text-4xl mr-2 transition-colors"
                :class="form.amount > 0 ? 'text-emerald-400' : 'text-slate-500'"
              >$</span>
              <input
                v-model.number="form.amount"
                type="number"
                inputmode="numeric"
                min="0"
                placeholder="0"
                class="w-48 text-center text-5xl sm:text-6xl font-bold bg-transparent border-none placeholder-slate-600 focus:outline-none focus:ring-0 no-spinner"
                :class="form.amount > 0 ? 'text-emerald-400' : 'text-white'"
              />
            </div>
            <p v-if="form.amount === 0" class="text-xs text-slate-500 mt-2 text-center">金額為 0 = 贈品/公關品</p>
            <p v-else class="text-xs text-emerald-400/70 mt-2 text-center">NT$ {{ form.amount.toLocaleString() }}</p>
          </div>
        </div>

        <!-- 點擊其他地方關閉下拉選單的遮罩 -->
        <div
          v-if="showElectronicMenu || showEmployeeMenu"
          class="fixed inset-0 z-10"
          @click="closeAllMenus"
        ></div>

        <!-- 匯款後五碼（條件顯示） -->
        <div v-if="needsLastFive" class="px-6 pb-4">
          <label class="text-sm text-slate-400 mb-2 block">匯款後五碼</label>
          <input
            v-model="form.last_five"
            type="text"
            inputmode="numeric"
            maxlength="5"
            pattern="[0-9]{5}"
            placeholder="請輸入後五碼"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center text-lg tracking-widest"
          />
        </div>

        <!-- 分店 + 日期時間（單行） -->
        <div class="px-6 pb-3">
          <div class="flex items-center gap-3">
            <!-- 分店選擇 -->
            <div v-if="stores.length > 1" class="flex items-center gap-1 flex-1">
              <button type="button" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-600" @click="prevStore">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <div class="flex-1 text-center">
                <span class="text-[10px] text-slate-500 block">🏪</span>
                <span class="text-sm font-medium text-white">{{ getSelectedStoreName() || '未選擇' }}</span>
              </div>
              <button type="button" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-600" @click="nextStore">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            <!-- 分隔線 -->
            <div v-if="stores.length > 1" class="w-px h-10 bg-slate-700"></div>

            <!-- 時間選擇 -->
            <div class="flex items-center gap-1 flex-1">
              <button type="button" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-600" @click="adjustHour(-1)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <div class="flex-1 text-center">
                <span class="text-[10px] text-slate-500 block">{{ currentDateDisplay }}</span>
                <span class="text-sm font-medium text-white">{{ currentHour }}:{{ currentMinute }}</span>
              </div>
              <button type="button" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-600" @click="adjustHour(1)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <!-- 日期快捷按鈕 -->
          <div class="flex justify-center gap-1.5 mt-2">
            <button type="button" class="px-2.5 py-1 text-[10px] rounded-md transition-all" :class="isToday ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'" @click="setDateToday">今天</button>
            <button type="button" class="px-2.5 py-1 text-[10px] rounded-md transition-all" :class="isYesterday ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'" @click="setDateYesterday">昨天</button>
            <button type="button" class="px-2.5 py-1 text-[10px] rounded-md transition-all" :class="isDayBefore ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'" @click="setDateDayBefore">前天</button>
            <button type="button" class="px-2.5 py-1 text-[10px] rounded-md transition-all" :class="isOtherDate ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'" @click="showDatePicker = !showDatePicker">其他</button>
            <button type="button" class="px-1.5 py-1 text-[10px] rounded-md bg-slate-800 text-slate-400 hover:bg-slate-700" @click="adjustMinute(-5)">-5</button>
            <button type="button" class="px-1.5 py-1 text-[10px] rounded-md bg-slate-800 text-slate-400 hover:bg-slate-700" @click="adjustMinute(-1)">-1</button>
            <button type="button" class="px-1.5 py-1 text-[10px] rounded-md bg-slate-800 text-slate-400 hover:bg-slate-700" @click="adjustMinute(1)">+1</button>
            <button type="button" class="px-1.5 py-1 text-[10px] rounded-md bg-slate-800 text-slate-400 hover:bg-slate-700" @click="adjustMinute(5)">+5</button>
          </div>

          <!-- 其他日期選擇器 -->
          <div v-if="showDatePicker" class="flex justify-center mt-2">
            <input type="date" :value="currentDateValue" class="px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500" @change="updateDate($event)" />
          </div>
        </div>

        <!-- 備註 + 提醒 -->
        <div class="px-6 pb-3">
          <input
            v-model="form.note"
            type="text"
            maxlength="1000"
            placeholder="備註（選填）"
            class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
          <!-- 提領/店內支出提醒 -->
          <div v-if="showWithdrawalReminder" class="mt-2 p-2 bg-amber-900/30 border border-amber-500/30 rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span class="text-amber-300 text-xs">{{ form.payment_method }}：請先確認「當前店裡現金總額」</span>
          </div>
        </div>

        </div>
        <!-- 結束可滾動區域 -->

        <!-- 提交按鈕區（固定在底部） -->
        <div class="flex-shrink-0 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm p-3 sm:p-4">
          <!-- 訊息顯示 -->
          <div v-if="message && form.payment_method !== '客訂單'" class="mb-2">
            <div :class="['p-2 rounded-lg text-xs flex items-center gap-2', messageClass.includes('green') ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-300' : 'bg-red-900/30 border border-red-500/30 text-red-300']">
              <span v-if="messageClass.includes('green')">✓</span><span v-else>✕</span>
              <span>{{ message }}</span>
            </div>
          </div>
          <!-- 金額為 0 提示 -->
          <div v-if="form.amount === 0 && form.payment_method && !message" class="mb-2 p-2 bg-amber-900/30 border border-amber-500/30 rounded-lg flex items-center gap-2">
            <span class="text-amber-400">🎁</span>
            <span class="text-amber-300 text-xs">金額為 0，記錄為贈品/公關品</span>
          </div>
          <button
            :disabled="isSubmitting || !isFormValid"
            class="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isFormValid ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30 active:scale-[0.98]' : 'bg-slate-700 text-slate-400'"
            @click="submitPayment"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              提交中...
            </span>
            <span v-else>確認提交</span>
          </button>
        </div>
      </div>

      <!-- 客訂單專用表單 Modal -->
      <div v-if="form.payment_method === '客訂單'" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
            <h3 class="font-bold text-white">📋 新增客訂單</h3>
            <button class="text-slate-400 hover:text-white" @click="form.payment_method = ''">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-4 space-y-4">
            <div>
              <label class="text-sm text-slate-400 mb-1 block">商品清單 *</label>
              <textarea
                v-model="orderForm.products"
                rows="2"
                required
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="例如：Actitube 6mm 50pc"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-slate-400 mb-1 block">取件名稱 *</label>
                <input
                  v-model="orderForm.customerName"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="姓名"
                />
              </div>
              <div>
                <label class="text-sm text-slate-400 mb-1 block">取件電話 *</label>
                <input
                  v-model="orderForm.customerPhone"
                  type="tel"
                  required
                  class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="電話"
                />
              </div>
            </div>

            <div>
              <label class="text-sm text-slate-400 mb-1 block">付款狀況</label>
              <select
                v-model="orderForm.paymentStatus"
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="未付款">未付款</option>
                <option value="已付款">已付款</option>
              </select>
            </div>

            <div>
              <label class="text-sm text-slate-400 mb-1 block">物流貨號/店取</label>
              <input
                v-model="orderForm.logistics"
                type="text"
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="例如：全家 台中墩對店"
              />
            </div>

            <div>
              <label class="text-sm text-slate-400 mb-1 block">備註</label>
              <textarea
                v-model="orderForm.remarks"
                rows="2"
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="選填"
              ></textarea>
            </div>
          </div>

          <div class="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 space-y-3">
            <!-- 客訂單訊息顯示 -->
            <div
v-if="message && form.payment_method === '客訂單'"
              :class="[
                'p-3 rounded-xl text-sm flex items-center space-x-2',
                messageClass.includes('green') ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-300' : 'bg-red-900/30 border border-red-500/30 text-red-300'
              ]"
            >
              <span v-if="messageClass.includes('green')">✓</span>
              <span v-else>✕</span>
              <span>{{ message }}</span>
            </div>
            <button
              :disabled="isSubmitting || !orderForm.products || !orderForm.customerName || !orderForm.customerPhone"
              class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              @click="submitPayment"
            >
              {{ isSubmitting ? '建立中...' : '建立客訂單' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 金額為 0 確認對話框 -->
    <div v-if="showZeroAmountConfirm" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-sm p-6 shadow-xl shadow-amber-500/10">
        <div class="text-center mb-6">
          <div class="text-5xl mb-3">🎁</div>
          <h3 class="text-xl font-bold text-white mb-2">確定金額為 $0？</h3>
          <p class="text-slate-400 text-sm">金額為 0 將記錄為贈品/公關品</p>
        </div>
        <div class="flex gap-3">
          <button
            class="flex-1 py-3 rounded-xl font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            @click="showZeroAmountConfirm = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
            @click="doSubmitPayment"
          >
            確定提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { paymentApi, storeApi, customerOrderApi, type PaymentData, type StoreData, type CustomerOrderData, getCurrentUserInfo } from '@/utils/api'

const router = useRouter()

// 付款方式定義
const primaryMethods = [
  { value: '現金', label: '現金', icon: '💵' },
  { value: '匯款', label: '匯款', icon: '🏦' },
  { value: 'electronic', label: '電子支付', icon: '📱' },
  { value: 'employee', label: '員工購物', icon: '👤' },
]

const secondaryMethods = [
  { value: '客訂單', label: '客訂單', icon: '📦' },
  { value: '店內支出', label: '店內支出', icon: '🧾' },
  { value: '提領', label: '提領', icon: '💰' },
]

const electronicMethods = [
  { value: '電子支付-街口支付', label: '街口', icon: '🟠' },
  { value: '電子支付-LINE PAY', label: 'LINE', icon: '💚' },
  { value: '電子支付-刷卡', label: '刷卡', icon: '💳' },
  { value: '電子支付-TAP PAY', label: 'TapPay', icon: '📲' },
]

const employeeMethods = [
  { value: '員工購物-現金', label: '現金', icon: '💵' },
  { value: '員工購物-匯款', label: '匯款', icon: '🏦' },
  { value: '員工購物-電子支付', label: '電子支付', icon: '📱' },
]

// 狀態
const form = reactive<PaymentData>({
  paid_at: '',
  payment_method: '',
  last_five: '',
  amount: 0,
  note: '',
  store_id: undefined
})

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

// UI 狀態
const showDatePicker = ref(false)
const showElectronicMenu = ref(false)
const showEmployeeMenu = ref(false)
const showZeroAmountConfirm = ref(false)
const showWithdrawalReminder = computed(() =>
  form.payment_method === '提領' || form.payment_method === '店內支出'
)

// 判斷是否選擇了電子支付類別
const isElectronicSelected = computed(() =>
  form.payment_method.startsWith('電子支付-')
)

// 判斷是否選擇了員工購物類別
const isEmployeeSelected = computed(() =>
  form.payment_method.startsWith('員工購物-')
)

// 是否有任何鎖定
const hasAnyLock = computed(() =>
  lockSettings.time || lockSettings.paymentMethod || lockSettings.amount || lockSettings.store
)

// 時間相關計算屬性
const parsedTime = computed(() => {
  if (!form.paid_at) return new Date()
  return new Date(`${form.paid_at}:00+08:00`)
})

const currentHour = computed(() => {
  const h = parsedTime.value.getHours()
  return String(h).padStart(2, '0')
})

const currentMinute = computed(() => {
  const m = parsedTime.value.getMinutes()
  return String(m).padStart(2, '0')
})

const currentDateDisplay = computed(() => {
  const date = parsedTime.value
  const now = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return `${month}/${day} (今天)`
  if (isYesterday) return `${month}/${day} (昨天)`
  return `${month}/${day}`
})

const currentDateValue = computed(() => {
  const date = parsedTime.value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// 日期判斷
const isToday = computed(() => {
  const now = new Date()
  return parsedTime.value.toDateString() === now.toDateString()
})

const isYesterday = computed(() => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return parsedTime.value.toDateString() === yesterday.toDateString()
})

const isDayBefore = computed(() => {
  const dayBefore = new Date()
  dayBefore.setDate(dayBefore.getDate() - 2)
  return parsedTime.value.toDateString() === dayBefore.toDateString()
})

const isOtherDate = computed(() => {
  return !isToday.value && !isYesterday.value && !isDayBefore.value
})

const toggleElectronicMenu = () => {
  showElectronicMenu.value = !showElectronicMenu.value
  showEmployeeMenu.value = false
}

const toggleEmployeeMenu = () => {
  showEmployeeMenu.value = !showEmployeeMenu.value
  showElectronicMenu.value = false
}

const closeAllMenus = () => {
  showElectronicMenu.value = false
  showEmployeeMenu.value = false
}

// 分店切換
const prevStore = () => {
  if (stores.value.length <= 1) return
  const currentIndex = stores.value.findIndex(s => s.id === form.store_id)
  const prevIndex = currentIndex <= 0 ? stores.value.length - 1 : currentIndex - 1
  form.store_id = stores.value[prevIndex].id
}

const nextStore = () => {
  if (stores.value.length <= 1) return
  const currentIndex = stores.value.findIndex(s => s.id === form.store_id)
  const nextIndex = currentIndex >= stores.value.length - 1 ? 0 : currentIndex + 1
  form.store_id = stores.value[nextIndex].id
}

// 日期快捷設定
const setDateToday = () => {
  const now = new Date()
  const current = parsedTime.value
  now.setHours(current.getHours(), current.getMinutes())
  form.paid_at = getTaipeiDateTimeString(now)
  showDatePicker.value = false
}

const setDateYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const current = parsedTime.value
  yesterday.setHours(current.getHours(), current.getMinutes())
  form.paid_at = getTaipeiDateTimeString(yesterday)
  showDatePicker.value = false
}

const setDateDayBefore = () => {
  const dayBefore = new Date()
  dayBefore.setDate(dayBefore.getDate() - 2)
  const current = parsedTime.value
  dayBefore.setHours(current.getHours(), current.getMinutes())
  form.paid_at = getTaipeiDateTimeString(dayBefore)
  showDatePicker.value = false
}

// 時間精確調整
const adjustHour = (delta: number) => {
  const current = new Date(parsedTime.value.getTime())
  current.setHours(current.getHours() + delta)
  form.paid_at = getTaipeiDateTimeString(current)
}

const adjustMinute = (delta: number) => {
  const current = new Date(parsedTime.value.getTime())
  current.setMinutes(current.getMinutes() + delta)
  form.paid_at = getTaipeiDateTimeString(current)
}

const updateDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newDate = new Date(target.value)
  const current = parsedTime.value
  newDate.setHours(current.getHours(), current.getMinutes())
  form.paid_at = getTaipeiDateTimeString(newDate)
  showDatePicker.value = false
}

// Hover 延遲計時器
let hoverTimeout: ReturnType<typeof setTimeout> | null = null

// 處理 hover 顯示子選單
const handleMethodHover = (value: string, isEntering: boolean) => {
  // 清除之前的計時器
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }

  if (isEntering) {
    // 滑鼠進入：立即顯示
    if (value === 'electronic') {
      showElectronicMenu.value = true
      showEmployeeMenu.value = false
    } else if (value === 'employee') {
      showEmployeeMenu.value = true
      showElectronicMenu.value = false
    }
  } else {
    // 滑鼠離開：延遲關閉（給使用者時間移到子選單）
    hoverTimeout = setTimeout(() => {
      if (value === 'electronic') {
        showElectronicMenu.value = false
      } else if (value === 'employee') {
        showEmployeeMenu.value = false
      }
    }, 150)
  }
}

// 處理主要付款方式按鈕點擊（手機用）
const handlePrimaryMethodClick = (value: string) => {
  if (value === 'electronic') {
    // 點擊電子支付：展開子選單，清除非電子支付的選擇
    if (!isElectronicSelected.value) {
      form.payment_method = '' // 清除之前的選擇
    }
    toggleElectronicMenu()
  } else if (value === 'employee') {
    // 點擊員工購物：展開子選單，清除非員工購物的選擇
    if (!isEmployeeSelected.value) {
      form.payment_method = ''
    }
    toggleEmployeeMenu()
  } else {
    // 其他直接選擇的付款方式
    selectPaymentMethod(value)
  }
}

// 字段鎖定設定
const lockSettings = reactive({
  time: false,
  paymentMethod: false,
  amount: false,
  store: false
})

const lockedValues = reactive({
  paid_at: '',
  payment_method: '',
  amount: 0,
  store_id: undefined as number | undefined
})

// 計算屬性
const needsLastFive = computed(() =>
  form.payment_method === '匯款' || form.payment_method === '員工購物-匯款'
)

const isFormValid = computed(() => {
  if (!form.payment_method) return false
  if (form.payment_method === '客訂單') return true
  if (needsLastFive.value && (!form.last_five || !/^\d{5}$/.test(form.last_five))) return false
  return true
})

// 方法
const getTaipeiDateTimeString = (date?: Date) => {
  const targetDate = date || new Date()
  const taipeiDate = new Date(targetDate.getTime() + (8 * 60 * 60 * 1000))
  const year = taipeiDate.getUTCFullYear()
  const month = String(taipeiDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(taipeiDate.getUTCDate()).padStart(2, '0')
  const hours = String(taipeiDate.getUTCHours()).padStart(2, '0')
  const minutes = String(taipeiDate.getUTCMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const getSelectedStoreName = () => {
  const targetStoreId = form.store_id || currentUserStoreId.value
  if (!targetStoreId) return ''
  const store = stores.value.find(s => s.id === targetStoreId)
  return store ? store.name : ''
}

const selectPaymentMethod = (method: string) => {
  form.payment_method = method
  // 選擇電子支付後保持子選單展開
  if (method.startsWith('電子支付-')) {
    showElectronicMenu.value = true
    showEmployeeMenu.value = false
  } else if (method.startsWith('員工購物-')) {
    showEmployeeMenu.value = true
    showElectronicMenu.value = false
  } else {
    showElectronicMenu.value = false
    showEmployeeMenu.value = false
  }
}

const goToAdmin = () => router.push('/admin')
const goToOrders = () => router.push('/admin/customer-orders')

const logout = async () => {
  try {
    const { adminApi } = await import('@/utils/api')
    await adminApi.logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // 🔒 清除認證標記（JWT Cookie 由後端清除）
    localStorage.removeItem('is_authenticated')
    router.push('/admin/login')
  }
}

const loadStores = async () => {
  try {
    const response = await storeApi.getAll()
    const allStores = response.data
    const userInfo = await getCurrentUserInfo()

    if (userInfo) {
      if (userInfo.role === 'admin') {
        stores.value = allStores
      } else if (userInfo.accessible_stores?.length) {
        stores.value = allStores.filter(store => userInfo.accessible_stores!.includes(store.id))
      } else if (userInfo.store_id) {
        stores.value = allStores.filter(store => store.id === userInfo.store_id)
      } else {
        stores.value = []
      }
    } else {
      stores.value = allStores
    }
  } catch (error) {
    console.error('Failed to load stores:', error)
    stores.value = []
  }
}

const initializeForm = async () => {
  form.paid_at = getTaipeiDateTimeString()

  try {
    const userInfo = await getCurrentUserInfo()
    if (userInfo) {
      currentUser.value = userInfo.username
      currentUserStoreId.value = userInfo.store_id || null
    } else {
      router.push('/admin/login')
      return
    }
  } catch {
    router.push('/admin/login')
    return
  }

  await loadStores()

  // 確保分店有預設值（第一個可用分店）
  if (!form.store_id && stores.value.length > 0) {
    form.store_id = stores.value[0].id
  }
}

const submitPayment = async () => {
  if (isSubmitting.value) return

  // 金額為 0 時顯示確認對話框（客訂單除外）
  if (form.amount === 0 && form.payment_method !== '客訂單') {
    showZeroAmountConfirm.value = true
    return
  }

  await doSubmitPayment()
}

// 實際執行提交
const doSubmitPayment = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  message.value = ''
  showZeroAmountConfirm.value = false

  try {
    if (form.payment_method === '客訂單') {
      const customerOrderData: CustomerOrderData = {
        order_date: new Date().toLocaleDateString('zh-TW', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).replace(/\//g, '/'),
        products: orderForm.products,
        customer_name: orderForm.customerName,
        customer_phone: orderForm.customerPhone,
        payment_status: orderForm.paymentStatus,
        logistics: orderForm.logistics,
        remarks: orderForm.remarks,
        store_id: form.store_id || currentUserStoreId.value || 1
      }

      const response = await customerOrderApi.create(customerOrderData)
      message.value = `客訂單已建立！編號：${response.data.order.id}`
      messageClass.value = 'green'

      // 重置客訂單表單
      Object.assign(orderForm, {
        products: '', customerName: '', customerPhone: '',
        paymentStatus: '未付款', logistics: '', remarks: ''
      })
      form.payment_method = ''
      return
    }

    // 一般付款處理
    let paidAtDate = ''
    if (form.paid_at) {
      const selectedDate = new Date(`${form.paid_at}:00+08:00`)
      paidAtDate = selectedDate.toISOString()
    }

    const submitData = {
      ...form,
      paid_at: paidAtDate,
      store_id: form.store_id || currentUserStoreId.value || 1
    }

    const response = await paymentApi.create(submitData)
    message.value = `提交成功！追蹤編號：${response.data.uuid.slice(-8)}`
    messageClass.value = 'green'

    // 保存鎖定值
    if (lockSettings.time) lockedValues.paid_at = form.paid_at
    if (lockSettings.paymentMethod) lockedValues.payment_method = form.payment_method
    if (lockSettings.amount) lockedValues.amount = form.amount
    if (lockSettings.store) lockedValues.store_id = form.store_id

    // 重置表單
    const defaultStoreId = currentUserStoreId.value || (stores.value.length > 0 ? stores.value[0].id : undefined)
    Object.assign(form, {
      paid_at: lockSettings.time ? lockedValues.paid_at : getTaipeiDateTimeString(),
      payment_method: lockSettings.paymentMethod ? lockedValues.payment_method : '',
      last_five: '',
      amount: lockSettings.amount ? lockedValues.amount : 0,
      note: '',
      store_id: lockSettings.store ? lockedValues.store_id : defaultStoreId
    })

  } catch (error: any) {
    console.error('Submit error:', error)
    if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors.map((err: any) => err.message).join(', ')
      message.value = `驗證錯誤：${errorMessages}`
    } else {
      message.value = error.response?.data?.message || '提交失敗，請稍後再試'
    }
    messageClass.value = 'red'
  } finally {
    isSubmitting.value = false
  }
}

// 監聽鎖定設定變化
watch(() => lockSettings.time, (isLocked) => { if (isLocked) lockedValues.paid_at = form.paid_at })
watch(() => lockSettings.paymentMethod, (isLocked) => { if (isLocked) lockedValues.payment_method = form.payment_method })
watch(() => lockSettings.amount, (isLocked) => { if (isLocked) lockedValues.amount = form.amount })
watch(() => lockSettings.store, (isLocked) => { if (isLocked) lockedValues.store_id = form.store_id })

// 監聽付款方式變化，自動填入提領備註
watch(() => form.payment_method, (newMethod) => {
  if (newMethod === '提領') {
    form.paid_at = getTaipeiDateTimeString()
    const storeName = getSelectedStoreName()
    const taipeiNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000))
    const month = taipeiNow.getUTCMonth() + 1
    const date = taipeiNow.getUTCDate()
    if (storeName) {
      form.note = `${storeName}已於${month}月${date}號提領店內現金$${form.amount || 0}`
    }
  }
})

// 監聽金額變化
watch(() => form.amount, (newAmount) => {
  // 提領備註自動填入
  if (form.payment_method === '提領' && newAmount > 0) {
    const storeName = getSelectedStoreName()
    const taipeiNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000))
    const month = taipeiNow.getUTCMonth() + 1
    const date = taipeiNow.getUTCDate()
    if (storeName) {
      form.note = `${storeName}已於${month}月${date}號提領店內現金$${newAmount}`
    }
  }
  // 金額為 0 自動填入贈品/公關品
  if (newAmount === 0 && !form.note) {
    form.note = '贈品/公關品'
  }
  // 金額從 0 變成非 0，且備註是預設的贈品文字，則清空
  if (newAmount > 0 && form.note === '贈品/公關品') {
    form.note = ''
  }
})

onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
/* 隱藏 number input 的滾動按鈕 */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
}
</style>
