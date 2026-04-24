<template>
  <admin-layout>
    <div class="oper-log-manage">
      <div class="page-header">
        <h1 class="page-title">系统操作日志</h1>
        <p class="page-description">查看系统操作记录</p>
      </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索操作人员/操作内容"
        style="width: 300px; margin-right: 12px;"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="businessTypeFilter" placeholder="业务类型" style="width: 150px; margin-right: 12px;" clearable>
        <el-option label="新增" :value="1" />
        <el-option label="修改" :value="2" />
        <el-option label="删除" :value="3" />
        <el-option label="其他" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="logList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="操作模块" min-width="150" />
        <el-table-column prop="businessType" label="业务类型" width="100">
          <template #default="scope">
            <el-tag :type="getBusinessTypeTag(scope.row.businessType)" effect="dark">
              {{ getBusinessTypeText(scope.row.businessType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="操作方法" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operName" label="操作人员" width="120" />
        <el-table-column prop="operIp" label="操作IP" width="150" />
        <el-table-column prop="operUrl" label="请求URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'" effect="dark">
              {{ scope.row.status === 0 ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="info" size="small" @click="handleDetail(scope.row)">
              详情
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

    <el-dialog v-model="detailDialogVisible" title="操作日志详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作模块">{{ currentLog?.title }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">
          <el-tag :type="getBusinessTypeTag(currentLog?.businessType)" effect="dark">
            {{ getBusinessTypeText(currentLog?.businessType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作方法" :span="2">{{ currentLog?.method }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">{{ currentLog?.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ currentLog?.operName }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ currentLog?.operIp }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentLog?.status === 0 ? 'success' : 'danger'" effect="dark">
            {{ currentLog?.status === 0 ? '正常' : '异常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">{{ currentLog?.operUrl }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <el-input type="textarea" :value="currentLog?.operParam" readonly rows="3" />
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <el-input type="textarea" :value="currentLog?.jsonResult" readonly rows="3" />
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from './layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getOperLogList } from '../../api/admin/log'
import request from '../../api/request'

const loading = ref(false)
const logList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const businessTypeFilter = ref('')
const detailDialogVisible = ref(false)
const currentLog = ref(null)

onMounted(() => {
  getLogs()
})

const getLogs = async () => {
  loading.value = true
  try {
    const res = await getOperLogList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      businessType: businessTypeFilter.value
    })
    if (res.code === 200) {
      logList.value = res.data?.records || []
      total.value = res.data?.total || logList.value.length
    }
  } catch (error) {
    console.error('获取操作日志失败', error)
  } finally {
    loading.value = false
  }
}

const getBusinessTypeText = (type) => {
  const map = { 0: '其他', 1: '新增', 2: '修改', 3: '删除' }
  return map[type] || '未知'
}

const getBusinessTypeTag = (type) => {
  const map = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger' }
  return map[type] || 'info'
}

const handleSearch = () => {
  currentPage.value = 1
  getLogs()
}

const handleReset = () => {
  searchKeyword.value = ''
  businessTypeFilter.value = ''
  currentPage.value = 1
  getLogs()
}

const handleDetail = (row) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getLogs()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getLogs()
}
</script>

<style scoped>
.oper-log-manage { padding: 24px; }
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 32px; }
.page-title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.page-description { font-size: 14px; color: #64748b; }
.search-bar { margin-bottom: 20px; display: flex; align-items: center; }
.table-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
