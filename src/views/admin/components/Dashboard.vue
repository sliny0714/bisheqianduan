<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">控制台</h1>
      <p class="page-description">欢迎使用小微企业供应商管理与风险评估系统</p>
    </div>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card stat-supplier">
          <div class="stat-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.supplierTotal }}</div>
            <div class="stat-label">供应商总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
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
      <el-col :span="6">
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
      <el-col :span="6">
        <div class="stat-card stat-user">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.userTotal }}</div>
            <div class="stat-label">系统用户总数</div>
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
              <span class="chart-title">供应商审核状态分布</span>
            </div>
          </template>
          <div class="chart-container" ref="auditChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">风险等级分布</span>
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
              <span class="chart-title">风险预警监控</span>
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
          <span class="chart-title">最新风险预警</span>
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
        <el-table-column prop="riskLevel" label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getRiskLevelTag(scope.row.riskLevel)" size="small">
              {{ scope.row.riskLevel }}
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
import { Box, Clock, Warning, User } from '@element-plus/icons-vue'
import request from '../../../api/request'

const router = useRouter()

const stats = reactive({
  supplierTotal: 0,
  pendingCount: 0,
  highRiskCount: 0,
  userTotal: 0
})

const alertList = ref([])

let auditChart = null
let riskChart = null
let alertChart = null
const auditChartRef = ref(null)
const riskChartRef = ref(null)
const alertChartRef = ref(null)

const getAlertTypeTag = (type) => {
  const map = {
    '财务风险': 'warning',
    '经营风险': 'danger',
    '舆情风险': 'info'
  }
  return map[type] || 'info'
}

const getRiskLevelTag = (level) => {
  const map = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return map[level] || 'info'
}

const goToAlertManage = () => {
  router.push('/admin/alert')
}

const fetchStats = async () => {
  try {
    const [supplierRes, riskRes, userRes] = await Promise.all([
      request.get('/supplier/list', { params: { pageNum: 1, pageSize: 1000 } }),
      request.get('/risk/list', { params: { pageNum: 1, pageSize: 1000 } }),
      request.get('/user/list', { params: { pageNum: 1, pageSize: 1000 } })
    ])

    const suppliers = supplierRes.data?.records || []
    const risks = riskRes.data?.records || []
    const users = userRes.data?.records || []

    stats.supplierTotal = supplierRes.data?.total || suppliers.length
    stats.pendingCount = suppliers.filter(s => s.auditStatus === 0).length
    stats.highRiskCount = risks.filter(r => r.riskLevel === '高').length
    stats.userTotal = userRes.data?.total || users.length

    updateAuditChart(suppliers)
    updateRiskChart(risks)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchAlertList = async () => {
  try {
    // 从风险评估接口获取数据，与其他预警页面保持一致
    const res = await request.get('/risk/list', { params: { pageNum: 1, pageSize: 1000 } })
    const riskAssessments = res.data?.records || []
    
    // 过滤出风险等级为中或高的评估结果
    const filteredAssessments = riskAssessments.filter(assessment => {
      const level = assessment.level
      return level === '中' || level === '高'
    })
    
    // 按供应商分组，只保留每个供应商最新的评估结果
    const supplierAssessmentsMap = new Map()
    
    filteredAssessments.forEach(assessment => {
      const supplierName = assessment.supplierName
      if (!supplierAssessmentsMap.has(supplierName)) {
        supplierAssessmentsMap.set(supplierName, assessment)
      } else {
        const existingAssessment = supplierAssessmentsMap.get(supplierName)
        // 比较评估时间，保留最新的
        if (new Date(assessment.assessTime || assessment.createTime) > new Date(existingAssessment.assessTime || existingAssessment.createTime)) {
          supplierAssessmentsMap.set(supplierName, assessment)
        }
      }
    })
    
    // 将 Map 转换为数组并按评估时间倒序排序
    const finalAssessments = Array.from(supplierAssessmentsMap.values())
    finalAssessments.sort((a, b) => new Date(b.assessTime || b.createTime) - new Date(a.assessTime || a.createTime))
    
    // 转换为预警数据结构
    const finalAlerts = finalAssessments.map(assessment => ({
      id: assessment.id,
      supplierId: assessment.supplierId,
      supplierName: assessment.supplierName,
      level: assessment.level,
      alertType: assessment.level + '风险预警',
      alertContent: `供应商【${assessment.supplierName}】风险等级为【${assessment.level}】，请及时处理！`,
      createTime: assessment.assessTime || assessment.createTime
    }))
    
    // 只显示前10条
    alertList.value = finalAlerts.slice(0, 10)
    updateAlertChart(alertList.value)
  } catch (error) {
    console.error('获取预警列表失败:', error)
  }
}

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

const updateRiskChart = (risks) => {
  if (!riskChart) {
    riskChart = echarts.init(riskChartRef.value)
  }

  const low = risks.filter(r => r.riskLevel === '低').length
  const medium = risks.filter(r => r.riskLevel === '中').length
  const high = risks.filter(r => r.riskLevel === '高').length

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

const updateAlertChart = (alerts) => {
  if (!alertChart) {
    alertChart = echarts.init(alertChartRef.value)
  }

  // 只统计中高风险（因为传入的 alerts 已经是过滤后的中高风险数据）
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
      data: ['中风险', '高风险'],
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

const handleResize = () => {
  auditChart?.resize()
  riskChart?.resize()
  alertChart?.resize()
}

onMounted(() => {
  fetchStats()
  fetchAlertList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  auditChart?.dispose()
  riskChart?.dispose()
  alertChart?.dispose()
})
</script>

<style scoped>
.dashboard {
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

.stat-user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
