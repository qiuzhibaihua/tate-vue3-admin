<template>
  <div class="target-trajectory">
    <a-card class="control-panel">
      <template #title>
        <div class="card-header">
          <span>控制面板</span>
          <a-button type="primary" @click="startAnimation">
            {{ isAnimating ? '暂停动画' : '开始动画' }}
          </a-button>
        </div>
      </template>
      
      <div class="controls">
        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="起点坐标">
                <a-input-group compact>
                  <a-input-number v-model:value="startX" placeholder="X" style="width: 50%" />
                  <a-input-number v-model:value="startY" placeholder="Y" style="width: 50%" />
                </a-input-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="终点坐标">
                <a-input-group compact>
                  <a-input-number v-model:value="endX" placeholder="X" style="width: 50%" />
                  <a-input-number v-model:value="endY" placeholder="Y" style="width: 50%" />
                </a-input-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="抛物线高度">
                <a-slider v-model:value="height" :min="50" :max="300" :step="10" />
                <div class="slider-value">{{ height }}px</div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="动画速度">
                <a-slider v-model:value="speed" :min="10" :max="200" :step="10" />
                <div class="slider-value">{{ speed }}ms/帧</div>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="addTrajectory">添加轨迹</a-button>
                  <a-button @click="clearTrajectories">清空轨迹</a-button>
                  <a-button @click="randomTrajectory">随机轨迹</a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    
    <div class="map-container">
      <div 
        ref="mapRef" 
        class="map" 
        @click="handleMapClick"
        :style="{ height: mapHeight }"
      >
        <canvas 
          ref="canvasRef" 
          class="canvas"
          :width="canvasWidth" 
          :height="canvasHeight"
        ></canvas>
        
        <!-- 控制点标记 -->
        <div 
          v-for="(traj, index) in trajectories" 
          :key="index"
          class="trajectory-control"
        >
          <div 
            class="control-point start-point" 
            :style="{ left: traj.startX + 'px', top: traj.startY + 'px' }"
            @click.stop="selectTrajectory(index, 'start')"
            title="起点"
          >
            <div class="point-label">起点</div>
          </div>
          <div 
            class="control-point end-point" 
            :style="{ left: traj.endX + 'px', top: traj.endY + 'px' }"
            @click.stop="selectTrajectory(index, 'end')"
            title="终点"
          >
            <div class="point-label">终点</div>
          </div>
        </div>
      </div>
    </div>
    
    <a-card class="info-panel">
      <template #title>
        <div class="card-header">
          <span>轨迹信息</span>
          <span class="trajectory-count">{{ trajectories.length }} 条轨迹</span>
        </div>
      </template>
      <div class="trajectory-list">
        <div 
          v-for="(traj, index) in trajectories" 
          :key="index"
          class="trajectory-item"
          :class="{ active: selectedIndex === index }"
          @click="selectTrajectory(index)"
        >
          <div class="trajectory-info">
            <div class="trajectory-title">轨迹 {{ index + 1 }}</div>
            <div class="trajectory-coords">
              起点: ({{ traj.startX }}, {{ traj.startY }}) → 终点: ({{ traj.endX }}, {{ traj.endY }})
            </div>
          </div>
          <a-button 
            size="small" 
            type="text" 
            danger 
            @click.stop="removeTrajectory(index)"
          >
            删除
          </a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue'

// 地图和画布引用
const mapRef = ref(null)
const canvasRef = ref(null)

// 画布尺寸
const canvasWidth = ref(1200)
const canvasHeight = ref(600)
const mapHeight = ref('600px')

// 动画状态
const isAnimating = ref(false)
const animationFrameId = ref(null)
const needUpdateParabolas = ref(false)

// 轨迹参数
const startX = ref(100)
const startY = ref(200)
const endX = ref(500)
const endY = ref(200)
const height = ref(150)
const speed = ref(50)

// 轨迹列表和选中状态
const trajectories = ref([])
const selectedIndex = ref(-1)
const selectedPoint = ref(null)

// 动画进度
const animationProgress = ref(0)
const animationProgresses = ref([])

// 添加轨迹
const addTrajectory = () => {
  // 验证坐标是否在画布范围内
  if (!isValidCoordinate(startX.value, startY.value) || !isValidCoordinate(endX.value, endY.value)) {
    message.error('坐标必须在画布范围内 (0-1200, 0-600)')
    return
  }
  
  trajectories.value.push({
    startX: startX.value,
    startY: startY.value,
    endX: endX.value,
    endY: endY.value,
    height: height.value,
    speed: speed.value
  })
  
  // 初始化进度
  animationProgresses.value.push(0)
  
  message.success('轨迹添加成功')
  
  // 如果正在动画，重新开始
  if (isAnimating.value) {
    stopAnimation()
    startAnimation()
  }
}

