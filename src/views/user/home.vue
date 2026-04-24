<template>
  <UserLayout>
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>控制台</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 用户端 Dashboard 组件 -->
    <UserDashboard />
  </UserLayout>
</template>

<script setup>
import UserLayout from './layout/UserLayout.vue'
import UserDashboard from './components/UserDashboard.vue'
</script>

<style scoped>
/* 面包屑 */
.breadcrumb {
  margin-bottom: 20px;
}
</style>