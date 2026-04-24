<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-box">
      <div class="login-header">
        <h1>小微企业供应商管理与风险评估系统</h1>
        <p>专业的供应商管理解决方案</p>
      </div>
      <el-form :model="form" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入账号" 
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock"
            show-password
            @keyup.enter="login"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" class="login-btn" :loading="loading">登录系统</el-button>
        </el-form-item>
        <div class="login-footer">
          <router-link to="/register" class="register-link">立即注册</router-link>
          <span class="copyright">© 2026 小微企业供应商管理系统</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)

const login = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  
  loading.value = true
  try {
    const res = await axios.post('/user/login', form.value)
    
    if (res.data.code === 200) {
      ElMessage.success('登录成功')
      const userData = res.data.data
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('User role:', userData.role)
      console.log('Is ADMIN:', userData.role === 'ADMIN')
      
      if (userData.role === 'ADMIN') {
        console.log('Redirecting to admin/home')
        router.push('/admin/home')
      } else {
        console.log('Redirecting to home')
        router.push('/home')
      }
    } else {
      ElMessage.error(res.data.msg || '账号或密码错误')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('登录失败，请检查后端是否启动')
  } finally {
    loading.value = false
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmMTAiIHN0cm9rZS13aWR0aD0iMSIvPgo8cGF0aCBkPSJNMzYgMzRoLTJWMTZoMnYxOHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZjEwIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+') repeat;
  opacity: 0.1;
  z-index: -1;
}

.login-box {
  position: relative;
  z-index: 2;
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  color: #666;
}

.login-form {
  width: 100%;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-form .el-input {
  height: 45px;
}

.login-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.login-footer {
  margin-top: 20px;
  text-align: center;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 10px;
  display: block;
}

.register-link:hover {
  text-decoration: underline;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  display: block;
}
</style>