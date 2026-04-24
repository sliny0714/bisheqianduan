<template>
  <div class="user-layout">
    <!-- 顶部导航 -->
    <el-header class="top-header">
      <div class="header-content">
        <div class="title">
          <el-icon class="logo-icon"><Management /></el-icon>
          <span>供应商风险评估系统</span>
        </div>
        <div class="header-tools">
        </div>
        <div class="user-info">
          <el-dropdown>
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userAvatar"></el-avatar>
              <span class="user-name">{{ userInfo.username }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 左侧菜单 -->
      <el-aside width="240px" class="left-menu">
        <el-menu
          :default-active="activeMenu"
          class="menu"
          router
          :unique-opened="false"
          background-color="#0f172a"
          text-color="#e2e8f0"
          active-text-color="#3b82f6"
        >
          <el-menu-item index="/home">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/supplier/my/list">
            <el-icon><UserFilled /></el-icon>
            <span>我的供应商管理</span>
          </el-menu-item>
          <el-menu-item index="/risk/my/list">
            <el-icon><Warning /></el-icon>
            <span>我的风险评估</span>
          </el-menu-item>
          <el-menu-item index="/risk/my/alert">
            <el-icon><Bell /></el-icon>
            <span>我的风险预警</span>
          </el-menu-item>
          <el-sub-menu index="business">
            <template #title>
              <el-icon><FolderOpened /></el-icon>
              <span>商务管理</span>
            </template>
            <el-menu-item index="/annual/my">我的年审</el-menu-item>
            <el-menu-item index="/order/my">我的订单</el-menu-item>
            <el-menu-item index="/performance/my">我的绩效</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/settings/profile">
            <el-icon><Setting /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容 -->
      <el-main class="right-content">
        <slot></slot>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import {
  Management,
  ArrowDown,
  House,
  UserFilled,
  Warning,
  FolderOpened
} from '@element-plus/icons-vue'
import request from '../../../api/request'

const router = useRouter()
const route = useRoute()

// 当前登录用户信息
const userInfo = ref({ username: 'user01' })
// 用户头像
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')



// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 页面加载时获取数据
onMounted(() => {
  getUserInfo()
})

// 获取当前登录用户
const getUserInfo = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    userInfo.value = user
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  ElMessage.success('退出成功')
  router.push('/login')
}

// 处理个人中心
const handleProfile = () => {
  router.push('/settings/profile')
}
</script>

<style scoped>
.user-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* 顶部导航 */
.top-header {
  height: 64px;
  background: #0f172a;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 头部工具 */
.header-tools {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 24px;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.logo-icon {
  font-size: 24px;
  color: #3b82f6;
}



/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-name {
  color: #e2e8f0;
  font-size: 14px;
}

.arrow-icon {
  font-size: 12px;
  color: #94a3b8;
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧菜单 */
.left-menu {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.left-menu::-webkit-scrollbar {
  width: 6px;
}

.left-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.left-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu {
  height: 100%;
  border-right: none;
  padding: 16px 8px;
}

.menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  padding: 0 20px !important;
}

.menu .el-menu-item:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: translateX(4px);
}

.menu .el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
  color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  font-weight: 500;
}

.menu .el-menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.menu .el-menu-item:hover .el-icon {
  transform: scale(1.1);
}

.menu .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  padding: 0 20px !important;
}

.menu .el-sub-menu__title:hover {
  background: rgba(59, 130, 246, 0.15);
}

.menu .el-sub-menu__title .el-icon {
  margin-right: 12px;
  font-size: 18px;
}

.menu .el-sub-menu__title .el-sub-menu__icon-arrow {
  transition: transform 0.3s ease;
}

.menu .el-sub-menu.is-opened > .el-sub-menu__title .el-sub-menu__icon-arrow {
  transform: rotate(180deg);
}

.menu .el-sub-menu .el-menu-item {
  height: 46px;
  line-height: 46px;
  padding-left: 52px !important;
  margin: 2px 0;
  font-size: 13px;
}

.menu .el-sub-menu .el-menu-item::before {
  content: '';
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.menu .el-sub-menu .el-menu-item:hover::before {
  background: #3b82f6;
  transform: translateY(-50%) scale(1.2);
}

.menu .el-sub-menu .el-menu-item.is-active {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  font-weight: 500;
}

.menu .el-sub-menu .el-menu-item.is-active::before {
  background: #3b82f6;
  width: 6px;
  height: 6px;
}

/* 右侧内容 */
.right-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8fafc;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .left-menu {
    width: 200px;
  }

  .right-content {
    padding: 16px;
  }
}
</style>
