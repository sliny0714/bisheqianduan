<template>
  <admin-layout>
    <div class="user-manage">
      <div class="page-header">
        <h1 class="page-title">用户管理</h1>
        <p class="page-description">管理系统用户</p>
      </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 添加用户
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        
        <!-- 表格密码隐藏 -->
        <el-table-column label="密码" min-width="120">
          <template #default="scope">
            <span>******</span>
          </template>
        </el-table-column>

        <el-table-column prop="realName" label="真实姓名" min-width="150" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : 'primary'" effect="light">
              {{ scope.row.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" effect="light">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              :disabled="scope.row.role === 'ADMIN'"
            >
              <el-icon><Delete /></el-icon> 删除
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

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            show-password 
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="普通用户" value="USER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from './layout/AdminLayout.vue'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import request from '../../api/request'

const loading = ref(false)
const submitLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)

const userList = ref([])

const form = reactive({
  id: null,
  username: '',
  realName: '',
  password: '',
  role: 'USER',
  status: 1
})

// 规则：新增密码必填，编辑密码可选
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  password: [{ 
    validator: (rule, value, callback) => {
      if (!isEdit.value && !value) callback(new Error('请输入密码'))
      else callback()
    }, trigger: 'blur' 
  }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

onMounted(() => { getUserList() })

const getUserList = async () => {
  loading.value = true
  const res = await request({
    url: '/user/list',
    method: 'get',
    params: { pageNum: currentPage.value, pageSize: pageSize.value, keyword: searchKeyword.value }
  })
  userList.value = res.data?.records || []
  total.value = res.data?.total || 0
  loading.value = false
}

const handleSearch = () => { currentPage.value = 1; getUserList() }
const handleSizeChange = (size) => { pageSize.value = size; getUserList() }
const handleCurrentChange = (current) => { currentPage.value = current; getUserList() }

const handleAdd = () => {
  dialogTitle.value = '添加用户'
  isEdit.value = false
  form.id = null
  form.username = ''
  form.realName = ''
  form.password = ''
  form.role = 'USER'
  form.status = 1
  dialogVisible.value = true
}

// ✅ 编辑时回填原密码！
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.realName = row.realName
  form.password = row.password  // 🔥 回填原密码
  form.role = row.role
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      const url = isEdit.value ? '/user/update' : '/user/add'
      const data = { ...form }
      const res = await request({ url, method: 'post', data })
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      getUserList()
      submitLoading.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除？').then(async () => {
    await request({ url: '/user/delete', method: 'get', params: { id: row.id } })
    ElMessage.success('删除成功')
    getUserList()
  })
}
</script>

<style scoped>
.user-manage { padding: 20px; background: #f5f7fa; min-height: calc(100vh - 40px); }
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; margin: 0 0 8px 0; }
.page-description { font-size: 14px; color: #909399; margin: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { display: flex; gap: 10px; }
.table-card { border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>