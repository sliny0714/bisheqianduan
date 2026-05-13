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

    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">预警记录</span>
          <div class="header-stats">
            <el-badge :value="total" type="danger" />
            <span class="stats-text">条预警</span>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="filteredWarningsList"
        border
        stripe
        style="width: 100%"
        :row-class-name="getRowClass"
      >
        <el-table-column prop="supplierName" label="供应商名称" min-width="200">
          <template #default="scope">
            <span class="supplier-name">{{ scope.row.supplierName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alertType" label="预警类型" width="140">
          <template #default="scope">
            <el-tag :type="getAlertTypeClass(scope.row.alertType)" effect="dark" size="small">
              {{ scope.row.alertType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getRiskLevelTag(scope.row.level || scope.row.riskLevel || '未知')" effect="light" size="small">
              {{ scope.row.level || scope.row.riskLevel || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alertContent" label="预警内容" min-width="400">
          <template #default="scope">
            <div class="alert-content">
              <p>{{ scope.row.alertContent }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200">
          <template #default="scope">
            <span class="create-time">{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="empty-text" v-if="!loading && filteredWarningsList.length === 0">
        <el-empty
          :description="{
            'default': '暂无风险预警',
            'search': '没有找到匹配的风险预警'
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
          @size-change="getList"
          @current-change="getList"
          background
        />
      </div>
    </el-card>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search, Refresh } from '@element-plus/icons-vue'
import request from '../../api/request'
import UserLayout from './layout/UserLayout.vue'
import * as XLSX from 'xlsx'
import { formatDate } from '../../utils/date'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const warningsList = ref([])
const searchKeyword = ref('')
const filteredWarningsList = ref([])

onMounted(() => {
  getList()
})

const getList = async () => {
  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return ElMessage.error('请先登录')

    const supplierRes = await request.get('/supplier/my/list', {
      params: { userId: user.id, pageNum: 1, pageSize: 1000 }
    })
    
    if (supplierRes.code !== 200) {
      ElMessage.error('获取供应商列表失败')
      return
    }
    
    const suppliers = Array.isArray(supplierRes.data) ? supplierRes.data : supplierRes.data?.records || []
    
    const riskAlerts = []
    
    for (let supplier of suppliers) {
      if (supplier.qualificationFile && supplier.auditStatus === 1) {
        try {
          const riskRes = await request.get('/risk/list', {
            params: { supplierId: supplier.id }
          })
          
            const riskRecords = Array.isArray(riskRes.data) ? riskRes.data : riskRes.data?.records || []
            if (riskRecords.length > 0) {
              riskRecords.sort((a, b) => {
                const t1 = new Date(a.assessTime || a.createTime || 0)
                const t2 = new Date(b.assessTime || b.createTime || 0)
                return t2 - t1
              })
              
              const latestAssessment = riskRecords[0]
              const riskLevel = latestAssessment.level || latestAssessment.riskLevel
              
              if (riskLevel === '中' || riskLevel === '高') {
                // 优先从风险评估数据获取供应商名称，其次从供应商数据获取（兼容 supplierName 和 name 字段）
                const name = latestAssessment.supplierName || supplier.supplierName || supplier.name
                riskAlerts.push({
                  id: latestAssessment.id,
                  supplierId: supplier.id,
                  supplierName: name,
                  level: riskLevel,
                  alertType: riskLevel + '风险预警',
                  alertContent: `供应商【${name}】风险等级为【${riskLevel}】，请及时处理！`,
                  createTime: latestAssessment.assessTime || latestAssessment.createTime
                })
              }
            }
        } catch (error) {
          console.error(`获取供应商 ${supplier.supplierName} 风险评估失败:`, error)
        }
      }
    }
    
    riskAlerts.sort((a, b) => new Date(b.createTime || 0) - new Date(a.createTime || 0))
    
    let filteredAlerts = riskAlerts
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filteredAlerts = riskAlerts.filter(item => 
        item && item.supplierName && item.supplierName.toLowerCase().includes(keyword)
      )
    }
    
    total.value = filteredAlerts.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    warningsList.value = filteredAlerts.slice(start, end)
    filteredWarningsList.value = warningsList.value
    
  } catch (error) {
    ElMessage.error('获取预警列表失败')
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getList()
}

const handleReset = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  getList()
}

const getAlertTypeClass = (alertType) => {
  if (alertType?.includes('高')) {
    return 'danger'
  } else if (alertType?.includes('中')) {
    return 'warning'
  }
  return 'info'
}

const getRiskLevelTag = (level) => {
  const map = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return map[level] || 'info'
}

const getRowClass = (row) => {
  if (!row || !row.alertType) return ''
  if (row.alertType.includes('高')) {
    return 'high-risk-row'
  } else if (row.alertType.includes('中')) {
    return 'medium-risk-row'
  }
  return ''
}

const exportToExcel = async () => {
  try {
    if (warningsList.value.length === 0) {
      ElMessage.info('没有数据可导出')
      return
    }
    
    const exportData = warningsList.value.map(warning => ({
      '供应商名称': warning.supplierName,
      '预警类型': warning.alertType,
      '预警内容': warning.alertContent,
      '创建时间': warning.createTime
    }))
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '风险预警记录')
    
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
.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
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
  margin: 0;
}
.search-bar {
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.table-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
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
.supplier-name {
  font-weight: 500;
  color: #1e293b;
}
.alert-content {
  line-height: 1.5;
  color: #475569;
}
.create-time {
  color: #64748b;
  font-size: 13px;
}
.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 20px;
}
.empty-text {
  padding: 60px 0;
}
:deep(.high-risk-row) {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
}
:deep(.high-risk-row td) {
  border-color: #fecaca !important;
}
:deep(.medium-risk-row) {
  background-color: #fffbeb !important;
  color: #d97706 !important;
}
:deep(.medium-risk-row td) {
  border-color: #fde68a !important;
}
:deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}
:deep(.el-table th) {
  background-color: #f8fafc !important;
  font-weight: 600;
  color: #334155;
}
</style>