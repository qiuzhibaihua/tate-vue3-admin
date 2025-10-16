import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, logoutApi, getUserInfoApi } from '@/utils/api'
import { message } from 'ant-design-vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const username = ref('')
  const avatar = ref('')
  const roles = ref([])
  const permissions = ref([])
  const menuList = ref([])
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const hasRole = computed(() => (role) => roles.value.includes(role))
  const hasPermission = computed(() => (perm) => permissions.value.includes(perm))

  // 模拟菜单数据（实际项目中应该从API获取）
  const mockMenuList = [
    {
      path: 'dashboard',
      name: 'Dashboard',
      title: '仪表盘',
      icon: 'dashboard',
      component: '/Dashboard.vue'
    },
    {
      path: 'example',
      name: 'Example',
      title: '示例功能',
      icon: 'appstore',
      children: [
        {
          path: 'target-trajectory',
          name: 'TargetTrajectory',
          title: '目标轨迹',
          component: '/example/targetTrajectory/index.vue'
        }
      ]
    },
    {
      path: 'system',
      name: 'System',
      title: '系统管理',
      icon: 'setting',
      children: [
        {
          path: 'user',
          name: 'User',
          title: '用户管理',
          component: '/system/user/index.vue'
        },
        {
          path: 'role',
          name: 'Role',
          title: '角色管理',
          component: '/system/role/index.vue'
        }
      ]
    }
  ]

  // 登录
  const login = async (credentials) => {
    loading.value = true
    try {
      // 模拟登录
      // const res = await loginApi(credentials)
      
      // 模拟成功响应
      const res = {
        code: 200,
        data: {
          token: 'mock_token_' + Date.now(),
          user: {
            username: credentials.username,
            avatar: '',
            roles: ['admin'],
            permissions: ['read', 'write', 'delete']
          }
        }
      }
      
      if (res.code === 200) {
        token.value = res.data.token
        username.value = res.data.user.username
        avatar.value = res.data.user.avatar
        roles.value = res.data.user.roles
        permissions.value = res.data.user.permissions
        menuList.value = mockMenuList
        
        // 保存到本地存储
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify({
          username: res.data.user.username,
          avatar: res.data.user.avatar,
          roles: res.data.user.roles,
          permissions: res.data.user.permissions
        }))
        
        message.success('登录成功')
        return true
      } else {
        message.error(res.message || '登录失败')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      message.error('登录失败，请重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      // 模拟登出
      // await logoutApi()
      
      // 清除状态
      token.value = ''
      username.value = ''
      avatar.value = ''
      roles.value = []
      permissions.value = []
      menuList.value = []
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      message.success('退出成功')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    if (!token.value) return
    
    try {
      // 模拟获取用户信息
      // const res = await getUserInfoApi()
      
      // 模拟成功响应
      const res = {
        code: 200,
        data: {
          username: username.value || 'admin',
          avatar: '',
          roles: ['admin'],
          permissions: ['read', 'write', 'delete'],
          menuList: mockMenuList
        }
      }
      
      if (res.code === 200) {
        username.value = res.data.username
        avatar.value = res.data.avatar
        roles.value = res.data.roles
        permissions.value = res.data.permissions
        menuList.value = res.data.menuList || mockMenuList
      }
    } catch (error) {
      console.error('Get user info error:', error)
    }
  }

  // 恢复会话
  const restoreSession = () => {
    const tokenFromStorage = localStorage.getItem('token')
    const userInfoFromStorage = localStorage.getItem('userInfo')
    
    if (tokenFromStorage && userInfoFromStorage) {
      token.value = tokenFromStorage
      try {
        const userInfo = JSON.parse(userInfoFromStorage)
        username.value = userInfo.username
        avatar.value = userInfo.avatar
        roles.value = userInfo.roles || []
        permissions.value = userInfo.permissions || []
        menuList.value = mockMenuList
      } catch (e) {
        console.error('Parse user info error:', e)
        logout()
      }
    }
  }

  // 更新权限
  const updatePermissions = (newPermissions) => {
    permissions.value = newPermissions
    // 更新本地存储
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    userInfo.permissions = newPermissions
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  }

  return {
    // 状态
    token,
    username,
    avatar,
    roles,
    permissions,
    menuList,
    loading,
    
    // 计算属性
    isLoggedIn,
    hasRole,
    hasPermission,
    
    // 方法
    login,
    logout,
    getUserInfo,
    restoreSession,
    updatePermissions
  }
})