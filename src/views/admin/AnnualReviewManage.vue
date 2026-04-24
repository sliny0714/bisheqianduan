<template>
  <admin-layout>
    <div class="annual-review-manage">
      <div class="page-header">
        <h1 class="page-title">年审管理</h1>
        <p class="page-description">管理供应商年度审核</p>
      </div>

    <div class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-item">
            <div class="stat-content">
              <div class="stat-number">{{ total }}</div>
              <div class="stat-label">总年审数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-item warning">
            <div class="stat-content">
              <div class="stat-number">{{ pendingCount }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-item success">
            <div class="stat-content">
              <div class="stat-number">{{ approvedCount }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-item danger">
            <div class="stat-content">
              <div class="stat-number">{{ rejectedCount }}</div>
              <div class="stat-label">已驳回</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索供应商名称"
              clearable
              style="width: 220px"
              @keyup.enter="handleSearch"
            />
            <el-select v-model="statusFilter" placeholder="审核状态" clearable style="width: 150px">
              <el-option label="待提交" :value="0" />
              <el-option label="待审核" :value="1" />
              <el-option label="已通过" :value="2" />
              <el-option label="已驳回" :value="3" />
            </el-select>
            <el-select v-model="yearFilter" placeholder="年审年份" clearable style="width: 150px">
              <el-option
                v-for="year in years"
                :key="year"
                :label="year + '年'"
                :value="year"
              />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="annualReviewList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="reviewYear" label="年审年份" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="dark">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="提交时间" width="180" />
        <el-table-column prop="reviewRemark" label="审核意见" min-width="200" />
        <el-table-column prop="reviewTime" label="审核时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-group">
              <el-button
                v-if="scope.row.status === 1"
                type="success"
                size="small"
                @click="handleAudit(scope.row, 2)"
              >
                通过
              </el-button>
              <el-button
                v-if="scope.row.status === 1"
                type="danger"
                size="small"
                @click="handleAudit(scope.row, 3)"
              >
                驳回
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
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

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="年审审核" width="500px">
      <el-form :model="auditForm" ref="auditFormRef" label-width="100px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="供应商名称">{{ currentReview?.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="年审年份">{{ currentReview?.reviewYear }}</el-descriptions-item>
        </el-descriptions>

        <el-form-item label="审核结果" style="margin-top: 20px;">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="2">通过</el-radio>
            <el-radio :label="3">驳回</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="年审详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="供应商名称">{{ currentReview?.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="年审年份">{{ currentReview?.reviewYear }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentReview?.status)" effect="dark">
            {{ getStatusText(currentReview?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentReview?.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ currentReview?.reviewRemark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间" :span="2">{{ currentReview?.reviewTime || '待审核' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from './layout/AdminLayout.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnualReviewList, auditAnnualReview } from '../../api/admin/business'

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const result = []
  for (let i = 0; i < 5; i++) {
    result.push(currentYear - i)
  }
  return result
})

const loading = ref(false)
const annualReviewList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const statusFilter = ref(null)
const yearFilter = ref(null)

const auditDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const submitting = ref(false)
const currentReview = ref(null)

const auditForm = reactive({
  id: '',
  status: 2,
  remark: ''
})

const auditFormRef = ref(null)

onMounted(() => {
  getAnnualReviews()
})

const getAnnualReviews = async () => {
  loading.value = true
  try {
    const res = await getAnnualReviewList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      status: statusFilter.value ?? undefined,
      reviewYear: yearFilter.value ?? undefined
    })

    if (res.code === 200) {
      annualReviewList.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '获取年审列表失败')
    }
  } catch (error) {
    console.error('获取年审列表失败', error)
    ElMessage.error('获取年审列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const map = { 0: '待提交', 1: '待审核', 2: '已通过', 3: '已驳回' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const handleSearch = () => {
  currentPage.value = 1
  getAnnualReviews()
}

const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = null
  yearFilter.value = null
  currentPage.value = 1
  getAnnualReviews()
}

const handleAudit = (row, status) => {
  currentReview.value = row
  auditForm.id = row.id
  auditForm.status = status
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const confirmAudit = async () => {
  submitting.value = true
  try {
    const res = await auditAnnualReview({
      id: auditForm.id,
      status: auditForm.status,
      remark: auditForm.remark
    })

    if (res.code === 200) {
      ElMessage.success(auditForm.status === 2 ? '审核通过' : '已驳回')
      auditDialogVisible.value = false
      getAnnualReviews()
    } else {
      ElMessage.error(res.msg || '审核失败')
    }
  } catch (error) {
    console.error('审核失败', error)
    ElMessage.error('审核失败')
  } finally {
    submitting.value = false
  }
}

const handleDetail = (row) => {
  currentReview.value = row
  detailDialogVisible.value = true
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  getAnnualReviews()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getAnnualReviews()
}

const pendingCount = computed(() => annualReviewList.value.filter(i => i.status === 1).length)
const approvedCount = computed(() => annualReviewList.value.filter(i => i.status === 2).length)
const rejectedCount = computed(() => annualReviewList.value.filter(i => i.status === 3).length)
</script>

<style scoped>
.annual-review-manage {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; margin: 0 0 8px 0; }
.page-description { font-size: 14px; color: #909399; }
.stats-card { margin-bottom: 24px; }
.stat-item { border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: none; }
.stat-content { padding: 20px; text-align: center; }
.stat-number { font-size: 28px; font-weight: 600; color: #409eff; margin-bottom: 6px; }
.stat-label { font-size: 13px; color: #909399; }
.stat-item.warning .stat-number { color: #e6a23c; }
.stat-item.success .stat-number { color: #67c23a; }
.stat-item.danger .stat-number { color: #f56c6c; }
.table-card { border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: none; }
.card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.search-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.pagination { margin-top: 20px; justify-content: flex-end; display: flex; }
.action-group { display: flex; gap: 6px; flex-wrap: wrap; }
</style>
