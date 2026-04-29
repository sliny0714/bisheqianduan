<template>
  <UserLayout>
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/supplier/my/list' }">我的供应商管理</el-breadcrumb-item>
      <el-breadcrumb-item>供应商详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">供应商详情</h1>
      <p class="page-description">查看供应商的详细信息和风险评估情况</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
      <!-- 基础信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基础信息</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="供应商名称">{{ supplierDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="统一社会信用代码">{{ supplierDetail.creditCode }}</el-descriptions-item>
          <el-descriptions-item label="法定代表人">{{ supplierDetail.legalRep }}</el-descriptions-item>
          <el-descriptions-item label="所属行业">{{ supplierDetail.industry }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ supplierDetail.contactPerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ supplierDetail.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="成立日期">{{ supplierDetail.establishDate }}</el-descriptions-item>
          <el-descriptions-item label="注册资本">{{ formatNumber(supplierDetail.registeredCapital) }} 万元</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag
              :type="getAuditStatusType(supplierDetail.auditStatus)"
              effect="dark"
            >
              {{ getAuditStatusText(supplierDetail.auditStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="资质文件" :span="3">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <template v-if="supplierDetail.qualificationFile && supplierDetail.qualificationFile.trim()">
                <template v-for="(url, index) in supplierDetail.qualificationFile.split(',')" :key="index">
                  <el-link
                    :href="url.startsWith('http') ? url : 'http://localhost:8080' + (url.startsWith('/') ? url : '/' + url)"
                    target="_blank"
                    type="primary"
                  >
                    {{ index === 0 ? '营业执照' : index === 1 ? '法定代表人身份证' : '账户信息' }}
                  </el-link>
                </template>
              </template>
              <el-tag v-else type="warning" effect="dark" size="small">
                未上传
              </el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="3">{{ supplierDetail.address }}</el-descriptions-item>
          <el-descriptions-item label="经营范围" :span="3">{{ supplierDetail.businessScope }}</el-descriptions-item>
          <el-descriptions-item label="外部舆情" :span="3">{{ supplierDetail.externalNews }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 审核信息 -->
      <el-card class="info-card" v-if="supplierDetail.auditStatus !== 0">
        <template #header>
          <div class="card-header">
            <span>审核信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审核状态">
            <el-tag
              :type="getAuditStatusType(supplierDetail.auditStatus)"
              effect="dark"
            >
              {{ getAuditStatusText(supplierDetail.auditStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ supplierDetail.auditTime }}</el-descriptions-item>
          <el-descriptions-item label="审核备注" :span="2">{{ supplierDetail.auditRemark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>



      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="handleBack">返回列表</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </template>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSupplierDetail } from '../../api/user/supplier'
import UserLayout from './layout/UserLayout.vue'

const router = useRouter()
const route = useRoute()

// 加载状态
const loading = ref(true)

// 供应商详情
const supplierDetail = ref({})

// 页面加载时获取数据
onMounted(() => {
  const supplierId = route.params.id
  if (supplierId) {
    getSupplierData(supplierId)
  }
})

// 获取供应商数据
const getSupplierData = async (id) => {
  loading.value = true
  try {
    // 获取供应商详情
    const detailRes = await getSupplierDetail(id)
    if (detailRes.code === 200) {
      supplierDetail.value = detailRes.data
    }
  } catch (error) {
    console.error('获取供应商数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  return parseFloat(num).toFixed(2)
}

// 获取审核状态文本
const getAuditStatusText = (status) => {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '通过'
    case 2:
      return '驳回'
    default:
      return '未知'
  }
}

// 获取审核状态对应的标签类型
const getAuditStatusType = (status) => {
  switch (status) {
    case 0:
      return 'info'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}





// 返回列表
const handleBack = () => {
  router.push('/supplier/my/list')
}

// 编辑
const handleEdit = () => {
  router.push(`/supplier/edit/${route.params.id}`)
}
</script>

<style scoped>
/* 面包屑 */
.breadcrumb {
  margin-bottom: 20px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 32px;
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

/* 加载容器 */
.loading-container {
  margin-bottom: 32px;
}

/* 信息卡片 */
.info-card {
  margin-bottom: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* 评分信息 */
.score-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.score {
  font-size: 18px;
  font-weight: 600;
  color: #3b82f6;
}

/* 风险评估内容 */
.risk-assess-content {
  padding: 20px 0;
}

.risk-summary {
  margin-bottom: 32px;
}

.risk-summary h4,
.risk-details h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.risk-summary p {
  color: #64748b;
  line-height: 1.5;
}

/* 风险详情 */
.risk-item {
  margin-bottom: 20px;
}

.risk-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #334155;
}

.risk-value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-top: 4px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 32px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons button {
    width: 100%;
  }
}
</style>