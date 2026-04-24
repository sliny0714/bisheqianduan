import Login from '../views/user/Login.vue'
import Register from '../views/user/Register.vue'
import Home from '../views/user/home.vue'
import UserCenter from '../views/user/UserCenter.vue'
import AddSupplier from '../views/user/AddSupplier.vue'
import MySupplierList from '../views/user/MySupplierList.vue'
import SupplierDetail from '../views/user/SupplierDetail.vue'
import EditSupplier from '../views/user/EditSupplier.vue'
import MyRiskAssessment from '../views/user/MyRiskAssessment.vue'
import MyWarning from '../views/user/MyWarning.vue'

import MyAnnualReview from '../views/user/MyAnnualReview.vue'
import MyOrder from '../views/user/MyOrder.vue'
import MyPerformance from '../views/user/MyPerformance.vue'

const userRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/supplier/add',
    name: 'AddSupplier',
    component: AddSupplier,
    meta: { requiresAuth: true }
  },
  {
    path: '/supplier/my/list',
    name: 'MySupplierList',
    component: MySupplierList,
    meta: { requiresAuth: true }
  },
  {
    path: '/supplier/detail/:id',
    name: 'SupplierDetail',
    component: SupplierDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/supplier/edit/:id',
    name: 'EditSupplier',
    component: EditSupplier,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings/profile',
    name: 'UserCenter',
    component: UserCenter,
    meta: { requiresAuth: true }
  },
  {
    path: '/risk/my/list',
    name: 'MyRiskAssessment',
    component: MyRiskAssessment,
    meta: { requiresAuth: true }
  },
  {
    path: '/risk/my/alert',
    name: 'MyWarning',
    component: MyWarning,
    meta: { requiresAuth: true }
  },

  {
    path: '/annual/my',
    name: 'MyAnnualReview',
    component: MyAnnualReview,
    meta: { requiresAuth: true }
  },
  {
    path: '/order/my',
    name: 'MyOrder',
    component: MyOrder,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/my',
    name: 'MyPerformance',
    component: MyPerformance,
    meta: { requiresAuth: true }
  }
]

export default userRoutes
