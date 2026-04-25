<template>
  <admin-layout>
    <div class="risk-manage">
      <!-- 页面标题区域 -->
      <div class="page-header">
        <h1 class="page-title">风险评估管理</h1>
        <p class="page-description">仅显示：已审核通过 + 已上传资质文件的供应商</p>
      </div>

    <!-- 表格卡片 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <!-- 搜索与筛选栏 -->
          <div class="search-bar">
            <!-- 供应商名称搜索 -->
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

            <!-- 风险等级筛选 -->
            <el-select v-model="riskLevelFilter" placeholder="风险等级" clearable style="width: 150px">
              <el-option label="低" value="低" />
              <el-option label="中" value="中" />
              <el-option label="高" value="高" />
            </el-select>

            <!-- 搜索按钮 -->
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </div>
          <div class="action-bar">
            <el-dropdown>
              <el-button type="success"><el-icon><Download /></el-icon>导出</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="exportExcel">导出 Excel</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <!-- 风险评估列表 -->
      <el-table
        v-loading="loading"
        :data="riskList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="评估ID" width="80" />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        
        <!-- 风险分数，为空时显示 - -->
        <el-table-column prop="score" label="风险分数" width="100">
          <template #default="scope">
            {{ scope.row.score ?? '-' }}
          </template>
        </el-table-column>

        <!-- 风险等级标签 -->
        <el-table-column prop="level" label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getRiskLevelType(scope.row.level)" effect="dark">
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 评估摘要 -->
        <el-table-column prop="summary" label="评估摘要" min-width="300" show-overflow-tooltip />
        
        <!-- 评估时间，为空时显示 - -->
        <el-table-column prop="assessTime" label="评估时间" width="180">
          <template #default="scope">
            {{ scope.row.assessTime ?? '-' }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <!-- 未评估：显示开始评估 -->
            <el-button
              type="primary"
              size="small"
              @click="handleReassess(scope.row)"
              :loading="reassessingId === scope.row.supplierId"
              v-if="scope.row.level === '未评估'"
            >
              开始评估
            </el-button>

            <!-- 已评估：显示重新评估 -->
            <el-button
              type="warning"
              size="small"
              @click="handleReassess(scope.row)"
              :loading="reassessingId === scope.row.id"
              v-else
            >
              重新评估
            </el-button>

            <!-- 查看详情 -->
            <el-button
              type="primary"
              size="small"
              @click="handleDetail(scope.row)"
              style="margin-left:5px"
            >
              <el-icon><View /></el-icon> 详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
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

    <!-- 风险评估详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="风险评估详情"
      width="600px"
    >
      <el-descriptions :column="1" border v-if="currentRisk">
        <el-descriptions-item label="记录ID">{{ currentRisk.id }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ currentRisk.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="风险分数">{{ currentRisk.score ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="getRiskLevelType(currentRisk.level)" effect="dark">
            {{ currentRisk.level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="评估摘要">{{ currentRisk.summary }}</el-descriptions-item>
        <el-descriptions-item label="评估时间">{{ currentRisk.assessTime ?? '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
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
import { Search, View, Download } from '@element-plus/icons-vue'
import request from '../../api/request'
import * as XLSX from 'xlsx'

// 加载状态
const loading = ref(false)
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)
// 总条数
const total = ref(0)
// 搜索关键词（供应商名称）
const searchKeyword = ref('')
// 风险等级筛选
const riskLevelFilter = ref('')
// 详情弹窗显示状态
const detailDialogVisible = ref(false)
// 当前查看的风险记录
const currentRisk = ref(null)
// 评估中按钮加载状态
const reassessingId = ref(null)
// 风险评估列表数据
const riskList = ref([])

// 页面加载时获取数据
onMounted(() => {
  getRiskList()
})

/**
 * @description 获取风险评估列表（支持分页、搜索、筛选）
 * 仅查询：审核通过 + 有资质文件的供应商
 */
const getRiskList = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/risk/list',
      method: 'get',
      params: {
        keyword: searchKeyword.value,
        level: riskLevelFilter.value,
        pageNum: currentPage.value,
        pageSize: pageSize.value
      }
    })

    if (res.code === 200) {
      riskList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error('获取数据失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('请求失败')
  } finally {
    loading.value = false
  }
}

/**
 * @description 搜索/重置查询
 */
const handleSearch = () => {
  currentPage.value = 1
  getRiskList()
}

/**
 * @description 切换每页显示条数
 * @param {number} size 每页条数
 */
const handleSizeChange = (size) => {
  pageSize.value = size
  getRiskList()
}

/**
 * @description 切换页码
 * @param {number} current 目标页码
 */
const handleCurrentChange = (current) => {
  currentPage.value = current
  getRiskList()
}

/**
 * @description 查看风险评估详情
 * @param {object} row 当前行数据
 */
const handleDetail = (row) => {
  currentRisk.value = row
  detailDialogVisible.value = true
}

/**
 * @description 开始评估 / 重新评估供应商风险
 * @param {object} row 当前行数据
 */
const handleReassess = async (row) => {
  reassessingId.value = row.level === '未评估' ? row.supplierId : row.id
  try {
    const res = await request({
      url: '/risk/assess',
      method: 'get',
      params: { supplierId: row.supplierId }
    })
    if (res.code === 200) {
      ElMessage.success('评估成功！')
      getRiskList()
    } else {
      ElMessage.error('评估失败')
    }
  } catch (error) {
    ElMessage.error('请求异常')
  } finally {
    reassessingId.value = null
  }
}

/**
 * @description 根据风险等级返回对应标签类型
 * @param {string} level 风险等级
 * @returns 标签类型
 */
const getRiskLevelType = (level) => {
  switch (level) {
    case '低': return 'success'
    case '中': return 'warning'
    case '高': return 'danger'
    default: return 'info'
  }
}

// 导出 Excel 功能
const exportExcel = () => {
  if (riskList.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  // 准备导出数据
  const exportData = riskList.value.map(item => ({
    '评估ID': item.id,
    '供应商名称': item.supplierName,
    '风险分数': item.score ?? '-',
    '风险等级': item.level,
    '评估摘要': item.summary || '',
    '评估时间': item.assessTime || '-'
  }))
  
  // 创建工作簿和工作表
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '风险评估列表')
  
  // 导出文件
  XLSX.writeFile(wb, `风险评估列表_${new Date().toISOString().slice(0, 10)}.xlsx`)
  
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.risk-manage {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}
.breadcrumb { margin-bottom: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600;color: #303133; margin: 0 0 8px 0; }
.page-description { font-size: 14px; color: #909399; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.table-card { border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>