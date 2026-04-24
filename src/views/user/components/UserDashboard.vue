<template>
  <div class="user-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">控制台</h1>
      <p class="page-description">欢迎回来，{{ userInfo.username }}！以下是您的系统概览。</p>
    </div>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-supplier">
          <div class="stat-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.supplierTotal }}</div>
            <div class="stat-label">我的供应商总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-pending">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.pendingCount }}</div>
            <div class="stat-label">待审核供应商</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-risk">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.highRiskCount }}</div>
            <div class="stat-label">高风险供应商</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-alert">
          <div class="stat-icon">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.unreadAlertCount }}</div>
            <div class="stat-label">未读预警</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 中间图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">我的供应商审核状态分布</span>
            </div>
          </template>
          <div class="chart-container" ref="auditChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">我的供应商风险等级分布</span>
            </div>
          </template>
          <div class="chart-container" ref="riskChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部柱状图 -->
    <el-row class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card bar-chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">我的风险预警监控</span>
            </div>
          </template>
          <div class="chart-container bar-chart-container" ref="alertChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新风险预警列表 -->
    <el-card class="alert-list-card">
      <template #header>
        <div class="chart-header">
          <span class="chart-title">我的最新风险预警</span>
          <el-button type="primary" link @click="goToAlertManage">查看更多</el-button>
        </div>
      </template>
      <el-table :data="alertList" style="width: 100%" stripe>
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="alertType" label="预警类型" width="120">
          <template #default="scope">
            <el-tag :type="getAlertTypeTag(scope.row.alertType)" size="small">
              {{ scope.row.alertType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alertContent" label="预警内容" min-width="300" />
        <el-table-column prop="level" label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getRiskLevelTag(scope.row.level || scope.row.riskLevel)" size="small">
              {{ scope.row.level || scope.row.riskLevel || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isRead === 0 ? 'danger' : 'info'" size="small">
              {{ scope.row.isRead === 0 ? '未读' : '已读' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Box, Clock, Warning, Bell } from '@element-plus/icons-vue'
import request from '../../../api/request'

const router = useRouter()

// 当前用户信息
const userInfo = ref({ username: 'user01' })

// 统计数据
const stats = reactive({
  supplierTotal: 0,
  pendingCount: 0,
  highRiskCount: 0,
  unreadAlertCount: 0
})

// 预警列表
const alertList = ref([])

// 图表引用
let auditChart = null
let riskChart = null
let alertChart = null
const auditChartRef = ref(null)
const riskChartRef = ref(null)
const alertChartRef = ref(null)

// 获取预警类型标签
const getAlertTypeTag = (type) => {
  const map = {
    '财务风险': 'warning',
    '经营风险': 'danger',
    '舆情风险': 'info'
  }
  return map[type] || 'info'
}

// 获取风险等级标签
const getRiskLevelTag = (level) => {
  const map = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return map[level] || 'info'
}

// 跳转到预警管理
const goToAlertManage = () => {
  router.push('/risk/my/alert')
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return

    const [supplierRes, alertRes] = await Promise.all([
      request.get('/supplier/my/list', { params: { pageNum: 1, pageSize: 100, userId: user.id || 1 } }),
      request.get('/alert/unreadCount', { params: { userId: user.id || 1 } })
    ])

    // 适配后端返回格式
    const suppliers = Array.isArray(supplierRes.data) ? supplierRes.data : supplierRes.data?.records || []
    
    // 获取风险数据
    let risks = []
    for (let supplier of suppliers) {
      if (supplier.qualificationFile && supplier.auditStatus === 1) {
        try {
          const riskRes = await request.get('/risk/list', {
            params: { supplierId: supplier.id }
          })
          const supplierRisks = Array.isArray(riskRes.data) ? riskRes.data : riskRes.data?.records || []
          if (supplierRisks.length > 0) {
            // 按时间排序取最新一条
            supplierRisks.sort((a, b) => new Date(b.assessTime) - new Date(a.assessTime))
            risks.push(supplierRisks[0])
          }
        } catch (e) {
          console.error('获取供应商风险数据失败:', e)
        }
      }
    }
    
    stats.supplierTotal = supplierRes.data?.total || suppliers.length
    stats.pendingCount = suppliers.filter(s => s.auditStatus === 0).length
    stats.highRiskCount = risks.filter(r => r.level === '高' || r.riskLevel === '高').length
    stats.unreadAlertCount = alertRes.data || 0

    updateAuditChart(suppliers)
    updateRiskChart(risks)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取预警列表
const fetchAlertList = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return

    const res = await request.get('/alert/list', { params: { pageNum: 1, pageSize: 10, userId: user.id || 1 } })
    // 适配后端返回格式：data 直接是数组
    let alerts = Array.isArray(res.data) ? res.data : res.data?.records || []
    
    // 过滤：每个供应商只显示最新的一条预警
    const supplierAlertMap = new Map()
    alerts.forEach(alert => {
      const supplierName = alert.supplierName
      if (!supplierAlertMap.has(supplierName) || 
          new Date(alert.createTime) > new Date(supplierAlertMap.get(supplierName).createTime)) {
        supplierAlertMap.set(supplierName, alert)
      }
    })
    
    // 转换为数组并按时间排序
    alertList.value = Array.from(supplierAlertMap.values())
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    updateAlertChart(alertList.value)
  } catch (error) {
    console.error('获取预警列表失败:', error)
  }
}

// 更新审核状态图表
const updateAuditChart = (suppliers) => {
  if (!auditChart) {
    auditChart = echarts.init(auditChartRef.value)
  }

  const pending = suppliers.filter(s => s.auditStatus === 0).length
  const approved = suppliers.filter(s => s.auditStatus === 1).length
  const rejected = suppliers.filter(s => s.auditStatus === 2).length

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    color: ['#e6a23c', '#67c23a', '#f56c6c'],
    series: [
      {
        name: '审核状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: pending, name: '待审核' },
          { value: approved, name: '已通过' },
          { value: rejected, name: '已驳回' }
        ]
      }
    ]
  }

  auditChart.setOption(option)
}

// 更新风险等级图表
const updateRiskChart = (risks) => {
  if (!riskChart) {
    riskChart = echarts.init(riskChartRef.value)
  }

  const low = risks.filter(r => r.level === '低' || r.riskLevel === '低').length
  const medium = risks.filter(r => r.level === '中' || r.riskLevel === '中').length
  const high = risks.filter(r => r.level === '高' || r.riskLevel === '高').length

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    color: ['#67c23a', '#e6a23c', '#f56c6c'],
    series: [
      {
        name: '风险等级',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: low, name: '低风险' },
          { value: medium, name: '中风险' },
          { value: high, name: '高风险' }
        ]
      }
    ]
  }

  riskChart.setOption(option)
}

