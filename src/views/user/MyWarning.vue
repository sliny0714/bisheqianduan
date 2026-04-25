<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我的风险预警</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">我的风险预警</h1>
      <p class="page-description">仅展示风险等级为【中/高】的供应商预警</p>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>预警记录</span>
          <el-button type="success" @click="exportToExcel" :icon="Download">导出</el-button>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="warningsList"
        border
        stripe
      >
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="alertType" label="预警类型" width="120" />
        <el-table-column prop="alertContent" label="预警内容" min-width="300" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>

      <div class="empty-text" v-if="!loading && warningsList.length === 0">
        暂无风险预警
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10,20,50,100]"
          layout="total,sizes,prev,pager,next,jumper"
          :total="total"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import request from '../../api/request'
import UserLayout from './layout/UserLayout.vue'
import * as XLSX from 'xlsx'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const warningsList = ref([])

onMounted(() => {
  getList()
})

const getList = async () => {
  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return ElMessage.error('请先登录')

    const res = await request.get('/alert/page', {
      params: { userId: user.id, pageNum: currentPage.value, pageSize: pageSize.value }
    })

    if (res.code === 200) {
      let rawWarnings = res.data.records || []

      // 1. 按供应商去重，只保留最新一条预警
      const uniqueWarningMap = new Map()
      rawWarnings.forEach(w => {
          if (!uniqueWarningMap.has(w.supplierName) || 
              new Date(w.createTime) > new Date(uniqueWarningMap.get(w.supplierName).createTime)) {
              uniqueWarningMap.set(w.supplierName, w)
          }
      })
      warningsList.value = Array.from(uniqueWarningMap.values())

      // 2. 用去重后的列表长度更新分页的 total
      total.value = warningsList.value.length
    }
  } catch (error) {
    ElMessage.error('获取预警列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 导出Excel功能
const exportToExcel = async () => {
  try {
    if (warningsList.value.length === 0) {
      ElMessage.info('没有数据可导出')
      return
    }
    
    // 转换数据格式
    const exportData = warningsList.value.map(warning => ({
      '供应商名称': warning.supplierName,
      '预警类型': warning.alertType,
      '预警内容': warning.alertContent,
      '创建时间': warning.createTime
    }))
    
    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '风险预警记录')
    
    // 导出文件
    const fileName = `风险预警记录_${new Date().toISOString().split('T')[0]}.xlsx`
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
.page-header { margin-bottom: 24px; }
.statistic-bar { margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
.table-card { border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.empty-text { padding: 40px 0; text-align: center; color: #909399; }
:deep(.unread-row) {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
  font-weight: 500;
}
</style>