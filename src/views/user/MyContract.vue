<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商务管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的合同</el-breadcrumb-item>
    </el-breadcrumb> <div class="page-header">
      <h1 class="page-title">合同管理</h1>
      <p class="page-description">管理我创建的合同</p>
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
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="default" @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button type="primary" @click="handleAdd" style="margin-left: auto;">
        <el-icon><Plus /></el-icon>
        新增合同
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
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleDetail(scope.row.id)"
            >
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button
              v-if="scope.row.status !== 2"
              type="success"
              size="small"
              @click="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon> 编辑
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

    <!-- 新增/编辑合同弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form :model="contractForm" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="合同编号" prop="contractNumber">
          <el-input v-model="contractForm.contractNumber" placeholder="请输入合同编号" />
        </el-form-item>
        <el-form-item label="合同标题" prop="title">
          <el-input v-model="contractForm.title" placeholder="请输入合同标题" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select v-model="contractForm.supplierId" placeholder="请选择供应商" style="width: 100%">
            <el-option
              v-for="supplier in supplierList"
              :key="supplier.id"
              :label="supplier.name"
              :value="supplier.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合同类型" prop="type">
          <el-input v-model="contractForm.type" placeholder="请输入合同类型" />
        </el-form-item>
        <el-form-item label="合同金额" prop="amount">
          <el-input v-model.number="contractForm.amount" placeholder="请输入合同金额" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="contractForm.startDate" type="date" placeholder="选择开始日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="contractForm.endDate" type="date" placeholder="选择结束日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="contractForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已终止" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            :limit="1"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <div v-if="contractForm.filePath" class="file-info">
            <el-tag type="success">已上传附件</el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>

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
  </UserLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Close } from '@element-plus/icons-vue'
import UserLayout from './layout/UserLayout.vue'
import { formatDate, formatDateOnly } from '../../utils/date'
import {
  getUserContractList,
  getContractDetail,
  saveContract,
  getSupplierList,
  terminateContract
} from '../../api/user/business'

const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const formRef = ref(null)
const currentContract = ref(null)
const contractList = ref([])
const supplierList = ref([])
const dialogTitle = ref('新增合同')

const contractForm = reactive({
  id: '',
  contractNumber: '',
  title: '',
  supplierId: '',
  type: '',
  amount: '',
  startDate: '',
  endDate: '',
  status: 0,
  filePath: ''
})

const rules = {
  contractNumber: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入合同标题', trigger: 'blur' }],
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  type: [{ required: true, message: '请输入合同类型', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入合同金额', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

onMounted(() => {
  loadSuppliers()
  getContracts()
})

const loadSuppliers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getSupplierList(user.id)
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
    const user = JSON.parse(localStorage.getItem('user'))
    const params = {
      userId: user.id,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchKeyword.value) params.keyword = searchKeyword.value

    const res = await getUserContractList(params)
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

const handleAdd = () => {
  dialogTitle.value = '新增合同'
  Object.assign(contractForm, {
    id: '',
    contractNumber: '',
    title: '',
    supplierId: '',
    type: '',
    amount: '',
    startDate: '',
    endDate: '',
    status: 0,
    filePath: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑合同'
  Object.assign(contractForm, {
    id: row.id,
    contractNumber: row.contractNumber,
    title: row.title,
    supplierId: row.supplierId,
    type: row.type,
    amount: row.amount,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    filePath: row.filePath
  })
  dialogVisible.value = true
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

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await saveContract(contractForm)
        if (res.code === 200) {
          ElMessage.success(contractForm.id ? '更新成功' : '创建成功')
          dialogVisible.value = false
          getContracts()
        }
      } catch (error) {
        ElMessage.error(contractForm.id ? '更新失败' : '创建失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleTerminate = async (id) => {
  try {
    const res = await terminateContract(id)
    if (res.code === 200) {
      ElMessage.success('合同已终止')
      getContracts()
    }
  } catch (error) {
    ElMessage.error('终止合同失败')
  }
}

const handleFileChange = (file) => {
  // 这里需要实现文件上传逻辑
  // 暂时模拟文件上传成功
  contractForm.filePath = file.name
  ElMessage.success('文件上传成功')
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