<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Vue Admin" class="logo" />
        <h1>Vue3 Admin</h1>
        <p>欢迎使用管理系统</p>
      </div>
      
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        @finish="handleSubmit"
        layout="vertical"
      >
        <a-form-item name="username" label="用户名">
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            prefix-icon="user"
            size="large"
          />
        </a-form-item>
        
        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            visibilityToggle
            prefix-icon="lock"
            size="large"
          />
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="formState.remember" class="remember-checkbox">
            记住我
          </a-checkbox>
        </a-form-item>
        
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="login-button"
            :loading="loading"
            size="large"
          >
            {{ loading ? '登录中...' : '登录' }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

// 表单状态
const formState = reactive({
  username: 'admin',
  password: '123456',
  remember: false
})

// 表单规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
}

// 处理表单提交
const handleSubmit = async () => {
  loading.value = true
  try {
    const success = await userStore.login({
      username: formState.username,
      password: formState.password
    })
    
    if (success) {
      // 如果需要记住用户，这里可以进行额外处理
      if (formState.remember) {
        localStorage.setItem('rememberUsername', formState.username)
      } else {
        localStorage.removeItem('rememberUsername')
      }
      
      // 登录成功后跳转到首页
      router.replace('/')
    }
  } catch (error) {
    console.error('Login error:', error)
    message.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 从本地存储中恢复记住的用户名
const rememberUsername = localStorage.getItem('rememberUsername')
if (rememberUsername) {
  formState.username = rememberUsername
  formState.remember = true
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-form-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  width: 100%;
  max-width: 400px;
  animation: slideIn 0.5s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  height: 64px;
  width: 64px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

.login-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.remember-checkbox {
  float: right;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-form-wrapper {
    margin: 0 20px;
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
}
</style>