<template>
  <div class="edit-supplier-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/supplier/my/list' }">我的供应商管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑供应商</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">编辑供应商</h1>
      <p class="page-description">修改供应商信息并提交</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 供应商表单 -->
    <el-card class="form-card" v-else>
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="140px"
        class="supplier-form"
        :max-width="800"
      >
        <!-- 基础信息区 -->
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入供应商名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码" prop="creditCode">
              <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法定代表人" prop="legalRep">
              <el-input v-model="form.legalRep" placeholder="请输入法定代表人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属行业" prop="industry">
              <el-input v-model="form.industry" placeholder="请输入所属行业" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 联系信息区 -->
        <el-divider content-position="left">联系信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="地址" prop="address">
              <el-input
                v-model="form.address"
                placeholder="请输入地址"
                type="textarea"
                rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 工商详细信息区 -->
        <el-divider content-position="left">工商详细信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="经营范围" prop="businessScope">
              <el-input
                v-model="form.businessScope"
                placeholder="请输入经营范围"
                type="textarea"
                rows="4"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册资本(万元)" prop="registeredCapital">
              <el-input-number
                v-model="form.registeredCapital"
                :min="0"
                :precision="2"
                placeholder="请输入注册资本"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成立日期" prop="establishDate">
              <el-date-picker
                v-model="form.establishDate"
                type="date"
                placeholder="请选择成立日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 补充信息区 -->
        <el-divider content-position="left">补充信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="外部舆情" prop="externalNews">
              <el-input
                v-model="form.externalNews"
                placeholder="请输入外部舆情"
                type="textarea"
                rows="3"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="财务快照" prop="financialSnapshot">
              <el-input
                v-model="form.financialSnapshot"
                placeholder="请输入财务快照"
                type="textarea"
                rows="3"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="资质文件">
              <div class="qualification-group">
                <!-- 1. 营业执照 -->
                <div class="qualification-item">
                  <span class="label-text">营业执照</span>
                  <el-upload
                    :action="uploadUrl"
                    :file-list="fileList1"
                    :on-success="(res) => handleUploadSuccess(res, 1)"
                    :on-remove="() => { fileUrl1.value = '' }"
                    :limit="1"
                    accept=".jpg,.png,.pdf"
                    :with-credentials="false"
                    name="qualificationFile"
                    :auto-upload="true"
                  >
                    <el-button size="small" type="primary">上传</el-button>
                  </el-upload>
                </div>

                <!-- 2. 法定代表人身份证 -->
                <div class="qualification-item">
                  <span class="label-text">法定代表人身份证</span>
                  <el-upload
                    :action="uploadUrl"
                    :file-list="fileList2"
                    :on-success="(res) => handleUploadSuccess(res, 2)"
                    :on-remove="() => { fileUrl2.value = '' }"
                    :limit="1"
                    accept=".jpg,.png,.pdf"
                    :with-credentials="false"
                    name="qualificationFile"
                    :auto-upload="true"
                  >
                    <el-button size="small" type="primary">上传</el-button>
                  </el-upload>
                </div>

                <!-- 3. 账户信息 -->
                <div class="qualification-item">
                  <span class="label-text">账户信息</span>
                  <el-upload
                    :action="uploadUrl"
                    :file-list="fileList3"
                    :on-success="(res) => handleUploadSuccess(res, 3)"
                    :on-remove="() => { fileUrl3.value = '' }"
                    :limit="1"
                    accept=".jpg,.png,.pdf"
                    :with-credentials="false"
                    name="qualificationFile"
                    :auto-upload="true"
                  >
                    <el-button size="small" type="primary">上传</el-button>
                  </el-upload>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="审核状态" prop="auditStatus">
          <el-select v-model="form.auditStatus" disabled>
            <el-option label="待审核" :value="0" />
            <el-option label="通过" :value="1" />
            <el-option label="驳回" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { getSupplierDetail, updateSupplier } from '../../api/user/supplier'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(true)
const submitting = ref(false)

// 三个固定资质文件
const fileList1 = ref([])
const fileList2 = ref([])
const fileList3 = ref([])
const fileUrl1 = ref('')
const fileUrl2 = ref('')
const fileUrl3 = ref('')

