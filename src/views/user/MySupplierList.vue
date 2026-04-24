<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我的供应商管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的供应商列表</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">我的供应商列表</h1>
      <p class="page-description">管理您提交的供应商信息</p>
    </div>

    <div class="action-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入供应商名称搜索"
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
        新增供应商
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="suppliersList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="供应商名称" min-width="180" />
        <el-table-column prop="industry" label="所属行业" min-width="120" />
        <el-table-column prop="contactPerson" label="联系人" min-width="120" />
        <el-table-column prop="contactPhone" label="联系电话" min-width="150" />
        <el-table-column prop="auditStatus" label="审核状态" width="120">
          <template #default="scope">
            <el-tag
              :type="getAuditStatusType(scope.row.auditStatus)"
              effect="dark"
            >
              {{ getAuditStatusText(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 资质文件列 -->
        <el-table-column label="资质文件" min-width="280">
          <template #default="scope">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <template v-if="scope.row.qualificationFile && scope.row.qualificationFile.trim()">
                <el-tag
                  v-for="(item, idx) in parseFiles(scope.row.qualificationFile)"
                  :key="idx"
                  :type="item.type"
                  effect="dark"
                  size="small"
                >
                  <a 
                    :href="item.url" 
                    target="_blank" 
                    style="color:white; text-decoration:none;"
                  >
                    {{ item.name }}
                  </a>
                </el-tag>
              </template>
              <el-tag v-else type="warning" effect="dark" size="small">
                未上传
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="info" size="small" @click="handleDetail(scope.row.id)">
                <el-icon><View /></el-icon>详情
              </el-button>
              <el-button type="primary" size="small" @click="handleEdit(scope.row.id)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
                <el-icon><Delete /></el-icon>删除
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
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, View, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import { getMySupplierList, deleteSupplier } from '../../api/user/supplier'
import request from '../../api/request'
import UserLayout from './layout/UserLayout.vue'

const router = useRouter()

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const suppliersList = ref([])
const searchKeyword = ref('')

const parseFiles = (qf) => {
  // 如果没有资质文件，返回空数组
  if (!qf) return []

  // 按逗号分隔，过滤空值
  const arr = qf.split(',').filter(u => u.trim())

  // 文件类型，类型可以扩展
  const types = ['success', 'warning', 'info']
  
  // 文件名，这里默认对应的是营业执照、法人身份证和账户信息
  const names = ['营业执照', '法人身份证', '账户信息']

  // 处理每个文件路径，构造出完整的URL以及文件名称和类型
  return arr.map((url, i) => {
    // 生成文件的完整URL
    const fileUrl = 'http://localhost:8080/uploads/' + url

    // 返回文件对象，包括文件的URL、名称以及类型
    return {
      url: fileUrl,  // 文件的完整URL
      name: names[i] || '资质文件',  // 默认的文件名称
      type: types[i] || 'info'  // 默认的文件类型
    }
  })
}


onMounted(() => {
  getSuppliers()
})

const getSuppliers = async () => {
  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    let res
    if (user.role === 'ADMIN') {
      res = await request.get('/supplier/list', {
        params: {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value
        }
      })
    } else {
      res = await getMySupplierList({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        userId: user.id
      })
    }

    if (res.code === 200) {
      let list = res.data?.records || []
      total.value = res.data?.total || list.length

      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase().trim()
        list = list.filter(item => {
          return item.name?.toLowerCase().includes(keyword) ||
                 item.industry?.toLowerCase().includes(keyword) ||
                 item.contactPerson?.toLowerCase().includes(keyword)
        })
        total.value = list.length
      }

      suppliersList.value = list
    }
  } catch (error) {
    console.error('获取供应商失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getSuppliers()
}

const handleReset = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  getSuppliers()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getSuppliers()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

const handleAdd = () => router.push('/supplier/add')
const handleDetail = (id) => router.push(`/supplier/detail/${id}`)
const handleEdit = (id) => router.push(`/supplier/edit/${id}`)
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除？', '警告', {
    type: 'warning'
  }).then(async () => {
    const res = await deleteSupplier(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getSuppliers()
    }
  }).catch(() => {})
}

const getAuditStatusText = (status) => {
  switch (status) {
    case 0: return '待审核'
    case 1: return '通过'
    case 2: return '驳回'
    default: return '未知'
  }
}

const getAuditStatusType = (status) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'success'
    case 2: return 'danger'
    default: return 'info'
  }
}
</script>

<style scoped>
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 32px; }
.page-title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.page-description { font-size: 14px; color: #64748b; }
.action-bar { margin-bottom: 20px; }
.table-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.action-buttons { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
