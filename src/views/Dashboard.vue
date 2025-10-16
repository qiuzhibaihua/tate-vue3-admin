<template>
  <div class="dashboard">
    <h1>仪表盘</h1>
    
    <div class="stats-cards">
      <a-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #e6f7ff; color: #1890ff;">
            <a-icon type="user" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
          <div class="stat-trend" :class="{ positive: userGrowth > 0, negative: userGrowth < 0 }">
            <a-icon :type="userGrowth > 0 ? 'arrow-up' : 'arrow-down'" />
            {{ Math.abs(userGrowth) }}%
          </div>
        </div>
      </a-card>
      
      <a-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #f6ffed; color: #52c41a;">
            <a-icon type="shopping-cart" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalOrders }}</div>
            <div class="stat-label">总订单数</div>
          </div>
          <div class="stat-trend" :class="{ positive: orderGrowth > 0, negative: orderGrowth < 0 }">
            <a-icon :type="orderGrowth > 0 ? 'arrow-up' : 'arrow-down'" />
            {{ Math.abs(orderGrowth) }}%
          </div>
        </div>
      </a-card>
      
      <a-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #fff2e8; color: #fa8c16;">
            <a-icon type="dollar" />
          </div>
          <div class="stat-info">
            <div class="stat-number">¥{{ totalRevenue.toLocaleString() }}</div>
            <div class="stat-label">总收入</div>
          </div>
          <div class="stat-trend" :class="{ positive: revenueGrowth > 0, negative: revenueGrowth < 0 }">
            <a-icon :type="revenueGrowth > 0 ? 'arrow-up' : 'arrow-down'" />
            {{ Math.abs(revenueGrowth) }}%
          </div>
        </div>
      </a-card>
      
      <a-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #f9f0ff; color: #722ed1;">
            <a-icon type="star" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ avgRating.toFixed(1) }}</div>
            <div class="stat-label">平均评分</div>
          </div>
          <div class="stat-trend" :class="{ positive: ratingChange > 0, negative: ratingChange < 0 }">
            <a-icon :type="ratingChange > 0 ? 'arrow-up' : 'arrow-down'" />
            {{ Math.abs(ratingChange).toFixed(1) }}
          </div>
        </div>
      </a-card>
    </div>
    
    <div class="charts-section">
      <a-card class="chart-card">
        <template #title>
          <div class="card-header">
            <span>销售趋势</span>
            <a-select size="small" :value="timeRange" @change="handleTimeRangeChange">
              <a-select-option value="week">本周</a-select-option>
              <a-select-option value="month">本月</a-select-option>
              <a-select-option value="quarter">本季度</a-select-option>
              <a-select-option value="year">本年</a-select-option>
            </a-select>
          </div>
        </template>
        <div class="chart-container">
          <!-- 这里可以放置图表组件 -->
          <div class="chart-placeholder">销售趋势图表</div>
        </div>
      </a-card>
      
      <a-card class="chart-card">
        <template #title>
          <div class="card-header">
            <span>用户分布</span>
            <a-button size="small" type="text">查看详情</a-button>
          </div>
        </template>
        <div class="chart-container">
          <!-- 这里可以放置图表组件 -->
          <div class="chart-placeholder">用户分布图表</div>
        </div>
      </a-card>
    </div>
    
    <div class="recent-activities">
      <a-card>
        <template #title>
          <div class="card-header">
            <span>最近活动</span>
            <a-button size="small" type="primary" ghost>
              <a-icon type="plus" />
              添加活动
            </a-button>
          </div>
        </template>
        <a-table :columns="columns" :data-source="activities" pagination={false} row-key="id">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'time'">
              {{ formatTime(record.time) }}
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button size="small" type="link">查看</a-button>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'

// 统计数据
const totalUsers = ref(1280)
const totalOrders = ref(8920)
const totalRevenue = ref(589200)
const avgRating = ref(4.8)

// 增长率
const userGrowth = ref(12.5)
const orderGrowth = ref(8.3)
const revenueGrowth = ref(15.2)
const ratingChange = ref(0.2)

// 时间范围
const timeRange = ref('month')

// 活动数据
const activities = ref([
  {
    id: 1,
    user: '张三',
    action: '创建了新订单',
    time: new Date(Date.now() - 1000 * 60 * 5),
    status: 'success'
  },
  {
    id: 2,
    user: '李四',
    action: '更新了产品信息',
    time: new Date(Date.now() - 1000 * 60 * 15),
    status: 'processing'
  },
  {
    id: 3,
    user: '王五',
    action: '删除了用户账户',
    time: new Date(Date.now() - 1000 * 60 * 30),
    status: 'error'
  },
  {
    id: 4,
    user: '赵六',
    action: '添加了新评论',
    time: new Date(Date.now() - 1000 * 60 * 60),
    status: 'success'
  },
  {
    id: 5,
    user: '钱七',
    action: '修改了订单状态',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'warning'
  }
])

// 表格列配置
const columns = [
  {
    title: '用户',
    dataIndex: 'user',
    key: 'user',
    width: 100
  },
  {
    title: '活动',
    dataIndex: 'action',
    key: 'action'
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right'
  }
]

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  timeRange.value = value
  message.success(`已切换到${getTimeRangeText(value)}视图`)
  // 这里可以根据时间范围重新加载数据
}

// 格式化时间
const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString()
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    success: 'green',
    processing: 'blue',
    error: 'red',
    warning: 'orange'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    success: '成功',
    processing: '处理中',
    error: '失败',
    warning: '警告'
  }
  return texts[status] || status
}

// 获取时间范围文本
const getTimeRangeText = (range) => {
  const texts = {
    week: '本周',
    month: '本月',
    quarter: '本季度',
    year: '本年'
  }
  return texts[range] || range
}

onMounted(() => {
  console.log('Dashboard loaded')
  // 这里可以加载真实数据
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
}

.dashboard h1 {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-trend {
  font-size: 14px;
  font-weight: 500;
}

.stat-trend.positive {
  color: #52c41a;
}

.stat-trend.negative {
  color: #ff4d4f;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: calc(100% - 50px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  color: #999;
  font-size: 16px;
}

.recent-activities {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>