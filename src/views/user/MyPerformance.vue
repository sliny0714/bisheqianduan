<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商务管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的绩效</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">我的绩效</h1>
      <p class="page-description">查看您的供应商绩效考核结果</p>
      <div class="divider"></div>
    </div>

    <!-- 当前绩效卡片 -->
    <el-card class="performance-card" v-if="currentPerformance" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ currentPerformance.supplierName }}</span>
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
    <div class="empty-container" v-else>
      <el-empty
        description="暂无绩效考核记录"
        :image-size="200"
      />
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索供应商名称"
        style="width: 320px; margin-right: 12px;"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button type="success" @click="exportToExcel" style="margin-left: auto;">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>

    <!-- 历史绩效列表 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <span class="header-title">历史考核记录</span>
          <div class="header-stats">
            <el-badge :value="total" type="primary" />
            <span class="stats-text">条记录</span>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="performanceList"
        border
        stripe
        style="width: 100%"
        :row-class-name="getRowClass"
      >
        <el-table-column prop="supplierName" label="供应商名称" min-width="180">
          <template #default="scope">
            <span class="supplier-name">{{ scope.row.supplierName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="qualityScore" label="质量评分" width="120">
          <template #default="scope">
            <span class="score-item">{{ scope.row.qualityScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryScore" label="交付评分" width="120">
          <template #default="scope">
            <span class="score-item">{{ scope.row.deliveryScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="serviceScore" label="服务评分" width="120">
          <template #default="scope">
            <span class="score-item">{{ scope.row.serviceScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="综合总分" width="120">
          <template #default="scope">
            <span class="total-score-item">{{ scope.row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="评级" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)" effect="dark" size="small">
              {{ scope.row.level || '待评' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assessor" label="评估人" width="120">
          <template #default="scope">
            <span class="assessor">{{ scope.row.assessor || '系统' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评估时间" width="200">
          <template #default="scope">
            <span class="time">{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="empty-text" v-if="!loading && performanceList.length === 0">
        <el-empty
          :description="{
            'default': '暂无绩效考核记录',
            'search': '没有找到匹配的绩效记录'
          }[searchKeyword ? 'search' : 'default']"
        />
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Download, Search, Refresh } from '@element-plus/icons-vue'
import { getMyPerformance, getMyPerformanceHistory } from '../../api/user/business'
import UserLayout from './layout/UserLayout.vue'
import * as XLSX from 'xlsx'

const loading = ref(false)
const currentPerformance = ref(null)
const performanceList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')

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
      userId: user?.id || 1,
      keyword: searchKeyword.value
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

const handleSearch = () => {
  currentPage.value = 1
  getPerformanceHistory()
}

const handleReset = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  getPerformanceHistory()
}

const getLevelType = (level) => {
  const map = { 'A': 'success', 'B': 'primary', 'C': 'warning', 'D': 'danger' }
  return map[level] || 'info'
}

// 根据绩效评级获取行样式
const getRowClass = ({ row }) => {
  const level = row.level
  if (level === 'A') return 'level-a-row'
  if (level === 'B') return 'level-b-row'
  if (level === 'C') return 'level-c-row'
  if (level === 'D') return 'level-d-row'
  return 'level-default-row'
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getPerformanceHistory()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getPerformanceHistory()
}

// 导出Excel功能
const exportToExcel = async () => {
  try {
    if (performanceList.value.length === 0) {
      ElMessage.info('没有数据可导出')
      return
    }
    
    // 转换数据格式
    const exportData = performanceList.value.map(performance => ({
      '供应商名称': performance.supplierName,
      '质量评分': performance.qualityScore,
      '交付评分': performance.deliveryScore,
      '服务评分': performance.serviceScore,
      '综合总分': performance.totalScore,
      '评级': performance.level || '待评',
      '评估人': performance.assessor || '系统',
      '评估时间': performance.createTime
    }))
    
    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '绩效记录')
    
    // 导出文件
    const fileName = `绩效记录_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.breadcrumb { margin-bottom: 20px; }
.page-header {
  margin-bottom: 32px;
}
.divider {
  margin-top: 16px;
  height: 1px;
  background-color: #e2e8f0;
  width: 100%;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.page-description {
  font-size: 14px;
  color: #64748b;
}
.search-bar {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.performance-card {
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stats-text {
  font-size: 14px;
  color: #64748b;
}
.score {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}
.total-score {
  font-size: 28px;
  font-weight: 700;
  color: #67c23a;
}
.table-card {
  border-radius: 12px;
  margin-bottom: 24px;
}
.supplier-name {
  font-weight: 500;
  color: #1e293b;
}
.score-item {
  font-weight: 500;
  color: #409eff;
}
.total-score-item {
  font-weight: 600;
  color: #67c23a;
}
.assessor {
  color: #64748b;
}
.time {
  font-size: 13px;
  color: #64748b;
}
.level-a-row {
  background-color: rgba(103, 194, 58, 0.05) !important;
}
.level-b-row {
  background-color: rgba(64, 158, 255, 0.05) !important;
}
.level-c-row {
  background-color: rgba(230, 162, 60, 0.05) !important;
}
.level-d-row {
  background-color: rgba(245, 108, 108, 0.05) !important;
}
.level-default-row {
  background-color: rgba(144, 147, 153, 0.05) !important;
}
.el-table tr:hover {
  background-color: rgba(59, 130, 246, 0.05) !important;
}
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  background-color: #f8fafc;
  border-radius: 12px;
  margin-bottom: 24px;
}
.empty-text {
  padding: 60px 0;
  text-align: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
