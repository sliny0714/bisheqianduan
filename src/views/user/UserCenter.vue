<template>
  <UserLayout>
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>个人中心</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-description">管理您的账户设置</p>
    </div>

    <!-- 用户信息卡片 -->
    <el-card class="info-card" shadow="hover">
      <template #header>
        <span class="header-title">基本信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">
          <span class="info-value">{{ userInfo.username }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="真实姓名">
          <span class="info-value">{{ userInfo.realName || '未设置' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="userInfo.role === 'ADMIN' ? 'danger' : 'primary'" effect="light">
            {{ userInfo.role === 'ADMIN' ? '管理员' : '普通用户' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="账户状态">
          <el-tag :type="userInfo.status === 1 ? 'success' : 'info'" effect="light">
            {{ userInfo.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          <span class="info-value">{{ formatDate(userInfo.createTime) || '未知' }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 修改密码卡片 -->
    <el-card class="password-card" shadow="hover" style="margin-top: 24px;">
      <template #header>
        <span class="header-title">修改密码</span>
      </template>
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="120px"
        class="password-form"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetPasswordForm">重置</el-button>
            <el-button type="primary" @click="updatePassword" :loading="submitting">
              修改密码
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 退出登录 -->
    <el-card class="logout-card" shadow="hover" style="margin-top: 24px;">
      <div class="logout-section">
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </el-card>
  </UserLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import UserLayout from './layout/UserLayout.vue'
import { updateUserPassword } from '../../api/user/business'
import { formatDate } from '../../utils/date'

const router = useRouter()

// 用户信息
const userInfo = reactive({
  id: '',
  username: '',
  realName: '',
  role: '',
  status: 1,
  createTime: ''
})

// 密码表单
const passwordFormRef = ref(null)
const submitting = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化用户信息
const initUserInfo = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    Object.assign(userInfo, user)
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 更新密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await updateUserPassword({
          userId: userInfo.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          localStorage.removeItem('user')
          router.push('/login')
        } else {
          ElMessage.error(res.msg || '修改密码失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('修改密码失败，请检查旧密码是否正确')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('user')
    ElMessage.success('退出成功')
    router.push('/login')
  }).catch(() => {
    // 捕获用户取消操作，不做任何处理
  })
}

onMounted(() => {
  initUserInfo()
})
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

/* 信息卡片 */
.info-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.info-value {
  font-weight: 500;
  color: #475569;
}

/* 密码卡片 */
.password-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.password-form {
  padding: 10px 0;
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 退出登录卡片 */
.logout-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.logout-section {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }

  .logout-section {
    justify-content: center;
  }
}
</style>