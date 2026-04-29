<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我的风险评估</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">风险评估</h1>
      <p class="page-description">风险评估由管理员发起，您可在此查看评估结果</p>
    </div>

    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索供应商名称" style="width: 300px; margin-right: 12px;"></el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>评估记录</span>
          <div class="header-buttons">
            <el-button type="success" @click="exportToExcel" :icon="Download">导出</el-button>
            <el-button type="primary" link @click="handleRefresh" :icon="Refresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="filteredAssessmentList" border stripe>
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column label="资质文件" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.qualificationFile ? 'success' : 'warning'" effect="dark">
              {{ scope.row.qualificationFile ? '已上传 ✅' : '未上传 ❌' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="风险分数" width="120" />
        <el-table-column prop="level" label="风险等级" width="120">
          <template #default="scope">
            <el-tag :type="getRiskLevelType(scope.row)" effect="dark">{{ scope.row.level || '—' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="评估摘要" min-width="220" />
        <el-table-column prop="assessTime" label="评估时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="text" @click="handleViewDetail(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="empty-text" v-if="!loading && filteredAssessmentList.length === 0">
        {{ searchKeyword ? '没有找到匹配的供应商' : '暂无符合条件的供应商（需上传资质并审核通过）' }}
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="风险评估详情" width="620px" destroy-on-close>
      <div v-if="currentAssessment" class="detail-box">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="供应商名称">{{ currentAssessment.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="风险分数">{{ currentAssessment.score || '—' }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getRiskLevelType(currentAssessment)" effect="dark">{{ currentAssessment.level || '—' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评估时间">{{ currentAssessment.assessTime || '—' }}</el-descriptions-item>
          <el-descriptions-item label="评估摘要">{{ currentAssessment.summary || '暂无评估摘要' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import request from '../../api/request'
import UserLayout from './layout/UserLayout.vue'
import * as XLSX from 'xlsx'

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentAssessment = ref(null)
const suppliers = ref([])
const assessmentList = ref([])
const searchKeyword = ref('')
const filteredAssessmentList = ref([])

onMounted(() => {
  loadSuppliers()
})

// 加载供应商
const loadSuppliers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.get('/supplier/my/list', {
      params: { userId: user.id, pageNum: 1, pageSize: 1000 }
    })
    if (res.code === 200) {
      suppliers.value = res.data?.records || []
      loadAssessmentData()
    }
  } catch (e) {
    ElMessage.error('加载供应商失败')
  }
}

// 加载风险评估记录
const loadAssessmentData = async () => {
  loading.value = true
  const arr = []

  for (let s of suppliers.value) {
    if (!s.qualificationFile || s.auditStatus !== 1) continue

    try {
      const res = await request.get('/risk/list', {
        params: { supplierId: s.id }
      })
      const list = res.data?.records || []

      if (list.length > 0) {
        // 按时间排序取最新一条
        list.sort((a, b) => new Date(b.assessTime) - new Date(a.assessTime))
        const latest = list[0]

        latest.supplierName = s.name
        latest.qualificationFile = s.qualificationFile
        arr.push(latest)
      } else {
        arr.push({
          supplierName: s.name,
          qualificationFile: s.qualificationFile,
          score: null,
          level: null,
          summary: '待管理员评估',
          assessTime: null
        })
      }
    } catch (e) {}
  }

  assessmentList.value = arr
  filterAssessmentList()
  loading.value = false
}

// 过滤评估列表
const filterAssessmentList = () => {
  if (!searchKeyword.value) {
    filteredAssessmentList.value = assessmentList.value
  } else {
    const keyword = searchKeyword.value.toLowerCase()
    filteredAssessmentList.value = assessmentList.value.filter(item => 
      item.supplierName.toLowerCase().includes(keyword)
    )
  }
}

// 搜索
const handleSearch = () => {
  filterAssessmentList()
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  filterAssessmentList()
}

const handleViewDetail = (row) => {
  currentAssessment.value = row
  detailDialogVisible.value = true
}

const handleRefresh = () => loadSuppliers()

const getRiskLevelType = (row) => {
  const level = row.level || row.riskLevel || ''
  if (!level) return 'info'
  if (level === '低') return 'success'
  if (level === '中') return 'warning'
  if (level === '高') return 'danger'
  return 'info'
}

// 导出Excel功能
const exportToExcel = async () => {
  try {
    if (assessmentList.value.length === 0) {
      ElMessage.info('没有数据可导出')
      return
    }
    
    // 转换数据格式
    const exportData = assessmentList.value.map(assessment => ({
      '供应商名称': assessment.supplierName,
      '资质文件': assessment.qualificationFile ? '已上传' : '未上传',
      '风险分数': assessment.score || '—',
      '风险等级': assessment.level || '—',
      '评估摘要': assessment.summary || '暂无评估摘要',
      '评估时间': assessment.assessTime || '—'
    }))
    
    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '风险评估记录')
    
    // 导出文件
    const fileName = `风险评估记录_${new Date().toISOString().split('T')[0]}.xlsx`
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
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; }
.page-description { font-size:14px; color:#64748b; }
.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.table-card { border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05); }
.card-header { display:flex; justify-content:space-between; align-items:center; }
.detail-box { padding:10px 0; }
.empty-text { padding: 40px 0; text-align: center; color: #909399; }
</style>