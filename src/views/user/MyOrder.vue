<template>
  <UserLayout>
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商务管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的订单</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">我的订单</h1>
      <p class="page-description">查看和管理您的订单信息</p>
      <div class="divider"></div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索供应商名称"
        style="width: 320px; margin-right: 12px;"
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
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button type="success" @click="exportToExcel" style="margin-left: auto;">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>

    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">订单记录</span>
          <div class="header-stats">
            <el-badge :value="total" type="primary" />
            <span class="stats-text">条订单</span>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        stripe
        style="width: 100%"
        :row-class-name="getRowClass"
      >
        <el-table-column prop="orderNo" label="订单编号" min-width="220">
          <template #default="scope">
            <span class="order-no">{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplierName" label="供应商名称" min-width="180">
          <template #default="scope">
            <span class="supplier-name">{{ scope.row.supplierName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderType" label="订单类型" width="140">
          <template #default="scope">
            <el-tag type="info" effect="light" size="small">
              {{ scope.row.orderType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span class="amount">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="支付状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'" effect="dark" size="small">
              {{ scope.row.status === 1 ? '已支付' : '未支付' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="payTime" label="支付时间" width="200">
          <template #default="scope">
            <span class="time">{{ scope.row.payTime || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200">
          <template #default="scope">
            <span class="time">{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 0"
              type="primary"
              size="small"
              @click="handlePay(scope.row)"
            >
              去支付
            </el-button>
            <el-button
              v-else
              type="info"
              size="small"
              disabled
            >
              已支付
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="empty-text" v-if="!loading && orderList.length === 0">
        <el-empty
          :description="{
            'default': '暂无订单数据',
            'search': '没有找到匹配的订单'
          }[searchKeyword ? 'search' : 'default']"
        />
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
          background
        />
      </div>
    </el-card>

    <!-- 支付确认弹窗 -->
    <el-dialog v-model="payDialogVisible" title="确认支付" width="500px">
      <div class="pay-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单编号">{{ currentOrder?.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="供应商名称">{{ currentOrder?.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="订单类型">{{ currentOrder?.orderType }}</el-descriptions-item>
          <el-descriptions-item label="支付金额">
            <span style="color: #f56c6c; font-size: 20px; font-weight: 600;">
              ¥{{ currentOrder?.amount }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="pay-tip">
          <span>点击确认后将跳转到支付宝沙箱支付页面</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPay" :loading="paying">确认支付</el-button>
      </template>
    </el-dialog>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search, Refresh } from '@element-plus/icons-vue'
import UserLayout from './layout/UserLayout.vue'
import { getMyOrderList, getAlipayForm } from '../../api/user/business'
import * as XLSX from 'xlsx'

const loading = ref(false)
const paying = ref(false)

const orderList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')

const payDialogVisible = ref(false)
const currentOrder = ref(null)

// 根据订单状态获取行样式
const getRowClass = ({ row }) => {
  return row.status === 1 ? 'paid-row' : 'unpaid-row'
}

onMounted(() => {
  getOrders()
})

const getCurrentUserId = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return user.id
  } catch (e) {
    return null
  }
}

const getOrders = async () => {
  loading.value = true
  try {
    const userId = getCurrentUserId()

    if (!userId) {
      ElMessage.warning('未检测到用户登录信息')
      return
    }

    const res = await getMyOrderList({
      userId,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      supplierName: searchKeyword.value
    })

    if (res.code === 200) {
      orderList.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '获取订单失败')
    }
  } catch (error) {
    console.error('获取订单失败', error)
    ElMessage.error('网络错误，请稍后重试')
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
  currentPage.value = 1
  getOrders()
}

const handlePay = (order) => {
  currentOrder.value = order
  payDialogVisible.value = true
}

const confirmPay = async () => {
  if (!currentOrder.value) return

  paying.value = true
  try {
    const res = await getAlipayForm(currentOrder.value.id)

    if (res.code === 200) {
      const payFormHtml = res.data
      if (!payFormHtml) {
        ElMessage.warning('支付表单为空')
        return
      }

      ElMessage.success('正在跳转到支付页面...')

      const newWindow = window.open('', '_blank')
      if (!newWindow) {
        ElMessage.error('浏览器拦截了弹窗，请允许弹窗后重试')
        return
      }

      newWindow.document.open()
      newWindow.document.write(payFormHtml)
      newWindow.document.close()

      setTimeout(() => {
        try {
          const forms = newWindow.document.forms
          if (forms && forms.length > 0) {
            forms[0].submit()
          } else {
            ElMessage.warning('请在新窗口中手动完成支付')
          }
        } catch (e) {
          console.error('自动提交支付表单失败：', e)
          ElMessage.warning('自动跳转失败，请在新窗口中手动完成支付')
        }
      }, 500)

      payDialogVisible.value = false
      startPolling()
    } else {
      ElMessage.error(res.msg || '获取支付信息失败')
    }
  } catch (error) {
    console.error('发起支付失败', error)
    ElMessage.error('支付发起失败，请稍后重试')
  } finally {
    paying.value = false
  }
}


const startPolling = () => {
  if (!currentOrder.value) return

  let count = 0
  const timer = setInterval(async () => {
    count++
    await getOrders()

    const paidOrder = orderList.value.find(
      item => item.id === currentOrder.value.id && item.status === 1
    )

    if (paidOrder) {
      clearInterval(timer)
      ElMessage.success('支付成功')
    }

    if (count >= 20) {
      clearInterval(timer)
      ElMessage.warning('暂未检测到支付结果，请稍后手动刷新订单列表')
    }
  }, 3000)
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

// 导出Excel功能
const exportToExcel = async () => {
  try {
    if (orderList.value.length === 0) {
      ElMessage.info('没有数据可导出')
      return
    }
    
    // 转换数据格式
    const exportData = orderList.value.map(order => ({
      '订单编号': order.orderNo,
      '供应商名称': order.supplierName,
      '订单类型': order.orderType,
      '金额': `¥${order.amount}`,
      '支付状态': order.status === 1 ? '已支付' : '未支付',
      '支付时间': order.payTime || '—',
      '创建时间': order.createTime
    }))
    
    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '订单记录')
    
    // 导出文件
    const fileName = `订单记录_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 20px;
}
.page-header {
  margin-bottom: 32px;
}
.divider {
  margin-top: 16px;
  height: 1px;
  background-color: #e2e8f0;
  width: 100%;
}
.search-bar {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.page-description {
  font-size: 14px;
  color: #64748b;
}
.table-card {
  border-radius: 12px;
  margin-bottom: 24px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stats-text {
  font-size: 14px;
  color: #64748b;
}
.order-no {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #334155;
}
.supplier-name {
  font-weight: 500;
  color: #1e293b;
}
.amount {
  color: #f56c6c;
  font-weight: 600;
  font-size: 14px;
}
.time {
  font-size: 13px;
  color: #64748b;
}
.paid-row {
  background-color: rgba(103, 194, 58, 0.05) !important;
}
.unpaid-row {
  background-color: rgba(230, 162, 60, 0.05) !important;
}
.el-table tr:hover {
  background-color: rgba(59, 130, 246, 0.05) !important;
}
.empty-text {
  padding: 60px 0;
  text-align: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.pay-info {
  padding: 20px 0;
}
.pay-tip {
  margin-top: 20px;
  padding: 12px;
  background: #fdf6ec;
  border-radius: 8px;
  color: #e6a23c;
}
</style>
