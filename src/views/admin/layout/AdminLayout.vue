<template>
  <div class="admin-container">
    <el-container>
      <!-- 左侧菜单 -->
      <el-aside width="240px" class="aside-container">
        <div class="logo">
          <div class="logo-icon">
            <el-icon class="logo-icon-item"><Management /></el-icon>
          </div>
          <h2 class="logo-text">管理系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
          :collapse-transition="false"
        >
          <el-menu-item index="/admin/home">
            <el-icon class="menu-icon"><House /></el-icon>
            <span class="menu-text">首页</span>
          </el-menu-item>
          <el-menu-item index="/admin/supplier">
            <el-icon class="menu-icon"><Box /></el-icon>
            <span class="menu-text">供应商管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/risk">
            <el-icon class="menu-icon"><DataAnalysis /></el-icon>
            <span class="menu-text">风险评估管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/alert">
            <el-icon class="menu-icon"><Bell /></el-icon>
            <span class="menu-text">风险预警管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/user">
            <el-icon class="menu-icon"><User /></el-icon>
            <span class="menu-text">用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/contract">
            <el-icon class="menu-icon"><Document /></el-icon>
            <span class="menu-text">合同管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/profile">
            <el-icon class="menu-icon"><UserFilled /></el-icon>
            <span class="menu-text">个人中心</span>
          </el-menu-item>

          <el-menu-item index="/admin/annual">
            <el-icon class="menu-icon"><Calendar /></el-icon>
            <span class="menu-text">年审管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/order">
            <el-icon class="menu-icon"><ShoppingCart /></el-icon>
            <span class="menu-text">订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/performance">
            <el-icon class="menu-icon"><Star /></el-icon>
            <span class="menu-text">绩效考核</span>
          </el-menu-item>
          <el-menu-item index="/admin/log">
            <el-icon class="menu-icon"><Timer /></el-icon>
            <span class="menu-text">系统操作日志</span>
          </el-menu-item>
          <el-menu-item index="/admin/doc-manage">
            <el-icon class="menu-icon"><Folder /></el-icon>
            <span class="menu-text">文档知识库管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container class="main-container">
        <!-- 顶部导航 -->
        <el-header class="header-container">
          <div class="header-left">
            <div class="system-logo">
              <el-icon class="system-icon"><Management /></el-icon>
              <h1 class="page-title">小微企业供应商管理与风险评估系统</h1>
            </div>
            <el-breadcrumb class="breadcrumb" separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="breadcrumbItem">{{ breadcrumbItem }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <div class="header-tools">
            </div>
            <el-dropdown @command="handleCommand" class="user-dropdown">
              <div class="user-info">
                <div class="user-avatar">
                  <el-icon class="avatar-icon"><UserFilled /></el-icon>
                </div>
                <div class="user-details">
                  <span class="username">{{ username }}</span>
                  <span class="user-role">{{ userRole }}</span>
                </div>
                <el-icon class="arrow"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区 -->
        <el-main class="content-container">
          <slot></slot>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 悬浮AI小助手 -->
    <AIFloatingAssistant />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House, Box, DataAnalysis, User, UserFilled, ArrowDown, Management, Clock, Warning, Document, Calendar, ShoppingCart, Star, Timer, Folder, Message } from '@element-plus/icons-vue'
import AIFloatingAssistant from '../../../components/AIFloatingAssistant.vue'

const router = useRouter()
const route = useRoute()

const username = ref('')
const userRole = ref('')
const breadcrumbItem = ref('')

const activeMenu = computed(() => route.path)

const updateBreadcrumb = (path) => {
  const pathMap = {
    '/admin/home': '控制台',
    '/admin/supplier': '供应商管理',
    '/admin/risk': '风险评估管理',
    '/admin/alert': '风险预警管理',
    '/admin/user': '用户管理',
    '/admin/contract': '合同管理',
    '/admin/profile': '个人中心',
    '/admin/qual': '资质管理',
    '/admin/annual': '年审管理',
    '/admin/order': '订单管理',
    '/admin/performance': '绩效考核',
    '/admin/log': '系统操作日志',
    '/admin/doc-manage': '文档知识库管理',
    '/admin/chat-assistant': '智能小助手'
  }
  breadcrumbItem.value = pathMap[path] || ''
}

// 监听路由变化，更新面包屑
watch(() => route.path, (newPath) => {
  updateBreadcrumb(newPath)
}, { immediate: true })

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      // 跳转到个人中心（修改密码页面）
      router.push('/admin/profile')
      break
    case 'logout':
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      ElMessage.success('退出登录成功')
      router.push('/login')
      break
  }
}

// 初始化用户信息
const initUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  const user = JSON.parse(userStr)
  username.value = user.username || '管理员'
  userRole.value = user.role || 'admin'

  if (userRole.value !== 'ADMIN') {
    ElMessage.error('您没有权限访问该页面')
    router.push('/home')
  }
}

// 初始化用户信息
initUserInfo()
</script>

<style scoped>
.admin-container {
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.el-container {
  height: 100%;
}

/* 左侧菜单 */
.aside-container {
  background-color: #304156;
  overflow: hidden;
  transition: all 0.3s ease;
}

.logo {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4a;
  padding: 0 20px;
  border-bottom: 1px solid #253341;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409EFF, #667eea);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.logo-icon-item {
  font-size: 20px;
  color: white;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.admin-menu {
  border-right: none;
  height: calc(100vh - 70px);
  padding-top: 10px;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
}

.menu-text {
  font-size: 14px;
  font-weight: 400;
}

/* 主容器 */
.main-container {
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.header-container {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 21, 41, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 70px;
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.system-logo {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.system-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 10px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.breadcrumb {
  font-size: 12px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #667eea);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.avatar-icon {
  font-size: 16px;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  min-width: 80px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.2;
}

.arrow {
  font-size: 12px;
  color: #909399;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .arrow {
  transform: rotate(180deg);
}

/* 内容区 */
.content-container {
  background-color: #f5f7fa;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .aside-container {
    width: 200px !important;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .menu-text {
    font-size: 13px;
  }
  
  .header-container {
    padding: 0 20px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .content-container {
    padding: 20px;
  }
}

@media screen and (max-width: 768px) {
  .aside-container {
    width: 64px !important;
  }
  
  .logo-text {
    display: none;
  }
  
  .logo {
    justify-content: center;
  }
  
  .menu-text {
    display: none;
  }
  
  .menu-icon {
    margin-right: 0;
  }
  
  .header-left {
    flex: 1;
  }
  
  .system-logo {
    margin-bottom: 0;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .user-details {
    display: none;
  }
  
  .user-info {
    padding: 8px;
  }
}
</style>