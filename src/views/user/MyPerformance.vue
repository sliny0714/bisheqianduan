<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>绩效管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的绩效</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">我的绩效</h1>
      <p class="page-description">查看您的供应商绩效考核结果</p>
    </div>

    <!-- 当前绩效卡片 -->
    <el-card class="performance-card" v-if="currentPerformance">
      <template #header>
        <div class="card-header">
          <span>{{ currentPerformance.supplierName }}</span>
          <el-tag :type="getLevelType(currentPerformance.level)" effect="dark" size="large">
            评级：{{ currentPerformance.level }}
          </el-tag>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="质量评分">
          <span class="score">{{ currentPerformance.qualityScore }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="交付评分">
          <span class="score">{{ currentPerformance.deliveryScore }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="服务评分">
          <span class="score">{{ currentPerformance.serviceScore }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="综合总分">
          <span class="total-score">{{ currentPerformance.totalScore }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="评估人">
          {{ currentPerformance.assessor || '系统' }}
        </el-descriptions-item>
        <el-descriptions-item label="评估时间">
          {{ currentPerformance.createTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 无绩效提示 -->
    <el-empty v-else description="暂无绩效考核记录" />

    <!-- 历史绩效列表 -->
    <el-card class="table-card" style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <span>历史考核记录</span>
        </div>
      </template>
      <el-table v-loading="loading" :data="performanceList" border stripe>
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="qualityScore" label="质量评分" width="100" />
        <el-table-column prop="deliveryScore" label="交付评分" width="100" />
        <el-table-column prop="serviceScore" label="服务评分" width="100" />
        <el-table-column prop="totalScore" label="综合总分" width="100">
          <template #default="scope">
            <span style="font-weight: 600; color: #409eff;">{{ scope.row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="评级" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)" effect="dark">
              {{ scope.row.level || '待评' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assessor" label="评估人" width="120" />
        <el-table-column prop="createTime" label="评估时间" width="180" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyPerformance, getMyPerformanceHistory } from '../../api/user/business'
import UserLayout from './layout/UserLayout.vue'

const loading = ref(false)
const currentPerformance = ref(null)
const performanceList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(() => {
  getCurrentPerformance()
  getPerformanceHistory()
})

const getCurrentPerformance = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getMyPerformance({
      userId: user.id
    })
    if (res.code === 200) {
      currentPerformance.value = res.data
    }
  } catch (error) {
    console.error('获取当前绩效失败', error)
  }
}

const getPerformanceHistory = async () => {
  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getMyPerformanceHistory({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      userId: user?.id || 1
    })
    if (res.code === 200) {
      performanceList.value = res.data?.records || []
      total.value = res.data?.total || performanceList.value.length
    }
  } catch (error) {
    console.error('获取历史绩效失败', error)
  } finally {
    loading.value = false
  }
}

const getLevelType = (level) => {
  const map = { 'A': 'success', 'B': 'primary', 'C': 'warning', 'D': 'danger' }
  return map[level] || 'info'
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getPerformanceHistory()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getPerformanceHistory()
}
</script>

<style scoped>
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 32px; }
.page-title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.page-description { font-size: 14px; color: #64748b; }
.performance-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); margin-bottom: 24px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.score { font-size: 24px; font-weight: 600; color: #409eff; }
.total-score { font-size: 28px; font-weight: 700; color: #67c23a; }
.table-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
