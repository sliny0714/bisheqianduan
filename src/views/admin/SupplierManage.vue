<template>
  <admin-layout>
    <div class="supplier-manage">
      <div class="page-header">
        <h1 class="page-title">供应商管理</h1>
        <p class="page-description">管理所有供应商信息与审核状态</p>
      </div>

    <div class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-item">
            <div class="stat-content">
              <div class="stat-number">{{ total }}</div>
              <div class="stat-label">总供应商数</div>
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
            <el-input v-model="searchKeyword" placeholder="搜索供应商名称" clearable style="width: 200px" @keyup.enter="handleSearch"></el-input>
            
            <el-select v-model="auditStatusFilter" placeholder="审核状态" clearable style="width: 150px">
              <el-option label="待审核" :value="0"></el-option>
              <el-option label="已通过" :value="1"></el-option>
              <el-option label="已驳回" :value="2"></el-option>
            </el-select>

            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
          <div class="action-bar">
            <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增</el-button>
            <el-dropdown>
              <el-button type="success"><el-icon><Download /></el-icon>导出</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="exportExcel">导出 Excel</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="suppliersList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="供应商名称" min-width="180"></el-table-column>
        <el-table-column prop="legalRep" label="法人" width="120"></el-table-column>
        <el-table-column prop="createByName" label="提交人" width="120"></el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" width="120">
          <template #default="scope">
            <el-tag :type="getAuditStatusType(scope.row.auditStatus)" effect="dark">
              {{ getAuditStatusText(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" type="primary" @click="handleDetail(scope.row)">详情</el-button>
              <el-button size="small" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>

              <el-button size="small" type="success" v-if="scope.row.auditStatus === 0 || scope.row.auditStatus === 2" @click="handleApprove(scope.row)">
                通过
              </el-button>
              <el-button size="small" type="danger" v-if="scope.row.auditStatus === 0" @click="handleReject(scope.row)">
                驳回
              </el-button>
              <el-button size="small" type="danger" v-if="scope.row.auditStatus === 1" @click="handleCancelQualification(scope.row)">
                取消资质
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination 
          v-model:current-page="currentPage" 
          v-model:page-size="pageSize"
          :total="total" 
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="供应商详情" width="900px">
      <el-descriptions v-if="currentSupplier" :column="2" border>
        <el-descriptions-item label="供应商ID">{{ currentSupplier.id }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ currentSupplier.name }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ currentSupplier.creditCode }}</el-descriptions-item>
        <el-descriptions-item label="法人">{{ currentSupplier.legalRep }}</el-descriptions-item>
        <el-descriptions-item label="所属行业">{{ currentSupplier.industry || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentSupplier.contactPerson || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentSupplier.contactPhone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ currentSupplier.address || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ currentSupplier.registeredCapital || '0' }}</el-descriptions-item>
        <el-descriptions-item label="成立日期">{{ currentSupplier.establishDate || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="经营范围" :span="2">{{ currentSupplier.businessScope || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="外部舆情" :span="2">{{ currentSupplier.externalNews || '无负面舆情' }}</el-descriptions-item>
        <el-descriptions-item label="财务快照" :span="2">{{ currentSupplier.financialSnapshot || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="资质文件">
          <template v-if="currentSupplier.qualificationFile">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <template v-if="isMultipleFiles(currentSupplier.qualificationFile)">
                <template v-for="(url, index) in currentSupplier.qualificationFile.split(',')" :key="index">
                  <el-link
                    :href="url.startsWith('http') ? url : 'http://localhost:8080' + (url.startsWith('/') ? url : '/' + url)"
                    target="_blank"
                    type="primary"
                  >
                    {{ index === 0 ? '营业执照' : index === 1 ? '法定代表人身份证' : '账户信息' }}
                  </el-link>
                </template>
              </template>
              <template v-else>
                <el-link
                  :href="currentSupplier.qualificationFile.startsWith('http') ? currentSupplier.qualificationFile : 'http://localhost:8080' + (currentSupplier.qualificationFile.startsWith('/') ? currentSupplier.qualificationFile : '/' + currentSupplier.qualificationFile)"
                  target="_blank"
                  type="primary"
                >
                  查看资质
                </el-link>
              </template>
            </div>
          </template>
          <el-tag v-else type="info">未上传</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交人">{{ currentSupplier.createByName || currentSupplier.userId || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentSupplier.createTime || '' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentSupplier.updateTime || '' }}</el-descriptions-item>

        <el-descriptions-item label="审核状态" :span="2" style="background:#f9f9f9">
          <el-tag :type="getAuditStatusType(currentSupplier.auditStatus)" size="large">
            {{ getAuditStatusText(currentSupplier.auditStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ currentSupplier.auditRemark || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ currentSupplier.auditBy || (currentSupplier.auditUserId === 1 ? '管理员' : currentSupplier.auditUserId) || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentSupplier.auditTime || '' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="success" v-if="currentSupplier && (currentSupplier.auditStatus === 0 || currentSupplier.auditStatus === 2)" @click="handleApprove(currentSupplier)">
            通过
          </el-button>
          <el-button type="danger" v-if="currentSupplier && currentSupplier.auditStatus === 0" @click="handleReject(currentSupplier)">
            驳回
          </el-button>
          <el-button type="danger" v-if="currentSupplier && currentSupplier.auditStatus === 1" @click="handleCancelQualification(currentSupplier)">
            取消资质
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑供应商' : '新增供应商'" width="850px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input v-model="formData.creditCode"></el-input>
        </el-form-item>
        <el-form-item label="法人" prop="legalRep">
          <el-input v-model="formData.legalRep"></el-input>
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-input v-model="formData.industry"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="formData.contactPerson"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="formData.contactPhone"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="经营范围" prop="businessScope">
          <el-input v-model="formData.businessScope" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="注册资本" prop="registeredCapital">
          <el-input v-model="formData.registeredCapital"></el-input>
        </el-form-item>
        <el-form-item label="成立日期" prop="establishDate">
          <el-date-picker v-model="formData.establishDate" type="date" style="width:100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="外部舆情">
          <el-input v-model="formData.externalNews" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="财务快照">
          <el-input v-model="formData.financialSnapshot" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="资质文件">
          <div class="qualification-group">
            <div class="qualification-item">
              <span class="label-text">营业执照</span>
              <el-upload
                :action="uploadUrl"
                :file-list="fileList1"
                name="qualificationFile"
                :on-success="(res) => handleUploadSuccess(res, 1)"
                :on-remove="() => { fileUrl1 = ''; fileList1 = [] }"
                :limit="1"
                accept=".jpg,.png,.pdf"
                :show-file-list="true"
              >
                <el-button size="small" type="primary">上传</el-button>
              </el-upload>
            </div>

            <div class="qualification-item">
              <span class="label-text">法定代表人身份证</span>
              <el-upload
                :action="uploadUrl"
                :file-list="fileList2"
                name="qualificationFile"
                :on-success="(res) => handleUploadSuccess(res, 2)"
                :on-remove="() => { fileUrl2 = ''; fileList2 = [] }"
                :limit="1"
                accept=".jpg,.png,.pdf"
                :show-file-list="true"
              >
                <el-button size="small" type="primary">上传</el-button>
              </el-upload>
            </div>

            <div class="qualification-item">
              <span class="label-text">账户信息</span>
              <el-upload
                :action="uploadUrl"
                :file-list="fileList3"
                name="qualificationFile"
                :on-success="(res) => handleUploadSuccess(res, 3)"
                :on-remove="() => { fileUrl3 = ''; fileList3 = [] }"
                :limit="1"
                accept=".jpg,.png,.pdf"
                :show-file-list="true"
              >
                <el-button size="small" type="primary">上传</el-button>
              </el-upload>
            </div>
          </div>
          <div v-if="isEdit && oldQualificationPath" style="margin-top:8px;">
            <el-tag type="success" size="small">当前已上传：资质文件</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="审核状态" v-if="!isEdit">
          <el-tag type="info">待审核</el-tag>
          <input type="hidden" v-model="formData.auditStatus">
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from './layout/AdminLayout.vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download } from '@element-plus/icons-vue'
import request from '../../api/request'
import { addSupplier, updateSupplier } from '../../api/user/supplier'
import * as XLSX from 'xlsx'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const auditStatusFilter = ref(null)
const suppliersList = ref([])
const selectedSuppliers = ref([])

const detailDialogVisible = ref(false)
const currentSupplier = ref(null)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const submitting = ref(false)

const oldQualificationPath = ref('')
const uploadUrl = 'http://localhost:8080/supplier/test/upload'
const fileList1 = ref([])
const fileList2 = ref([])
const fileList3 = ref([])
const fileUrl1 = ref('')
const fileUrl2 = ref('')
const fileUrl3 = ref('')

const formData = reactive({
  id: null,
  name: '',
  creditCode: '',
  legalRep: '',
  industry: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  businessScope: '',
  registeredCapital: '',
  establishDate: '',
  externalNews: '无负面舆情',
  financialSnapshot: '',
  qualificationFile: null,
  auditStatus: 0,
  userId: null
})

const formRules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  creditCode: [{ required: true, message: '请输入信用代码', trigger: 'blur' }, { len: 18, message: '18位统一社会信用代码' }],
  legalRep: [{ required: true, message: '请输入法人', trigger: 'blur' }],
  industry: [{ required: true, message: '请输入行业', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^\d{11}$/, message: '请输入 11 位手机号码', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  businessScope: [{ required: true, message: '请输入经营范围', trigger: 'blur' }],
  registeredCapital: [],
  establishDate: []
}

const getSuppliersList = async () => {
  loading.value = true
  const res = await request.get('/supplier/list', {
    params: { pageNum: currentPage.value, pageSize: pageSize.value, keyword: searchKeyword.value, auditStatus: auditStatusFilter.value }
  })
  const suppliers = res.data.records || []
  const userIds = [...new Set(suppliers.map(s => s.userId).filter(Boolean))]
  const userMap = new Map()

  if (userIds.length > 0) {
    for (const userId of userIds) {
      try {
        const userRes = await request.get('/user/detail', { params: { id: userId } })
        if (userRes.code === 200 && userRes.data) {
          userMap.set(userId, userRes.data.real_name || userRes.data.realName || userRes.data.name || userId)
        }
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }
    }
  }

  suppliersList.value = suppliers.map(s => ({
    ...s,
    createByName: userMap.get(s.userId) || s.userId || '未知'
  }))

  total.value = res.data.total || 0
  loading.value = false
}

const handleSearch = () => { currentPage.value = 1; getSuppliersList() }
const handleSizeChange = (size) => { pageSize.value = size; getSuppliersList() }
const handleCurrentChange = (current) => { currentPage.value = current; getSuppliersList() }
const handleSelectionChange = (val) => { selectedSuppliers.value = val }

const handleDetail = async (row) => {
  const res = await request.get('/supplier/detail', { params: { id: row.id } })
  currentSupplier.value = res.data
  try {
    const uid = res.data.userId
    if (uid) {
      const u = await request.get('/user/detail', { params: { id: uid } })
      currentSupplier.value.createByName = u.data.realName || u.data.name || uid
    }
  } catch (e) {}
  try {
    const aid = res.data.auditUserId
    if (aid) {
      const u = await request.get('/user/detail', { params: { id: aid } })
      currentSupplier.value.auditBy = u.data.realName || u.data.name || '管理员'
    }
  } catch (e) {}
  detailDialogVisible.value = true
}

const handleUploadSuccess = (res, type) => {
  console.log('上传返回', res)
  let url = ''
  if (res.code === 200) {
    url = Array.isArray(res.data) ? res.data[0] : res.data
  }
  if (!url) {
    ElMessage.error('获取文件地址失败')
    return
  }
  if (type === 1) {
    fileUrl1.value = url
    fileList1.value = [{ name: '营业执照', url }]
  }
  if (type === 2) {
    fileUrl2.value = url
    fileList2.value = [{ name: '法定代表人身份证', url }]
  }
  if (type === 3) {
    fileUrl3.value = url
    fileList3.value = [{ name: '账户信息', url }]
  }
  ElMessage.success('上传成功')
}

const getQualificationString = () => {
  return [fileUrl1.value, fileUrl2.value, fileUrl3.value].filter(Boolean).join(',')
}

// 已修复：新增自动带入当前登录用户userId
const handleAdd = () => {
  isEdit.value = false
  oldQualificationPath.value = ''
  fileList1.value = []
  fileList2.value = []
  fileList3.value = []
  fileUrl1.value = ''
  fileUrl2.value = ''
  fileUrl3.value = ''

  // 读取本地登录用户
  const loginUser = JSON.parse(localStorage.getItem('user') || '{}')

  Object.assign(formData, {
    id: null, name: '', creditCode: '', legalRep: '', industry: '',
    contactPerson: '', contactPhone: '', address: '', businessScope: '',
    registeredCapital: '', establishDate: '', externalNews: '无负面舆情',
    financialSnapshot: '', qualificationFile: null, auditStatus: 0,
    userId: loginUser.id || 1
  })
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  fileList1.value = []
  fileList2.value = []
  fileList3.value = []
  fileUrl1.value = ''
  fileUrl2.value = ''
  fileUrl3.value = ''
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    creditCode: row.creditCode,
    legalRep: row.legalRep,
    industry: row.industry,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    address: row.address,
    businessScope: row.businessScope,
    registeredCapital: row.registeredCapital,
    establishDate: row.establishDate,
    externalNews: row.externalNews,
    financialSnapshot: row.financialSnapshot,
    qualificationFile: null,
    auditStatus: row.auditStatus,
    userId: row.userId
  })
  oldQualificationPath.value = row.qualificationFile || ''
  formDialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  
  // 构建请求数据
  const requestData = {
    name: formData.name,
    creditCode: formData.creditCode,
    legalRep: formData.legalRep,
    industry: formData.industry,
    contactPerson: formData.contactPerson,
    contactPhone: formData.contactPhone,
    address: formData.address,
    businessScope: formData.businessScope,
    registeredCapital: formData.registeredCapital.toString().replace(/[^0-9.]/g, ''),
    establishDate: formData.establishDate,
    externalNews: formData.externalNews,
    financialSnapshot: formData.financialSnapshot
  }
  
  // 处理资质文件
  const qualificationString = getQualificationString()
  if (qualificationString) {
    requestData.qualificationFile = qualificationString
  } else if (isEdit.value && oldQualificationPath.value) {
    requestData.qualificationFile = oldQualificationPath.value
  }

  // 编辑模式需要添加id和auditStatus
  if (isEdit.value) {
    requestData.id = formData.id
    requestData.auditStatus = formData.auditStatus
  }

  console.log('是否编辑模式:', isEdit.value)
  console.log('formData.id:', formData.id)
  console.log('请求数据:', requestData)
  console.log('用户ID:', formData.userId)

  try {
    if (isEdit.value) {
      await updateSupplier(requestData, formData.userId)
    } else {
      await addSupplier(requestData, formData.userId)
    }
    ElMessage.success('保存成功')
    formDialogVisible.value = false
    getSuppliersList()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await request.get('/supplier/delete', { params: { id: row.id } })
    ElMessage.success('删除成功')
    getSuppliersList()
  } catch (error) {
    // 捕获用户取消操作，不做任何处理
  }
}

const openQualificationFile = () => {
  if (!currentSupplier.value?.qualificationFile) {
    ElMessage.warning('无文件')
    return
  }
  let url = currentSupplier.value.qualificationFile
  if (isMultipleFiles(url)) url = url.split(',')[0]
  if (!url.startsWith('http')) url = 'http://localhost:8080' + (url.startsWith('/') ? url : '/' + url)
  window.open(encodeURI(url), '_blank')
}

const isMultipleFiles = (file) => {
  return typeof file === 'string' && file.includes(',')
}

const handleApprove = async (row) => {
  const { value } = await ElMessageBox.prompt('请输入通过理由', '审核通过', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  if (!value) return
  await request.post('/supplier/audit', {}, {
    params: { id: row.id, auditStatus: 1, auditRemark: value, auditUserId: 1 }
  })
  ElMessage.success('审核通过')
  detailDialogVisible.value = false
  getSuppliersList()
}

const handleReject = async (row) => {
  const { value } = await ElMessageBox.prompt('请输入驳回理由', '审核驳回', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  if (!value) return
  await request.post('/supplier/audit', {}, {
    params: { id: row.id, auditStatus: 2, auditRemark: value, auditUserId: 1 }
  })
  ElMessage.success('已驳回')
  detailDialogVisible.value = false
  getSuppliersList()
}

const handleCancelQualification = async (row) => {
  const { value } = await ElMessageBox.prompt('请输入取消资质理由', '取消资质', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  if (!value) return
  await request.post('/supplier/audit', {}, {
    params: { id: row.id, auditStatus: 2, auditRemark: '[取消资质] ' + value, auditUserId: 1 }
  })
  ElMessage.success('已取消资质')
  detailDialogVisible.value = false
  getSuppliersList()
}

const pendingCount = computed(() => suppliersList.value.filter(i => i.auditStatus === 0).length)
const approvedCount = computed(() => suppliersList.value.filter(i => i.auditStatus === 1).length)
const rejectedCount = computed(() => suppliersList.value.filter(i => i.auditStatus === 2).length)

const getAuditStatusType = (s) => {
  if (s === 0) return 'warning'
  if (s === 1) return 'success'
  if (s === 2) return 'danger'
  return ''
}

const getAuditStatusText = (s) => {
  if (s === 0) return '待审核'
  if (s === 1) return '已通过'
  if (s === 2) return '已驳回'
  return '未知'
}

// 导出 Excel 功能
const exportExcel = () => {
  if (suppliersList.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  // 准备导出数据
  const exportData = suppliersList.value.map(item => ({
    'ID': item.id,
    '供应商名称': item.name,
    '法人': item.legalRep,
    '提交人': item.createByName,
    '审核状态': getAuditStatusText(item.auditStatus),
    '创建时间': item.createTime || '',
    '更新时间': item.updateTime || ''
  }))
  
  // 创建工作簿和工作表
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '供应商列表')
  
  // 导出文件
  XLSX.writeFile(wb, `供应商列表_${new Date().toISOString().slice(0, 10)}.xlsx`)
  
  ElMessage.success('导出成功')
}

onMounted(getSuppliersList)
</script>

<style scoped>
.supplier-manage {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; margin:0 0 8px 0; }
.page-description { font-size:14px; color:#909399; }
.stats-card { margin-bottom:24px; }
.stat-item { border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.05); border:none; }
.stat-content { padding:20px; text-align:center; }
.stat-number { font-size:28px; font-weight:600; color:#409eff; margin-bottom:6px; }
.stat-label { font-size:13px; color:#909399; }
.stat-item.warning .stat-number { color:#e6a23c; }
.stat-item.success .stat-number { color:#67c23a; }
.stat-item.danger .stat-number { color:#f56c6c; }
.table-card { border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.05); border:none; }
.card-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.search-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.action-bar { display:flex; gap:10px; }
.pagination { margin-top:20px; justify-content:flex-end; display:flex; }
.action-group { display:flex; gap:6px; flex-wrap:wrap; }
.dialog-footer { display:flex; gap:10px; justify-content:flex-end; }

.qualification-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.qualification-item {
  display: flex;
  align-items: center;
  gap: 15px;
}
.label-text {
  width: 130px;
  font-weight: 500;
}
</style>