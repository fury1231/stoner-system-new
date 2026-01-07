import { createRouter, createWebHistory } from 'vue-router'

// 🚀 路由懶加載 - 提升首次載入效能
// AdminLogin 保持同步載入（登入頁為入口點）
import AdminLogin from '@/pages/AdminLogin.vue'

// 大型頁面使用動態導入，實現 Code Splitting
const AdminDashboard = () => import('@/pages/AdminDashboard.vue')
const CustomerOrders = () => import('@/pages/CustomerOrders.vue')
const PaymentForm = () => import('@/components/PaymentForm.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'PaymentForm',
      component: PaymentForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: AdminLogin
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/customer-orders',
      name: 'CustomerOrders',
      component: CustomerOrders,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresAuth) {
    // 🔒 使用 Pinia Store 進行認證檢查
    // 延遲導入避免循環依賴
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()

    // 如果尚未初始化，嘗試初始化認證狀態
    if (!authStore.user && localStorage.getItem('is_authenticated')) {
      await authStore.initializeAuth()
    }

    if (!authStore.isAuthenticated && !localStorage.getItem('is_authenticated')) {
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