// 更新预警监控图表
const updateAlertChart = (alerts) => {
  if (!alertChart) {
    alertChart = echarts.init(alertChartRef.value)
  }

  const low = alerts.filter(a => a.level === '低' || a.riskLevel === '低').length
  const medium = alerts.filter(a => a.level === '中' || a.riskLevel === '中').length
  const high = alerts.filter(a => a.level === '高' || a.riskLevel === '高').length

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['低风险', '中风险', '高风险'],
      axisLabel: {
        color: '#606266'
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#606266'
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '预警数量',
        type: 'bar',
        barWidth: '50%',
        data: [
          {
            value: low,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#67c23a' },
                { offset: 1, color: '#95d475' }
              ]),
              borderRadius: [8, 8, 0, 0]
            }
          },
          {
            value: medium,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#e6a23c' },
                { offset: 1, color: '#f0b366' }
              ]),
              borderRadius: [8, 8, 0, 0]
            }
          },
          {
            value: high,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f56c6c' },
                { offset: 1, color: '#f89e9e' }
              ]),
              borderRadius: [8, 8, 0, 0]
            }
          }
        ],
        label: {
          show: true,
          position: 'top',
          color: '#606266'
        }
      }
    ]
  }

  alertChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  auditChart?.resize()
  riskChart?.resize()
  alertChart?.resize()
}

// 页面加载时获取数据
onMounted(() => {
  // 获取用户信息
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    userInfo.value = user
  }
  
  // 获取统计数据和预警列表
  fetchStats()
  fetchAlertList()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  auditChart?.dispose()
  riskChart?.dispose()
  alertChart?.dispose()
})
</script>

<style scoped>
.user-dashboard {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon .el-icon {
  font-size: 28px;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-supplier {
  background: linear-gradient(135deg, #409eff 0%, #6aa9ff 100%);
}

.stat-pending {
  background: linear-gradient(135deg, #e6a23c 0%, #f0b366 100%);
}

.stat-risk {
  background: linear-gradient(135deg, #f56c6c 0%, #f89e9e 100%);
}

.stat-alert {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.bar-chart-card .chart-container {
  height: 250px;
}

.alert-list-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table__row--unread) {
  background-color: #fff5f5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }
  
  .stat-icon .el-icon {
    font-size: 22px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .chart-container {
    height: 220px;
  }
}
</style>