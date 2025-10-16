import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import 'leaflet/dist/leaflet.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// 创建Vue应用实例
const app = createApp(App)

// 创建Pinia状态管理实例
const pinia = createPinia()

// 全局初始化状态
window.isInitializing = true

// 使用插件
app.use(pinia)
app.use(router)
app.use(Antd)

// 挂载应用
app.mount('#app')

// 初始化完成
setTimeout(() => {
  window.isInitializing = false
}, 1000)

console.log('Vue3 Admin Dashboard 已启动')