// 随机生成轨迹
const randomTrajectory = () => {
  startX.value = Math.floor(Math.random() * 400) + 50
  startY.value = Math.floor(Math.random() * 500) + 50
  endX.value = Math.floor(Math.random() * 400) + 750
  endY.value = Math.floor(Math.random() * 500) + 50
  height.value = Math.floor(Math.random() * 200) + 100
  speed.value = Math.floor(Math.random() * 100) + 50
  
  addTrajectory()
}

// 清空轨迹
const clearTrajectories = () => {
  trajectories.value = []
  animationProgresses.value = []
  selectedIndex.value = -1
  selectedPoint.value = null
  
  // 停止动画
  stopAnimation()
  
  // 清空画布
  drawCanvas()
  
  message.success('所有轨迹已清空')
}

// 移除指定轨迹
const removeTrajectory = (index) => {
  trajectories.value.splice(index, 1)
  animationProgresses.value.splice(index, 1)
  
  if (selectedIndex.value === index) {
    selectedIndex.value = -1
    selectedPoint.value = null
  } else if (selectedIndex.value > index) {
    selectedIndex.value--
  }
  
  message.success('轨迹已删除')
  
  // 如果正在动画且没有轨迹了，停止动画
  if (isAnimating.value && trajectories.value.length === 0) {
    stopAnimation()
  }
}

// 选择轨迹
const selectTrajectory = (index, point = null) => {
  selectedIndex.value = index
  selectedPoint.value = point
  
  // 更新表单数据
  const traj = trajectories.value[index]
  startX.value = traj.startX
  startY.value = traj.startY
  endX.value = traj.endX
  endY.value = traj.endY
  height.value = traj.height
  speed.value = traj.speed
}

// 处理地图点击
const handleMapClick = (event) => {
  if (!mapRef.value) return
  
  const rect = mapRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 如果有选中的轨迹和点，更新坐标
  if (selectedIndex.value >= 0 && selectedPoint.value) {
    const traj = trajectories.value[selectedIndex.value]
    
    if (selectedPoint.value === 'start') {
      traj.startX = x
      traj.startY = y
      startX.value = x
      startY.value = y
    } else if (selectedPoint.value === 'end') {
      traj.endX = x
      traj.endY = y
      endX.value = x
      endY.value = y
    }
    
    message.success(`已更新${selectedPoint.value === 'start' ? '起点' : '终点'}坐标`)
    
    // 重绘
    drawCanvas()
  } else {
    message.info(`点击位置: (${Math.round(x)}, ${Math.round(y)})`)
  }
}

// 开始动画
const startAnimation = () => {
  if (trajectories.value.length === 0) {
    message.warning('请先添加轨迹')
    return
  }
  
  if (isAnimating.value) {
    stopAnimation()
    return
  }
  
  isAnimating.value = true
  animate()
}

// 停止动画
const stopAnimation = () => {
  isAnimating.value = false
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
}

// 动画循环
const animate = () => {
  if (!isAnimating.value) return
  
  // 更新每个轨迹的进度
  animationProgresses.value = animationProgresses.value.map((progress, index) => {
    const traj = trajectories.value[index]
    // 根据速度计算进度增量
    const increment = 1 / (traj.speed / 10)
    let newProgress = progress + increment
    
    // 如果进度超过1，重置为0（循环动画）
    if (newProgress > 1) {
      newProgress = 0
    }
    
    return newProgress
  })
  
  // 绘制轨迹
  drawCanvas()
  
  // 继续动画
  animationFrameId.value = requestAnimationFrame(() => {
    setTimeout(animate, 16) // 约60fps
  })
}

// 绘制画布
const drawCanvas = () => {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制所有轨迹
  trajectories.value.forEach((trajectory, index) => {
    drawParabola(
      ctx,
      trajectory.startX,
      trajectory.startY,
      trajectory.endX,
      trajectory.endY,
      trajectory.height,
      index === selectedIndex.value,
      animationProgresses.value[index] || 0
    )
  })
}

