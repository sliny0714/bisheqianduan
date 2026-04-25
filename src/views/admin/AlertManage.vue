<template>
  <admin-layout>
    <div class="alert-manage">
      <div class="page-header">
        <h1 class="page-title">风险预警管理</h1>
        <p class="page-description">管理供应商风险预警</p>
      </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索供应商名称"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="isReadFilter" placeholder="状态" clearable style="width: 150px">
              <el-option label="未读" :value="0" />
              <el-option label="已读" :value="1" />
            </el-select>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="alertList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="alertType" label="预警类型" width="120" />
        
        <!-- ====================== 新增：风险等级 ====================== -->
        <el-table-column prop="level" label="风险等级" width="100">
          <template #default="scope">
            <el-tag
              :type="getRiskLevelTag(scope.row.level || '未知')"
              size="small"
              effect="light"
            >
              {{ scope.row.level || '未知' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="alertContent" label="预警内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="isRead" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.isRead === 0 ? 'danger' : 'info'"
              effect="light"
            >
              {{ scope.row.isRead === 0 ? '未读' : '已读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleDetail(scope.row)"
            >
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button
              v-if="scope.row.isRead === 0"
              type="success"
              size="small"
              @click="handleMarkRead(scope.row)"
            >
              <el-icon><Check /></el-icon> 已读
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

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预警详情"
      width="600px"
    >
      <el-descriptions :column="1" border v-if="currentAlert">
        <el-descriptions-item label="供应商名称">{{ currentAlert.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="预警类型">{{ currentAlert.alertType }}</el-descriptions-item>
        
        <!-- ====================== 新增：详情页也显示等级 ====================== -->
        <el-descriptions-item label="风险等级">
          <el-tag :type="getRiskLevelTag(currentAlert.level || '未知')" effect="light">
            {{ currentAlert.level || '未知' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="预警内容">{{ currentAlert.alertContent }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentAlert.isRead === 0 ? 'danger' : 'info'" effect="light">
            {{ currentAlert.isRead === 0 ? '未读' : '已读' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentAlert.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentAlert && currentAlert.isRead === 0"
            type="success"
            @click="handleMarkReadInDialog"
          >
            标记已读
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from './layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, View, Check } from '@element-plus/icons-vue'
import request from '../../api/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const isReadFilter = ref(null)
const detailDialogVisible = ref(false)
const currentAlert = ref(null)
const alertList = ref([])

onMounted(() => {
  getAlertList()
})

// 获取管理员预警列表
const getAlertList = async () => {
  loading.value = true
  try {
    const res = await request.get('/alert/admin/list', {
      params: {
        pageNum: 1, // 获取所有数据以便过滤
        pageSize: 1000, // 设置足够大的值
        supplierName: searchKeyword.value,
        isRead: isReadFilter.value
      }
    })
    
    if (res.code === 200) {
      const allAlerts = res.data.records || []
      
      // 按供应商分组，只保留每个供应商最新的预警
      const supplierAlertsMap = new Map()
      
      allAlerts.forEach(alert => {
        const supplierName = alert.supplierName
        if (!supplierAlertsMap.has(supplierName)) {
          supplierAlertsMap.set(supplierName, alert)
        } else {
          const existingAlert = supplierAlertsMap.get(supplierName)
          // 比较创建时间，保留最新的
          if (new Date(alert.createTime) > new Date(existingAlert.createTime)) {
            supplierAlertsMap.set(supplierName, alert)
          }
        }
      })
      
      // 将 Map 转换为数组
      const filteredAlerts = Array.from(supplierAlertsMap.values())
      
      // 按创建时间倒序排序
      filteredAlerts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      
      // 处理分页
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      alertList.value = filteredAlerts.slice(start, end)
      total.value = filteredAlerts.length
      
      // 调试：查看过滤后的数据
      if (alertList.value.length > 0) {
        console.log('Filtered alerts count:', filteredAlerts.length)
        console.log('First filtered alert:', alertList.value[0])
      }
    }
  } catch (error) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getAlertList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getAlertList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getAlertList()
}

const handleDetail = (row) => {
  currentAlert.value = row
  detailDialogVisible.value = true
}

// 标记已读
const handleMarkRead = async (row) => {
  try {
    await request.post(`/alert/admin/read/${row.id}`)
    ElMessage.success('标记成功')
    getAlertList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleMarkReadInDialog = async () => {
  if (!currentAlert.value) return
  try {
    await request.post(`/alert/admin/read/${currentAlert.value.id}`)
    ElMessage.success('标记成功')
    detailDialogVisible.value = false
    getAlertList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// ====================== 新增：风险等级颜色 ======================
const getRiskLevelTag = (level) => {
  const map = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return map[level] || 'info'
}
</script>

<style scoped>
.alert-manage {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; margin: 0 0 8px 0; }
.page-description { font-size: 14px; color: #909399; margin: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.table-card { border-radius: 8px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>