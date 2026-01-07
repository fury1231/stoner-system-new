<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center py-4 px-4 sm:py-12 sm:px-6 lg:px-8">
    <!-- 背景裝飾元素 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
    
    <div class="relative max-w-md w-full xs:max-w-sm space-y-6 xs:space-y-4 sm:space-y-8">
      
      <!-- 標題區域 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 xs:w-10 xs:h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 xs:mb-3 sm:mb-6">
          <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 class="text-lg xs:text-base-mobile sm:text-2xl lg:text-3xl font-bold text-white mb-2 xs:mb-1.5">
          管理後台登入
        </h2>
        <p class="text-gray-400 text-sm xs:text-sm-mobile sm:text-base">
          請輸入您的帳號和密碼
        </p>
      </div>
      
      <!-- 登入表單 -->
      <div class="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl xs:rounded-xl shadow-2xl p-4 xs:p-3 sm:p-6 lg:p-8">
        <form class="space-y-4 xs:space-y-3 sm:space-y-6" @submit.prevent="login">
          <!-- 用戶名輸入框 -->
          <div class="space-y-2 xs:space-y-1.5">
            <label for="username" class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
              用戶名
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base xs:text-base-mobile sm:text-sm min-h-touch"
                placeholder="請輸入用戶名"
              />
            </div>
          </div>
          
          <!-- 密碼輸入框 -->
          <div class="space-y-2 xs:space-y-1.5">
            <label for="password" class="block text-sm xs:text-sm-mobile font-medium text-gray-200">
              密碼
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="block w-full pl-10 pr-3 py-3 xs:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base xs:text-base-mobile sm:text-sm min-h-touch"
                placeholder="請輸入密碼"
              />
            </div>
          </div>

          <!-- 登入按鈕 -->
          <div class="pt-2 xs:pt-3 sm:pt-4">
            <button
              type="submit"
              :disabled="isLoggingIn"
              class="group relative w-full flex justify-center items-center py-3 xs:py-3.5 px-4 border border-transparent text-base xs:text-base-mobile font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg min-h-touch"
            >
              <svg v-if="isLoggingIn" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoggingIn ? '登入中...' : '登入' }}
            </button>
          </div>
        </form>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="mt-4 xs:mt-3 sm:mt-6 p-3 xs:p-2.5 sm:p-4 rounded-lg border-l-4 bg-red-900/20 border-l-red-500 text-red-300 text-sm xs:text-sm-mobile sm:text-base">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm xs:text-sm-mobile">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

// 使用 store 的狀態
const isLoggingIn = computed(() => authStore.isLoading)
const errorMessage = computed(() => authStore.error || '')

const login = async () => {
  if (isLoggingIn.value) return

  try {
    await authStore.login(form)

    // 🔒 安全性改進：使用嚴格的白名單驗證重定向路徑，防止 Open Redirect 攻擊
    const redirectPath = router.currentRoute.value.query.redirect as string
    // 允許的重定向路徑前綴
    const ALLOWED_REDIRECT_PREFIXES = ['/admin']
    // 驗證條件：必須以允許的前綴開頭，且不包含可疑字符
    const isValidInternalPath = redirectPath &&
      ALLOWED_REDIRECT_PREFIXES.some(prefix => redirectPath.startsWith(prefix)) &&
      !redirectPath.includes('//') &&       // 防止協議相對 URL
      !redirectPath.includes('\\') &&       // 防止反斜線繞過
      !redirectPath.includes('%') &&        // 防止 URL 編碼繞過
      !/[<>"']/.test(redirectPath) &&       // 防止 XSS
      redirectPath !== '/admin/login'       // 防止循環重定向

    if (isValidInternalPath) {
      router.push(redirectPath)
    } else {
      // 預設重定向到管理後台
      router.push('/admin')
    }
  } catch {
    // 錯誤已由 store 處理
  }
}
</script>