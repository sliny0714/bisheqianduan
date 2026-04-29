<template>
  <div class="add-supplier-container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/supplier/my/list' }">我的供应商管理</el-breadcrumb-item>
      <el-breadcrumb-item>新增供应商</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">新增供应商</h1>
      <p class="page-description">填写供应商信息，提交后等待审核</p>
    </div>

    <el-card class="form-card">
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="140px"
        class="supplier-form"
        :max-width="800"
      >
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
                placeholder="请输入注册资本(万元)"
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
                <div class="qualification-item">
                  <span class="label-text">营业执照</span>
                  <el-upload
                    :action="uploadUrl"
                    :file-list="fileList1"
                    name="qualificationFile"
                    :on-success="(res) => handleUploadSuccess(res, 1)"
                    :on-change="(file) => { if (file && file.raw) file1.value = file.raw }"
                    :on-remove="() => { fileUrl1.value = ''; file1.value = null }"
                    :limit="1"
                    accept=".jpg,.png,.pdf"
                    :show-file-list="true"
                    :auto-upload="true"
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
                    :on-change="(file) => { if (file && file.raw) file2.value = file.raw }"
                    :on-remove="() => { fileUrl2.value = ''; file2.value = null }"
                    :limit="1"
                    accept=".jpg,.png,.pdf"
                    :show-file-list="true"
                    :auto-upload="true"
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
                    :on-change="(file) => { if (file && file.raw) file3.value = file.raw }"
                    :on-remove="() => { fileUrl3.value = ''; file3.value = null }"
                    :limit="1"
                    accept=".jpg,.png,.pdf"
                    :show-file-list="true"
                    :auto-upload="true"
                  >
                    <el-button size="small" type="primary">上传</el-button>
                  </el-upload>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { addSupplier } from '../../api/user/supplier'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const uploadUrl = 'http://localhost:8080/supplier/test/upload'

const fileList1 = ref([])
const fileList2 = ref([])
const fileList3 = ref([])
const fileUrl1 = ref('')
const fileUrl2 = ref('')
const fileUrl3 = ref('')
const file1 = ref(null)
const file2 = ref(null)
const file3 = ref(null)

// 处理上传成功
const handleUploadSuccess = (res, type) => {
  console.log('上传返回', res)
  let url = ''
  if (res.code === 200) {
    if (Array.isArray(res.data)) {
      url = res.data[0]
      console.log('上传返回数组，取第一个元素:', url)
    } else if (res.data) {
      url = res.data
      console.log('上传返回非数组:', url)
    } else {
      console.log('上传返回数据为空')
    }
  } else {
    console.log('上传返回code不是200:', res.code)
  }
  console.log('最终url:', url)
  if (!url) {
    ElMessage.error('获取文件地址失败')
    return
  }
  
  
  if (type === 1) {
    fileUrl1.value = url
    fileList1.value = [{ name: '营业执照', url: url }] // 新增这行
    console.log('设置fileUrl1:', fileUrl1.value)
  }
  if (type === 2) {
    fileUrl2.value = url
    fileList2.value = [{ name: '法定代表人身份证', url: url }] // 新增这行
    console.log('设置fileUrl2:', fileUrl2.value)
  }
  if (type === 3) {
    fileUrl3.value = url
    fileList3.value = [{ name: '账户信息', url: url }] // 新增这行
    console.log('设置fileUrl3:', fileUrl3.value)
  }
  
  ElMessage.success('上传成功')
}

const getQualificationString = () => {
  const urls = [fileUrl1.value, fileUrl2.value, fileUrl3.value]
  console.log('获取资质文件字符串，原始URLs:', urls)
  const filteredUrls = urls.filter(Boolean)
  console.log('过滤后URLs:', filteredUrls)
  const result = filteredUrls.join(',')
  console.log('最终资质文件字符串:', result)
  return result
}

const form = reactive({
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
  externalNews: '无负面舆情',
  financialSnapshot: '',
  qualificationFile: '',
  auditStatus: 0,
  userId: ''
})

const rules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  creditCode: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    { min: 18, max: 18, message: '18 位信用代码', trigger: 'blur' }
  ],
  legalRep: [{ required: true, message: '请输入法定代表人', trigger: 'blur' }],
  industry: [{ required: true, message: '请输入所属行业', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^\d{11}$/, message: '11 位手机号', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  businessScope: [{ required: true, message: '请输入经营范围', trigger: 'blur' }],
  registeredCapital: [],
  establishDate: []
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) form.userId = user.id
})

const handleSubmit = async () => {
  await formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const qualificationFileString = getQualificationString()
      console.log('资质文件字符串:', qualificationFileString)
      console.log('提交前的fileUrl1:', fileUrl1.value)
      console.log('提交前的fileUrl2:', fileUrl2.value)
      console.log('提交前的fileUrl3:', fileUrl3.value)
      
      // 构建请求数据
      const requestData = {
        name: form.name,
        creditCode: form.creditCode,
        legalRep: form.legalRep,
        industry: form.industry,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        address: form.address,
        businessScope: form.businessScope,
        registeredCapital: form.registeredCapital.toString().replace(/[^0-9.]/g, ''),
        establishDate: form.establishDate,
        externalNews: form.externalNews,
        financialSnapshot: form.financialSnapshot
      }
      
      // 处理资质文件
      if (qualificationFileString) {
        requestData.qualificationFile = qualificationFileString
      }

      console.log('请求数据:', requestData)
      console.log('用户ID:', form.userId)
      
      const res = await addSupplier(requestData, form.userId)
      console.log('提交响应:', res)
      if (res.code === 200) {
        ElMessage.success('提交成功')
        router.push('/supplier/my/list')
      }
    } catch (err) {
      console.error('提交失败:', err)
      ElMessage.error('提交失败')
    } finally {
      loading.value = false
    }
  })
}

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
.add-supplier-container {
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