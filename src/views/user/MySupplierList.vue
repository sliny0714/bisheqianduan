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
      <el-button type="success" @click="exportToExcel" style="margin-left: 12px;">
        <el-icon><Download /></el-icon>
        导出
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
import { Plus, View, Edit, Delete, Search, Refresh, Download } from '@element-plus/icons-vue'
import { getMySupplierList, deleteSupplier } from '../../api/user/supplier'
import request from '../../api/request'
import UserLayout from './layout/UserLayout.vue'
import * as XLSX from 'xlsx'

const router = useRouter()

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const suppliersList = ref([])
const searchKeyword = ref('')




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
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
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

// 导出Excel功能
const exportToExcel = async () => {
  try {
    // 获取所有供应商数据
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.get('/supplier/my/list', {
      params: { pageNum: 1, pageSize: 1000, userId: user.id || 1, name: searchKeyword.value }
    })
    
    const suppliers = res.data?.records || []
    
    if (suppliers.length === 0) {
      ElMessage.info('没有数据可导出')
      return
    }
    
    // 转换数据格式
    const exportData = suppliers.map(supplier => ({
      'ID': supplier.id,
      '供应商名称': supplier.name,
      '所属行业': supplier.industry,
      '联系人': supplier.contactPerson,
      '联系电话': supplier.contactPhone,
      '审核状态': getAuditStatusText(supplier.auditStatus),
      '提交时间': supplier.createTime
    }))
    
    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '供应商列表')
    
    // 导出文件
    const fileName = `供应商列表_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
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