// 表单数据
const form = reactive({
  id: '',
  name: '',
  creditCode: '',
  legalRep: '',
  industry: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  businessScope: '',
  registeredCapital: 0,
  establishDate: '',
  externalNews: '',
  financialSnapshot: '',
  qualificationFile: '',
  auditStatus: 0,
  userId: ''
})

// 验证规则
const rules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  creditCode: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    { min: 18, max: 18, message: '请输入有效的18位统一社会信用代码', trigger: 'blur' }
  ],
  legalRep: [{ required: true, message: '请输入法定代表人', trigger: 'blur' }],
  industry: [{ required: true, message: '请输入所属行业', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^\d{11}$/, message: '请输入 11 位手机号码', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  businessScope: [{ required: true, message: '请输入经营范围', trigger: 'blur' }],
  registeredCapital: [
    { required: true, message: '请输入注册资本(万元)', trigger: 'blur' },
  ],
  establishDate: [{ required: true, message: '请选择成立日期', trigger: 'blur' }]
}

// 加载数据
onMounted(() => {
  const supplierId = route.params.id
  if (supplierId) {
    getSupplierInfo(supplierId)
    const user = JSON.parse(localStorage.getItem('user'))
    form.userId = user.id
  }
})

// 获取详情
const getSupplierInfo = async (id) => {
  loading.value = true
  try {
    const res = await getSupplierDetail(id)
    if (res.code === 200) {
      Object.assign(form, res.data)
      const qf = res.data.qualificationFile
      if (qf) {
        const arr = qf.split(',').filter(Boolean)
        if (arr[0]) { fileList1.value = [{ name: '营业执照', url: arr[0] }] }
        if (arr[1]) { fileList2.value = [{ name: '法人身份证', url: arr[1] }] }
        if (arr[2]) { fileList3.value = [{ name: '账户信息', url: arr[2] }] }
      }
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

// 上传地址
const uploadUrl = 'http://localhost:8080/supplier/test/upload'

// 修复上传成功解析
const handleUploadSuccess = (res, type) => {
  console.log("上传返回", res)
  let url = ""
  if (res.code === 200) url = res.data
  else if (res.url) url = res.url
  else url = res

  if (type === 1) fileUrl1.value = url
  if (type === 2) fileUrl2.value = url
  if (type === 3) fileUrl3.value = url
  ElMessage.success("上传成功")
}

// 拼接资质字符串
const getQualificationString = () => {
  return [fileUrl1.value, fileUrl2.value, fileUrl3.value].filter(Boolean).join(',')
}

// 最终修复：完全匹配后端 @RequestParam
const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const formData = new FormData()
      formData.append('id', form.id)
      formData.append('name', form.name)
      formData.append('creditCode', form.creditCode)
      formData.append('legalRep', form.legalRep)
      formData.append('industry', form.industry)
      formData.append('contactPerson', form.contactPerson)
      formData.append('contactPhone', form.contactPhone)
      formData.append('address', form.address)
      formData.append('businessScope', form.businessScope)
      formData.append('registeredCapital', form.registeredCapital)
      formData.append('establishDate', form.establishDate)
      formData.append('externalNews', form.externalNews || '')
      formData.append('financialSnapshot', form.financialSnapshot || '')
      formData.append('auditStatus', form.auditStatus)
      formData.append('userId', form.userId)

      // 拼接好的三个文件路径字符串
      const qs = getQualificationString()
      if (qs) {
        formData.append('qualificationFile', qs)
      }

      const res = await updateSupplier(formData, form.userId)
      if (res.code === 200) {
        ElMessage.success('修改成功')
        router.push('/supplier/my/list')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('提交失败')
    } finally {
      submitting.value = false
    }
  })
}

// 取消
const handleCancel = () => {
  router.push('/supplier/my/list')
}
</script>

<style scoped>
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
.edit-supplier-container {
  padding: 24px;
  background: #f8fafc;
  min-height: calc(100vh - 64px);
}
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 32px; }
.page-title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.form-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.supplier-form { max-width: 800px; margin: 0 auto; padding: 20px 0; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
</style>