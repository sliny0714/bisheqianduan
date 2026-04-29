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
            <el-tag :type="getRiskLevelTag(scope.row.level || '未知')" effect="light" size="small">
              {{ scope.row.level || '未知' }}
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
        <el-table-column prop="createTime" label="创建时间" width="200">
          <template #default="scope">
            <span class="create-time">{{ scope.row.createTime }}</span>
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
  // 重置数据，避免缓存问题
  warningsList.value = []
  filteredWarningsList.value = []
  total.value = 0
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return ElMessage.error('请先登录')

    // 1. 获取用户自己的供应商列表
    const supplierRes = await request.get('/supplier/my/list', {
      params: { userId: user.id, pageNum: 1, pageSize: 1000 }
    })
    
    if (supplierRes.code !== 200) {
      ElMessage.error('获取供应商列表失败')
      return
    }
    
    const userSuppliers = supplierRes.data?.records || []
    // 确保ID类型一致，转换为字符串
    const userSupplierIds = new Set(userSuppliers.map(s => String(s.id)))
    console.log('User suppliers:', userSuppliers)
    console.log('User supplier IDs:', userSupplierIds)
    console.log('User supplier IDs (detailed):', Array.from(userSupplierIds))
    console.log('User suppliers length:', userSuppliers.length)
    
    // 2. 从风险评估接口获取数据，与管理员端使用相同的数据源
    const riskRes = await request.get('/risk/list', {
      params: {
        pageNum: 1, // 获取所有数据以便过滤
        pageSize: 1000, // 设置足够大的值
        supplierName: searchKeyword.value
      }
    })
    
    if (riskRes.code === 200) {
      const riskAssessments = riskRes.data?.records || []
      console.log('Risk assessments:', riskAssessments)
      
      // 3. 过滤出用户自己的供应商的评估结果
      const userAssessments = riskAssessments.filter(assessment => 
        userSupplierIds.has(assessment.supplierId)
      )
      console.log('User assessments:', userAssessments)
      
      // 4. 过滤出风险等级为中或高的评估结果
      const filteredAssessments = userAssessments.filter(assessment => {
        const level = assessment.level
        return level === '中' || level === '高'
      })
      console.log('Filtered assessments:', filteredAssessments)
      
      // 5. 按供应商分组，只保留每个供应商最新的评估结果
      const supplierAssessmentsMap = new Map()
      
      filteredAssessments.forEach(assessment => {
        const supplierName = assessment.supplierName
        if (!supplierAssessmentsMap.has(supplierName)) {
          supplierAssessmentsMap.set(supplierName, assessment)
        } else {
          const existingAssessment = supplierAssessmentsMap.get(supplierName)
          // 比较评估时间，保留最新的
          if (new Date(assessment.assessTime || assessment.createTime) > new Date(existingAssessment.assessTime || existingAssessment.createTime)) {
            supplierAssessmentsMap.set(supplierName, assessment)
          }
        }
      })
      
      // 6. 将 Map 转换为数组
      const finalAssessments = Array.from(supplierAssessmentsMap.values())
      
      // 7. 按评估时间倒序排序
      finalAssessments.sort((a, b) => new Date(b.assessTime || b.createTime) - new Date(a.assessTime || a.createTime))
      
      // 8. 转换为预警数据结构
      const filteredAlerts = finalAssessments.map(assessment => ({
        id: assessment.id,
        supplierId: assessment.supplierId,
        supplierName: assessment.supplierName,
        level: assessment.level,
        alertType: assessment.level + '风险预警',
        alertContent: `供应商【${assessment.supplierName}】风险等级为【${assessment.level}】，请及时处理！`,
        isRead: 0, // 默认未读
        createTime: assessment.assessTime || assessment.createTime
      }))
      console.log('Filtered alerts:', filteredAlerts)
      
      // 9. 处理分页
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      warningsList.value = filteredAlerts.slice(start, end)
      total.value = filteredAlerts.length
      
      // 10. 过滤预警列表
      filterWarningsList()
      console.log('Filtered warnings:', filteredWarningsList.value)
      console.log('Total:', total.value)
    }
  } catch (error) {
    ElMessage.error('获取预警列表失败')
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

// 过滤预警列表
const filterWarningsList = () => {
  // 确保warningsList是数组
  const list = Array.isArray(warningsList.value) ? warningsList.value : []
  if (!searchKeyword.value) {
    filteredWarningsList.value = [...list]
  } else {
    const keyword = searchKeyword.value.toLowerCase()
    filteredWarningsList.value = list.filter(item => 
      item && item.supplierName && item.supplierName.toLowerCase().includes(keyword)
    )
  }
  total.value = filteredWarningsList.value.length
  console.log('filterWarningsList - warningsList:', list)
  console.log('filterWarningsList - filteredWarningsList:', filteredWarningsList.value)
  console.log('filterWarningsList - total:', total.value)
  console.log('filterWarningsList - filteredWarningsList.length:', filteredWarningsList.value.length)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getList()
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  getList()
}

// 获取预警类型样式
const getAlertTypeClass = (alertType) => {
  if (alertType.includes('高')) {
    return 'danger'
  } else if (alertType.includes('中')) {
    return 'warning'
  }
  return 'info'
}

// 获取风险等级标签样式
const getRiskLevelTag = (level) => {
  const map = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return map[level] || 'info'
}

// 获取行样式
const getRowClass = (row) => {
  if (row.alertType.includes('高')) {
    return 'high-risk-row'
  } else if (row.alertType.includes('中')) {
    return 'medium-risk-row'
  }
  return ''
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