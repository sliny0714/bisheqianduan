<template>
  <div class="ai-assistant-container" :class="{ 'expanded': isExpanded }">
    <!-- 悬浮按钮 -->
    <div 
      class="assistant-button" 
      @click="toggleExpanded"
      :class="{ 'active': isExpanded }"
    >
      <el-icon v-if="!isExpanded"><Message /></el-icon>
      <el-icon v-else><Close /></el-icon>
    </div>

    <!-- 聊天窗口 -->
    <div class="chat-window" v-if="isExpanded">
      <div class="chat-header">
        <el-icon><Message /></el-icon>
        <span>智能小助手</span>
      </div>
      
      <div class="chat-body">
        <div class="message ai-message" v-if="answer">
          <div class="message-content">{{ answer }}</div>
        </div>
        <div class="message ai-message" v-else>
          <div class="message-content">您好，我是智能小助手，有什么可以帮助您的？</div>
        </div>
      </div>
      
      <div class="chat-footer">
        <el-input 
          v-model="question" 
          @keyup.enter="sendMessage"
          placeholder="请输入问题..."
          size="small"
        />
        <el-button 
          type="primary" 
          size="small" 
          @click="sendMessage"
          :loading="isLoading"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Message, Close } from '@element-plus/icons-vue'
import { chat } from '../api/rag'

const isExpanded = ref(false)
const question = ref('')
const answer = ref('')
const isLoading = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const sendMessage = async () => {
  if (!question.value) {
    ElMessage.warning('请输入问题')
    return
  }
  
  isLoading.value = true
  answer.value = '思考中...'
  console.log('发送问题:', question.value)
  
  try {
    const res = await chat(question.value)
    console.log('收到响应:', res)
    answer.value = res.data
    console.log('设置答案:', answer.value)
  } catch (error) {
    console.error('聊天失败:', error)
    answer.value = '抱歉，我暂时无法回答您的问题，请稍后再试。'
  } finally {
    isLoading.value = false
    question.value = ''
    console.log('发送完成')
  }
}
</script>

<style scoped>
.ai-assistant-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.assistant-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #667eea);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  color: white;
}

.assistant-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.assistant-button.active {
  background: #f56c6c;
}

.assistant-button .el-icon {
  font-size: 24px;
}

.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  height: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7fa;
  border-radius: 12px 12px 0 0;
}

.chat-header .el-icon {
  font-size: 18px;
  color: #409EFF;
}

.chat-header span {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fafafa;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.ai-message {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px 18px 18px 4px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-size: 14px;
  line-height: 1.4;
  color: #303133;
}

.chat-footer {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
  background: white;
  border-radius: 0 0 12px 12px;
}

.chat-footer .el-input {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-window {
    width: 300px;
    height: 400px;
  }
  
  .ai-assistant-container {
    bottom: 20px;
    right: 20px;
  }
  
  .assistant-button {
    width: 50px;
    height: 50px;
  }
  
  .assistant-button .el-icon {
    font-size: 20px;
  }
}
</style>