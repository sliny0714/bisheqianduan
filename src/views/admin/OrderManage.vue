<template>
  <admin-layout>
    <div class="order-manage">
      <div class="page-header">
        <h1 class="page-title">订单管理</h1>
        <p class="page-description">管理所有订单信息</p>
      </div>

    <div class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-item">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-item warning">
            <div class="stat-content">
              <div class="stat-number">{{ stats.unpaid }}</div>
              <div class="stat-label">待支付</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-item success">
            <div class="stat-content">
              <div class="stat-number">{{ stats.paid }}</div>
              <div class="stat-label">已支付</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-item">
            <div class="stat-content">
              <div class="stat-number" style="color: #f56c6c;">¥{{ stats.totalAmount }}</div>
              <div class="stat-label">当前页总金额</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索订单号"
              clearable
              style="width: 220px"
              @keyup.enter="handleSearch"
            />
            <el-select
              v-model="statusFilter"
              placeholder="支付状态"
              clearable
              style="width: 150px"
            >
              <el-option label="未支付" :value="0" />
              <el-option label="已支付" :value="1" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="orderList" border stripe>
        <el-table-column prop="orderNo" label="订单编号" min-width="220" />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="orderType" label="订单类型" min-width="150" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: 600;">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="支付状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'" effect="dark">
              {{ scope.row.status === 1 ? '已支付' : '未支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <div class="action-group">
              <el-button type="info" size="small" @click="handleDetail(scope.row)">
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="empty-text" v-if="!loading && orderList.length === 0">
        暂无数据
      </div>

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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号" :span="2">
          {{ currentOrder?.orderNo }}
        </el-descriptions-item>

        <el-descriptions-item label="供应商名称">
          {{ currentOrder?.supplierName || '无' }}
        </el-descriptions-item>

        <el-descriptions-item label="订单类型">
          {{ currentOrder?.orderType || '无' }}
        </el-descriptions-item>

        <el-descriptions-item label="订单金额">
          <span style="color: #f56c6c; font-weight: 600;">¥{{ currentOrder?.amount }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="支付状态">
          <el-tag :type="currentOrder?.status === 1 ? 'success' : 'warning'" effect="dark">
            {{ currentOrder?.status === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="支付时间">
          {{ currentOrder?.payTime || '待支付' }}
        </el-descriptions-item>

        <el-descriptions-item label="创建时间">
          {{ currentOrder?.createTime || '无' }}
        </el-descriptions-item>

        <el-descriptions-item label="支付渠道">
          {{ currentOrder?.payChannel || '未记录' }}
        </el-descriptions-item>

        <el-descriptions-item label="支付宝交易号">
          {{ currentOrder?.tradeNo || '未支付' }}
        </el-descriptions-item>

        <el-descriptions-item label="订单备注" :span="2">
          {{ currentOrder?.remark || '无' }}
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderList, getOrderDetail } from '../../api/admin/business'

const loading = ref(false)
const orderList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const statusFilter = ref(null)

const detailDialogVisible = ref(false)
const currentOrder = ref(null)

const stats = reactive({
  total: 0,
  unpaid: 0,
  paid: 0,
  totalAmount: '0.00'
})

onMounted(() => {
  getOrders()
})

const getOrders = async () => {
  loading.value = true
  try {
    const res = await getOrderList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      status: statusFilter.value ?? undefined
    })

    if (res.code === 200) {
      orderList.value = res.data?.records || []
      total.value = res.data?.total || 0

      // 这里是当前页统计
      stats.total = total.value
      stats.unpaid = orderList.value.filter(item => item.status === 0).length
      stats.paid = orderList.value.filter(item => item.status === 1).length
      stats.totalAmount = orderList.value
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
        .toFixed(2)
    } else {
      ElMessage.error(res.msg || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getOrders()
}

const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = null
  currentPage.value = 1
  getOrders()
}

const handleDetail = async (row) => {
  try {
    const res = await getOrderDetail(row.orderNo)
    if (res.code === 200) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败', error)
    ElMessage.error('获取订单详情失败')
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  getOrders()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getOrders()
}
</script>

<style scoped>
.order-manage {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}
.breadcrumb {
  margin-bottom: 20px;
}
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px 0;
}
.page-description {
  font-size: 14px;
  color: #909399;
}
.stats-card {
  margin-bottom: 24px;
}
.stat-item {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: none;
}
.stat-content {
  padding: 20px;
  text-align: center;
}
.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 6px;
}
.stat-label {
  font-size: 13px;
  color: #909399;
}
.stat-item.warning .stat-number {
  color: #e6a23c;
}
.stat-item.success .stat-number {
  color: #67c23a;
}
.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: none;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.search-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
.action-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.empty-text {
  padding: 40px 0;
  text-align: center;
  color: #909399;
}
</style>
