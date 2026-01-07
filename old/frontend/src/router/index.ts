import { createRouter, createWebHistory } from 'vue-router'
import PaymentForm from '@/components/PaymentForm.vue'
import AdminLogin from '@/pages/AdminLogin.vue'
import AdminDashboard from '@/pages/AdminDashboard.vue'
import CustomerOrders from '@/pages/CustomerOrders.vue'

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

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = localStorage.getItem('admin_token')
    if (!isAuthenticated) {
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