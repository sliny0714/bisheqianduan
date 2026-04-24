import AdminHome from '../views/admin/AdminHome.vue'
import SupplierManage from '../views/admin/SupplierManage.vue'
import RiskManage from '../views/admin/RiskManage.vue'
import AlertManage from '../views/admin/AlertManage.vue'
import UserManage from '../views/admin/UserManage.vue'
import AdminProfile from '../views/admin/AdminProfile.vue'

import AnnualReviewManage from '../views/admin/AnnualReviewManage.vue'
import OrderManage from '../views/admin/OrderManage.vue'
import PerformanceManage from '../views/admin/PerformanceManage.vue'
import OperLogManage from '../views/admin/OperLogManage.vue'

const adminRoutes = [
  {
    path: '/admin/home',
    name: 'AdminHome',
    component: AdminHome,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/supplier',
    name: 'SupplierManage',
    component: SupplierManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/risk',
    name: 'RiskManage',
    component: RiskManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/alert',
    name: 'AlertManage',
    component: AlertManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user',
    name: 'UserManage',
    component: UserManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  {
    path: '/admin/annual',
    name: 'AnnualReviewManage',
    component: AnnualReviewManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/order',
    name: 'OrderManage',
    component: OrderManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/performance',
    name: 'PerformanceManage',
    component: PerformanceManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/log',
    name: 'OperLogManage',
    component: OperLogManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: AdminProfile,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

export default adminRoutes
