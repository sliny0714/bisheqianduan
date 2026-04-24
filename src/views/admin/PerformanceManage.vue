<template>
  <admin-layout>
    <div class="performance-manage">
      <div class="page-header">
        <h1 class="page-title">绩效考核</h1>
        <p class="page-description">管理供应商绩效考核</p>
      </div>

    <!-- 评分表单 -->
    <el-card class="score-card">
      <template #header>
        <div class="card-header">
          <span>新增绩效评分</span>
        </div>
      </template>

      <el-form :model="scoreForm" :rules="rules" ref="scoreFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="scoreForm.supplierId" placeholder="请选择供应商" style="width: 100%" @change="handleSupplierChange">
                <el-option
                  v-for="item in supplierList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="评估人">
              <el-input v-model="scoreForm.assessor" placeholder="请输入评估人" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="质量评分" prop="qualityScore">
              <el-input-number v-model="scoreForm.qualityScore" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="交付评分" prop="deliveryScore">
              <el-input-number v-model="scoreForm.deliveryScore" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="服务评分" prop="serviceScore">
              <el-input-number v-model="scoreForm.serviceScore" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="scoreForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <div class="score-summary">
              <span>综合总分：<strong>{{ totalScore }}</strong></span>
              <el-tag :type="getLevelType(calculatedLevel)" effect="dark">
                评级：{{ calculatedLevel }}
              </el-tag>
            </div>
          </el-col>

          <el-col :span="24">
            <div class="form-actions">
              <el-button type="primary" :loading="submitting" @click="confirmScore">提交评分</el-button>
              <el-button @click="resetScoreForm">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 历史绩效记录 -->
    <el-card class="table-card" style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索供应商名称"
              style="width: 260px; margin-right: 12px;"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-select v-model="levelFilter" placeholder="评级筛选" clearable style="width: 140px; margin-right: 12px;">
              <el-option label="A" value="A" />
              <el-option label="B" value="B" />
              <el-option label="C" value="C" />
              <el-option label="D" value="D" />
            </el-select>

            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
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
        <el-table-column prop="remark" label="备注" min-width="160" />
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
  </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from './layout/AdminLayout.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getPerformanceList, scorePerformance } from '../../api/admin/business'
import { getSupplierList } from '../../api/admin/supplier'

const loading = ref(false)
const submitting = ref(false)
const performanceList = ref([])
const supplierList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const levelFilter = ref('')
const scoreFormRef = ref(null)

const scoreForm = reactive({
  supplierId: '',
  supplierName: '',
  qualityScore: 80,
  deliveryScore: 80,
  serviceScore: 80,
  assessor: '',
  remark: ''
})

const rules = {
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  qualityScore: [{ required: true, message: '请输入质量评分', trigger: 'blur' }],
  deliveryScore: [{ required: true, message: '请输入交付评分', trigger: 'blur' }],
  serviceScore: [{ required: true, message: '请输入服务评分', trigger: 'blur' }]
}

const totalScore = computed(() => {
  return Math.floor((scoreForm.qualityScore + scoreForm.deliveryScore + scoreForm.serviceScore) / 3)
})

const calculatedLevel = computed(() => {
  const avg = totalScore.value
  if (avg >= 90) return 'A'
  if (avg >= 75) return 'B'
  if (avg >= 60) return 'C'
  return 'D'
})

onMounted(() => {
  getSuppliers()
  getPerformances()
  initAssessor()
})

const initAssessor = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    scoreForm.assessor = user?.realName || user?.username || '管理员'
  } catch (e) {
    scoreForm.assessor = '管理员'
  }
}

const getSuppliers = async () => {
  try {
    const res = await getSupplierList({
      pageNum: 1,
      pageSize: 1000,
      auditStatus: 1
    })
    if (res.code === 200) {
      supplierList.value = res.data?.records || []
    } else {
      ElMessage.error(res.msg || '获取供应商列表失败')
    }
  } catch (error) {
    console.error('获取供应商列表失败', error)
    ElMessage.error('获取供应商列表失败')
  }
}


const getPerformances = async () => {
  loading.value = true
  try {
    const res = await getPerformanceList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      supplierName: searchKeyword.value || undefined,
      level: levelFilter.value || undefined
    })
    if (res.code === 200) {
      performanceList.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '获取绩效考核列表失败')
    }
  } catch (error) {
    console.error('获取绩效考核列表失败', error)
    ElMessage.error('获取绩效考核列表失败')
  } finally {
    loading.value = false
  }
}

const handleSupplierChange = (supplierId) => {
  const supplier = supplierList.value.find(item => item.id === supplierId)
  scoreForm.supplierName = supplier?.name || ''
}

const getLevelType = (level) => {
  const map = { A: 'success', B: 'primary', C: 'warning', D: 'danger' }
  return map[level] || 'info'
}

const handleSearch = () => {
  currentPage.value = 1
  getPerformances()
}

const handleReset = () => {
  searchKeyword.value = ''
  levelFilter.value = ''
  currentPage.value = 1
  getPerformances()
}

const confirmScore = async () => {
  if (!scoreFormRef.value) return

  await scoreFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const res = await scorePerformance({
        supplierId: scoreForm.supplierId,
        qualityScore: scoreForm.qualityScore,
        deliveryScore: scoreForm.deliveryScore,
        serviceScore: scoreForm.serviceScore,
        assessor: scoreForm.assessor,
        remark: scoreForm.remark
      })

      if (res.code === 200) {
        ElMessage.success('评分成功')
        resetScoreForm()
        getPerformances()
      } else {
        ElMessage.error(res.msg || '评分失败')
      }
    } catch (error) {
      console.error('评分失败', error)
      ElMessage.error('评分失败')
    } finally {
      submitting.value = false
    }
  })
}

const resetScoreForm = () => {
  scoreForm.supplierId = ''
  scoreForm.supplierName = ''
  scoreForm.qualityScore = 80
  scoreForm.deliveryScore = 80
  scoreForm.serviceScore = 80
  scoreForm.remark = ''
  initAssessor()
  scoreFormRef.value?.clearValidate()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  getPerformances()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getPerformances()
}
</script>

<style scoped>
.performance-manage { padding: 24px; }
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.page-description { font-size: 14px; color: #64748b; }
.score-card, .table-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { display: flex; align-items: center; flex-wrap: wrap; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
.score-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0 16px;
  font-size: 16px;
}
.form-actions {
  display: flex;
  gap: 12px;
}
</style>
