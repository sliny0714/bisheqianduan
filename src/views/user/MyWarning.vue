<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我的风险预警</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">我的风险预警</h1>
      <p class="page-description">仅展示风险等级为【中/高】的供应商预警</p>
    </div>

    <div class="statistic-bar">
      <el-card class="statistic-card">
        <div class="statistic-item">
          <span class="statistic-label">未读预警数：</span>
          <span class="statistic-value">{{ unreadCount }}</span>
        </div>
      </el-card>
    </div>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="warningsList"
        border
        stripe
        :row-class-name="rowClassName"
      >
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="alertType" label="预警类型" width="120" />
        <el-table-column prop="alertContent" label="预警内容" min-width="300" />
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
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.isRead === 0"
              type="primary"
              size="small"
              @click="markAsRead(scope.row.id)"
            >
              标记已读
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="empty-text" v-if="!loading && warningsList.length === 0">
        暂无风险预警
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10,20,50,100]"
          layout="total,sizes,prev,pager,next,jumper"
          :total="total"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../api/request'
import UserLayout from './layout/UserLayout.vue'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const warningsList = ref([])
const unreadCount = ref(0)

onMounted(() => {
  getList()
})

const getList = async () => {
  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return ElMessage.error('请先登录')

    const res = await request.get('/alert/page', {
      params: { userId: user.id, pageNum: currentPage.value, pageSize: pageSize.value }
    })

    if (res.code === 200) {
      let rawWarnings = res.data.records || []

      // 1. 按供应商去重，只保留最新一条预警
      const uniqueWarningMap = new Map()
      rawWarnings.forEach(w => {
          if (!uniqueWarningMap.has(w.supplierName) || 
              new Date(w.createTime) > new Date(uniqueWarningMap.get(w.supplierName).createTime)) {
              uniqueWarningMap.set(w.supplierName, w)
          }
      })
      warningsList.value = Array.from(uniqueWarningMap.values())

      // 2. 关键修复：用去重后的列表长度更新分页的 total
      total.value = warningsList.value.length

      // 3. 关键修复：根据当前列表里未读的预警数量，更新统计数字
      unreadCount.value = warningsList.value.filter(item => item.isRead === 0).length
    }
  } catch (error) {
    ElMessage.error('获取预警列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const markAsRead = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await request.get('/alert/markRead', {
      params: { id, userId: user.id }
    })
    ElMessage.success('标记成功')
    getList() // 刷新列表和统计
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

const rowClassName = ({ row }) => row.isRead === 0 ? 'unread-row' : ''
</script>

<style scoped>
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.statistic-bar { margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
.table-card { border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.empty-text { padding: 40px 0; text-align: center; color: #909399; }
:deep(.unread-row) {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
  font-weight: 500;
}
</style>