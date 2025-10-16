import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 基础路由
const baseRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { requiresAuth: false, title: '404页面' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: baseRoutes
})

// 动态添加路由的函数
const addDynamicRoutes = () => {
  const userStore = useUserStore()
  
  // 主要布局路由
  const mainRoute = {
    path: '/',
    name: 'Main',
    component: () => import('@/components/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'target-trajectory',
        name: 'TargetTrajectory',
        component: () => import('@/views/example/targetTrajectory/index.vue'),
        meta: { title: '目标轨迹' }
      }
    ]
  }
  
  // 添加用户自定义菜单路由
  if (userStore.menuList && userStore.menuList.length > 0) {
    userStore.menuList.forEach(menu => {
      if (menu.path && menu.component) {
        mainRoute.children.push({
          path: menu.path,
          name: menu.name || menu.path,
          component: () => import(`@/views${menu.component}`),
          meta: { title: menu.title }
        })
      }
    })
  }
  
  // 检查路由是否已存在，避免重复添加
  if (!router.hasRoute('Main')) {
    router.addRoute(mainRoute)
  }
}

// 导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'Vue3 Admin'} - Dashboard`
  
  // 检查是否正在初始化
  if (window.isInitializing) {
    // 初始化期间，对于需要登录的页面，先跳转到登录页
    if (to.meta.requiresAuth) {
      next('/login')
    } else {
      next()
    }
    return
  }
  
  const userStore = useUserStore()
  
  // 不需要认证的页面直接通过
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  
  // 需要认证的页面，检查用户是否已登录
  if (userStore.isLoggedIn) {
    // 已登录，确保动态路由已加载
    if (!router.hasRoute('Main')) {
      addDynamicRoutes()
      // 重新导航到当前路由，以确保路由已注册
      next({ ...to, replace: true })
    } else {
      next()
    }
  } else {
    // 未登录，跳转到登录页
    next('/login')
  }
})

// 导航后置守卫
router.afterEach((to, from) => {
  // 可以在这里添加页面访问日志等功能
  console.log(`Navigation from ${from.path} to ${to.path}`)
})

export default router