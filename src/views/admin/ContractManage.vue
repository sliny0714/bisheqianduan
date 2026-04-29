<template>
  <admin-layout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>合同管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">合同管理</h1>
      <p class="page-description">审核用户提交的合同</p>
    </div>

    <div class="action-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索合同编号或标题"
        style="width: 300px; margin-right: 12px;"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="supplierId" placeholder="选择供应商" clearable style="width: 200px; margin-right: 12px;">
        <el-option
          v-for="supplier in supplierList"
          :key="supplier.id"
          :label="supplier.name"
          :value="supplier.id"
        />
      </el-select>
      <el-select v-model="status" placeholder="选择状态" clearable style="width: 150px; margin-right: 12px;">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已终止" :value="2" />
          <el-option label="已驳回" :value="3" />
        </el-select>
      <el-input
        v-model="createdBy" placeholder="创建人ID"
        style="width: 150px; margin-right: 12px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="default" @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="contractList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="contractNumber" label="合同编号" min-width="180" />
        <el-table-column prop="title" label="合同标题" min-width="200" />
        <el-table-column prop="supplierName" label="供应商" min-width="180" />
        <el-table-column prop="type" label="合同类型" width="120" />
        <el-table-column prop="amount" label="合同金额" width="120">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: 600;">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="150">
          <template #default="scope">
            {{ formatDateOnly(scope.row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="150">
          <template #default="scope">
            {{ formatDateOnly(scope.row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="dark"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleDetail(scope.row.id)"
            >
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button
              v-if="scope.row.status === 0"
              type="success"
              size="small"
              @click="handleAudit(scope.row)"
            >
              <el-icon><Check /></el-icon> 审核
            </el-button>
            <el-button
              v-if="scope.row.status === 1"
              type="danger"
              size="small"
              @click="handleTerminate(scope.row.id)"
            >
              <el-icon><Close /></el-icon> 终止
            </el-button>
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

    <!-- 合同详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="合同详情" width="700px">
      <el-descriptions :column="1" border v-if="currentContract">
        <el-descriptions-item label="合同编号">{{ currentContract.contractNumber }}</el-descriptions-item>
        <el-descriptions-item label="合同标题">{{ currentContract.title }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentContract.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="合同类型">{{ currentContract.type }}</el-descriptions-item>
        <el-descriptions-item label="合同金额">¥{{ currentContract.amount }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ formatDateOnly(currentContract.startDate) }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ formatDateOnly(currentContract.endDate) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentContract.status)" effect="dark">
            {{ getStatusText(currentContract.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentContract.createdBy }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentContract.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="附件">
          <span v-if="!currentContract.filePath">无</span>
          <a
            v-else
            :href="`http://localhost:8080/uploads/${currentContract.filePath}`"
            target="_blank"
            style="color: #409eff"
          >
            查看附件
          </a>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="合同审核" width="500px">
      <el-form :model="auditForm" ref="auditFormRef" label-width="100px">
        <el-form-item label="合同编号">
          <el-input v-model="auditForm.contractNumber" disabled />
        </el-form-item>
        <el-form-item label="合同标题">
          <el-input v-model="auditForm.title" disabled />
        </el-form-item>
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="3">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="remark">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAudit" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Check, Close } from '@element-plus/icons-vue'
import request from '../../api/request'
import AdminLayout from './layout/AdminLayout.vue'
import { formatDate, formatDateOnly } from '../../utils/date'
import {
  getContractList,
  getContractDetail,
  auditContract,
  terminateContract
} from '../../api/admin/business'

const loading = ref(false)
const detailDialogVisible = ref(false)
const auditDialogVisible = ref(false)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const supplierId = ref('')
const status = ref('')
const createdBy = ref('')
const currentContract = ref(null)
const contractList = ref([])
const supplierList = ref([])
const auditFormRef = ref(null)

const auditForm = reactive({
  id: '',
  contractNumber: '',
  title: '',
  status: 1,
  remark: ''
})

onMounted(() => {
  loadSuppliers()
  getContracts()
})

const loadSuppliers = async () => {
  try {
    const res = await request.get('/supplier/list', { params: { pageNum: 1, pageSize: 1000 } })
    if (res.code === 200) {
      supplierList.value = res.data?.records || []
    }
  } catch (error) {
    ElMessage.error('获取供应商列表失败')
  }
}

const getContracts = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (supplierId.value) params.supplierId = supplierId.value
    if (status.value !== '') params.status = status.value
    if (createdBy.value) params.userId = createdBy.value

    const res = await getContractList(params)
    if (res.code === 200) {
      contractList.value = res.data?.records || []
      total.value = res.data?.total || 0
    }
  } catch (error) {
    ElMessage.error('获取合同列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getContracts()
}

const handleReset = () => {
  searchKeyword.value = ''
  supplierId.value = ''
  status.value = ''
  createdBy.value = ''
  currentPage.value = 1
  getContracts()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getContracts()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getContracts()
}

const handleDetail = async (id) => {
  try {
    const res = await getContractDetail(id)
    if (res.code === 200) {
      currentContract.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取合同详情失败')
  }
}

const handleAudit = (row) => {
  auditForm.id = row.id
  auditForm.contractNumber = row.contractNumber
  auditForm.title = row.title
  auditForm.status = 1
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const handleConfirmAudit = async () => {
  if (!auditFormRef.value) return
  await auditFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await auditContract({
          id: auditForm.id,
          status: auditForm.status,
          remark: auditForm.remark
        })
        if (res.code === 200) {
          ElMessage.success(auditForm.status === 1 ? '审核通过' : '审核已驳回')
          auditDialogVisible.value = false
          getContracts()
        }
      } catch (error) {
        ElMessage.error('审核操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleTerminate = async (id) => {
  try {
    await ElMessageBox.confirm('确定终止该合同吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    const res = await terminateContract(id)
    if (res.code === 200) {
      ElMessage.success('合同已终止')
      getContracts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('终止合同失败')
    }
  }
}

const getStatusType = (status) => {
  const statusMap = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已终止',
    3: '已驳回'
  }
  return statusMap[status] || '未知'
}
</script>

<style scoped>
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; margin: 0 0 8px 0; }
.page-description { font-size: 14px; color: #909399; margin: 0; }
.action-bar { display: flex; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.table-card { border-radius: 8px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
.file-info { margin-top: 10px; }
</style>