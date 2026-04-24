<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>年审管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的年审</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">我的年审</h1>
      <p class="page-description">管理您的供应商年度审核记录</p>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="handleSubmit">
        <el-icon><DocumentAdd /></el-icon>
        提交{{ currentYear }}年年审
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="annualReviewList" border stripe>
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
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 1 || scope.row.status === 3"
              type="danger"
              size="small"
              @click="handleDelete(scope.row.id)"
            >
              撤回
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleViewResult(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="empty-text" v-if="!loading && annualReviewList.length === 0">
        暂无数据
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10,20,50,100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getAnnualReviews"
          @current-change="getAnnualReviews"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="提交年审" width="600px">
      <el-form :model="annualForm" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="选择供应商" prop="supplierId">
          <el-select v-model="annualForm.supplierId" placeholder="请选择供应商" style="width:100%">
            <el-option
              v-for="s in supplierList"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年审年份">
          <el-input v-model="annualForm.reviewYear" disabled />
        </el-form-item>
        <el-form-item label="上传材料">
          <el-upload
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".jpg,.jpeg,.png,.pdf"
            :limit="5"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSubmit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resultDialogVisible" title="详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="供应商">{{ currentReview?.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="年份">{{ currentReview?.reviewYear }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentReview?.status)">
            {{ getStatusText(currentReview?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核意见">{{ currentReview?.reviewRemark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="文件">
          <span v-if="!currentReview?.annualFiles">无</span>
          <a
            v-for="(f,i) in (currentReview?.annualFiles || '').split(',')"
            :key="i"
            :href="`http://localhost:8080/uploads/${f}`"
            target="_blank"
            style="margin-right:8px;color:#409eff"
          >
            文件{{ i + 1 }}
          </a>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </UserLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentAdd } from '@element-plus/icons-vue'
import { getMyAnnualReviewList, submitAnnualReview, withdrawAnnualReview } from '../../api/user/business'
import { getMySupplierList } from '../../api/user/supplier'
import UserLayout from './layout/UserLayout.vue'

const router = useRouter()
const currentYear = new Date().getFullYear()

const loading = ref(false)
const annualReviewList = ref([])
const supplierList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const resultDialogVisible = ref(false)
const submitting = ref(false)
const currentReview = ref(null)
const formRef = ref(null)

const annualForm = reactive({
  supplierId: '',
  reviewYear: currentYear + '',
  files: []
})

const rules = {
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }]
}

onMounted(async () => {
  await getSuppliers()
  getAnnualReviews()
})

const getAnnualReviews = async () => {
  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getMyAnnualReviewList({
      userId: user.id,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    annualReviewList.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('获取年审列表失败', error)
    ElMessage.error('获取年审列表失败')
  } finally {
    loading.value = false
  }
}

const getSuppliers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getMySupplierList({ userId: user.id })
    supplierList.value = res.data?.records || []
  } catch (error) {
    console.error('获取供应商列表失败', error)
    ElMessage.error('获取供应商列表失败')
  }
}

const getStatusText = (s) => ({ 0: '待提交', 1: '待审核', 2: '已通过', 3: '已驳回' }[s] || '未知')
const getStatusType = (s) => ({ 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }[s] || 'info')

const handleSubmit = () => {
  annualForm.supplierId = ''
  annualForm.files = []
  annualForm.reviewYear = currentYear + ''
  dialogVisible.value = true
}

const handleFileChange = (file) => {
  annualForm.files.push(file.raw)
}

const handleConfirmSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    const user = JSON.parse(localStorage.getItem('user'))
    const fd = new FormData()
    fd.append('userId', user.id)
    fd.append('supplierId', annualForm.supplierId)
    fd.append('reviewYear', annualForm.reviewYear)
    annualForm.files.forEach(f => fd.append('files', f))

    const res = await submitAnnualReview(fd)

    if (res.code === 200) {
      // ✅ 改提示文案
      ElMessage.success(res.msg || '年审提交成功，请等待管理员审核')

      dialogVisible.value = false
      await getAnnualReviews()

      // ❌ 删除跳转订单页
      // router.push('/order/my')
    } else {
      ElMessage.error(res.msg || '年审提交失败')
    }
  } catch (error) {
    console.error('年审提交失败', error)
    ElMessage.error('年审提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}


const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定撤回？', '提示', {
      type: 'warning'
    })
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await withdrawAnnualReview(id, user.id)
    if (res.code === 200) {
      ElMessage.success('撤回成功')
      getAnnualReviews()
    } else {
      ElMessage.error(res.msg || '撤回失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤回失败', error)
      ElMessage.error('撤回失败')
    }
  }
}

const handleViewResult = (row) => {
  currentReview.value = row
  resultDialogVisible.value = true
}
</script>

<style scoped>
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.action-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.table-card { border-radius: 12px; }
.empty-text { padding: 40px 0; text-align: center; color: #909399; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
