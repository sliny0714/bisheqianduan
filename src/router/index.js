import { createRouter, createWebHistory } from 'vue-router'
import userRoutes from './user'
import adminRoutes from './admin'

const routes = [
  ...userRoutes,
  ...adminRoutes,
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && (!user || user.role !== 'ADMIN')) {
    next('/home')
    return
  }
  
  next()
})

export default router
