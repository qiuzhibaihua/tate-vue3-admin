<template>
  <div class="error-404">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-description">
        抱歉，您访问的页面不存在或已被移除
      </div>
      <div class="error-actions">
        <a-button type="primary" @click="goHome">
          <a-icon type="home" />
          返回首页
        </a-button>
        <a-button @click="goBack">
          <a-icon type="left" />
          返回上一页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  // 显示错误提示
  message.error('抱歉，您访问的页面不存在')
  
  // 可以在这里添加错误日志记录
  console.error('404 - Page not found:', window.location.pathname)
})
</script>

<style scoped>
.error-404 {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  position: relative;
}

.error-container {
  text-align: center;
  padding: 60px 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  max-width: 500px;
  width: 90%;
  animation: fadeIn 0.8s ease-out;
  position: relative;
  z-index: 2;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  line-height: 1;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.error-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 装饰元素 */
.error-404::before,
.error-404::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 1;
  animation: float 8s ease-in-out infinite;
}

.error-404::before {
  background: #667eea;
  top: 10%;
  left: 10%;
}

.error-404::after {
  background: #764ba2;
  bottom: 10%;
  right: 10%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, 20px);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .error-container {
    padding: 40px 20px;
    margin: 0 20px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 14px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions a-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>