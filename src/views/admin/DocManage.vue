<template>
  <admin-layout>
    <div>
      <el-card header="文档知识库管理">
        <!-- 上传区域 -->
        <div class="upload-section">
          <el-input v-model="uploadTitle" placeholder="请输入文档标题" style="width: 300px; margin-bottom: 20px;" />
          
          <div class="file-upload-area">
            <input 
              type="file" 
              accept=".txt" 
              @change="handleFileChange"
              style="display: none;"
              ref="fileInput"
            />
            <el-button @click="triggerFileInput">选择文件</el-button>
            <span v-if="selectedFileName" class="file-name">{{ selectedFileName }}</span>
          </div>
          
          <el-button 
            type="primary" 
            @click="submitUpload" 
            :loading="loading"
            style="margin-top: 20px;"
          >
            上传并向量化
          </el-button>
        </div>

        <!-- 表格 -->
        <el-table :data="tableData" border style="margin-top: 30px;">
          <el-table-column label="ID" prop="id" width="70" />
          <el-table-column label="文档标题" prop="title" />
          <el-table-column label="上传时间" prop="createTime" />
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from './layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { getDocList, deleteDoc, uploadDoc } from '../../api/rag'

const tableData = ref([])
const uploadTitle = ref('')
const uploadFile = ref(null)
const loading = ref(false)
const fileInput = ref(null)
const selectedFileName = ref('')

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile.value = file
    selectedFileName.value = file.name
    console.log('选择的文件:', file)
  }
}

// 上传
const submitUpload = async () => {
  console.log("点击上传")
  console.log("上传标题:", uploadTitle.value)
  console.log("上传文件:", uploadFile.value)

  if (!uploadTitle.value) {
    console.log("缺少标题")
    ElMessage.warning("请输入标题")
    return
  }
  if (!uploadFile.value) {
    console.log("缺少文件")
    ElMessage.warning("请选择文件")
    return
  }

  console.log("开始上传")
  loading.value = true
  try {
    const formData = new FormData()
    formData.append("title", uploadTitle.value)
    formData.append("file", uploadFile.value)
    console.log("FormData:", formData)

    console.log("调用 uploadDoc API")
    const response = await uploadDoc(formData)
    console.log("上传响应:", response)
    ElMessage.success("上传成功！")

    uploadTitle.value = ""
    uploadFile.value = null
    selectedFileName.value = ""
    // 重置文件输入框
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    await loadData()
  } catch (err) {
    console.error("上传错误:", err)
    ElMessage.error("上传失败")
  } finally {
    loading.value = false
    console.log("上传完成")
  }
}

// 加载文档列表
const loadData = async () => {
  try {
    const res = await getDocList()
    console.log('获取文档列表响应:', res)
    // 处理不同的返回结构
    if (res && res.data) {
      if (res.data.records) {
        tableData.value = res.data.records
      } else if (res.data.data && res.data.data.records) {
        tableData.value = res.data.data.records
      } else if (res.data.data) {
        tableData.value = res.data.data
      } else {
        tableData.value = []
      }
    } else {
      tableData.value = []
    }
  } catch (err) {
    console.error('获取文档列表失败:', err)
    tableData.value = []
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm("确定删除？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    })
    await deleteDoc(id)
    await loadData()
    ElMessage.success("删除成功")
  } catch (error) {
    // 捕获用户取消操作，不做任何处理
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.upload-section {
  margin-bottom: 20px;
}

.file-upload-area {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  color: #606266;
  font-size: 14px;
}
</style>