// 绘制抛物线
const drawParabola = (ctx, x1, y1, x2, y2, h, isSelected, progress) => {
  // 设置样式
  ctx.strokeStyle = isSelected ? '#1890ff' : '#666'
  ctx.lineWidth = isSelected ? 3 : 2
  ctx.beginPath()
  
  // 计算抛物线参数
  const dx = x2 - x1
  const dy = y2 - y1
  const midX = x1 + dx / 2
  const midY = y1 + dy / 2 - h
  
  // 绘制抛物线（使用贝塞尔曲线模拟）
  ctx.moveTo(x1, y1)
  ctx.quadraticCurveTo(midX, midY, x2, y2)
  ctx.stroke()
  
  // 如果有动画进度，绘制运动的点
  if (progress > 0) {
    // 计算当前位置
    const t = progress
    const currentX = (1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * midX + t * t * x2
    const currentY = (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * midY + t * t * y2
    
    // 绘制运动点
    ctx.fillStyle = '#ff4d4f'
    ctx.beginPath()
    ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI)
    ctx.fill()
    
    // 绘制轨迹尾部（已走过的部分）
    ctx.strokeStyle = '#ff4d4f'
    ctx.lineWidth = 4
    ctx.beginPath()
    
    // 绘制部分抛物线
    for (let i = 0; i <= t; i += 0.01) {
      const px = (1 - i) * (1 - i) * x1 + 2 * i * (1 - i) * midX + i * i * x2
      const py = (1 - i) * (1 - i) * y1 + 2 * i * (1 - i) * midY + i * i * y2
      
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.stroke()
  }
  
  // 绘制控制点（如果是选中状态）
  if (isSelected) {
    // 起点
    ctx.fillStyle = '#52c41a'
    ctx.beginPath()
    ctx.arc(x1, y1, 8, 0, 2 * Math.PI)
    ctx.fill()
    
    // 终点
    ctx.fillStyle = '#faad14'
    ctx.beginPath()
    ctx.arc(x2, y2, 8, 0, 2 * Math.PI)
    ctx.fill()
    
    // 顶点
    ctx.fillStyle = '#999'
    ctx.beginPath()
    ctx.arc(midX, midY, 4, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// 验证坐标是否有效
const isValidCoordinate = (x, y) => {
  return x >= 0 && x <= canvasWidth.value && y >= 0 && y <= canvasHeight.value
}

// 监听轨迹变化，重新绘制
watch(trajectories, () => {
  drawCanvas()
}, { deep: true })

// 监听需要更新的标志
watch(needUpdateParabolas, (newVal) => {
  if (newVal) {
    // 使用nextTick确保DOM更新后再绘制
    nextTick(() => {
      drawCanvas()
      needUpdateParabolas.value = false
    })
  }
})

// 组件挂载后初始化
onMounted(async () => {
  // 等待DOM更新
  await nextTick()
  
  // 初始化画布
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    
    // 绘制背景网格
    ctx.strokeStyle = '#e8e8e8'
    ctx.lineWidth = 1
    
    // 绘制垂直线
    for (let x = 0; x <= canvasWidth.value; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight.value)
      ctx.stroke()
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvasHeight.value; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth.value, y)
      ctx.stroke()
    }
  }
  
  // 添加一些模拟数据
  randomTrajectory()
  randomTrajectory()
})

// 组件卸载时清理
onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.target-trajectory {
  padding: 24px;
}

.control-panel {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls {
  padding: 16px 0;
}

.slider-value {
  text-align: center;
  color: #666;
  margin-top: 8px;
}

.map-container {
  margin-bottom: 24px;
}

.map {
  position: relative;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  cursor: crosshair;
  transition: all 0.3s;
}

.map:hover {
  border-color: #1890ff;
}

.canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.control-point {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: move;
  transition: all 0.3s;
  z-index: 10;
}

.control-point:hover {
  transform: scale(1.2);
}

.start-point {
  background-color: #52c41a;
}

.end-point {
  background-color: #faad14;
}

.point-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.info-panel {
  margin-top: 24px;
}

.trajectory-count {
  color: #666;
  font-size: 14px;
}

.trajectory-list {
  max-height: 300px;
  overflow-y: auto;
}

.trajectory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.trajectory-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.trajectory-item.active {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.trajectory-info {
  flex: 1;
}

.trajectory-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.trajectory-coords {
  font-size: 12px;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .target-trajectory {
    padding: 16px;
  }
  
  .map {
    height: 400px !important;
  }
  
  .canvas {
    width: 100%;
    height: 100%;
  }
}
</style>