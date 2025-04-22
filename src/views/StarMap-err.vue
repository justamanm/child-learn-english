<script setup lang="js">
import { ref, onMounted, nextTick, computed, onBeforeUnmount, watchEffect, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVocabularyStore } from '../stores/vocabulary'
import { useUserProgressStore } from '../stores/userProgress'

// 导入行星图片
import mercuryImg from '../assets/imgs/mercury.webp'
import venusImg from '../assets/imgs/venus.avif'
import earthImg from '../assets/imgs/earth.webp'
import marsImg from '../assets/imgs/mars.webp'
import jupiterImg from '../assets/imgs/jupiter.webp'

const router = useRouter()
const vocabStore = useVocabularyStore()
const progressStore = useUserProgressStore()

const navHeight = ref(69)
const units = ref(vocabStore.getAllUnits)
const hoveredUnit = ref(null)
const solarSystemContainer = ref(null)
const isMobileDevice = ref(false)
const showScrollHint = ref(true)
const isDragging = ref(false)
const isTrackpadDragging = ref(false)
const isWheeling = ref(false)
const startX = ref(0)
const startY = ref(0)
const scrollLeft = ref(0)
const scrollTop = ref(0)
const sun = ref()

// 添加调试面板显示状态控制
const showDebugPanel = ref(false);
const showZoomIndicator = ref(false);

// 添加新的响应式变量跟踪鼠标位置
const mouseDebugInfo = ref({
  x: 0,
  y: 0,
  pageX: 0,
  pageY: 0,
  isDragging: false,
  scrollLeft: 0,
  scrollTop: 0
});

// 更新卡片位置的标志，用于强制更新
const updateCardPosition = ref(0);

// 添加计算窗口宽度的计算属性
const windowWidth = ref(0);

// 添加跟踪点击状态的变量
const isJustClick = ref(true);
const clickTimer = ref(null);
const touchStartTime = ref(0);
const touchMoved = ref(false);

// 添加一个新的变量来控制旋转状态
const isRotating = ref(false)
const allImagesLoaded = ref(false) // 添加图片加载状态变量

// 添加转速控制变量
const rotationSpeedMultiplier = ref(1.0); // 默认速度倍率为1.0
const minSpeedMultiplier = 0.1; // 最小速度倍率
const maxSpeedMultiplier = 3.0; // 最大速度倍率
const speedStep = 0.2; // 每次点击增加/减少的速度步长

// 添加新的变量来跟踪触摸点的初始位置和移动
const initialTouchPositions = ref([]);

// 添加真实比例控制变量
const useRealProportions = ref(false); // 默认使用接近比例而非真实比例

const scale = ref(1) // 缩放比例
const minScale = computed(() => useRealProportions.value ? 0.3 : 0.5) // 最小缩放比例
const maxScale = computed(() => useRealProportions.value ? 1.5 : 1.5) // 最大缩放比例

// 修改行星信息部分，添加base字段和卫星信息
const planetInfo = {
  'sun': {
    name: '太阳',
    color: '#FFC107',
    base: null,  // 太阳没有基准天体，是整个系统的中心
    size: 250,   // 太阳的基础大小
  },
  'mercury': {
    name: '水星',
    color: '#FFB74D',
    base: 'sun',  // 围绕太阳运动
    orbitRatio: 0.39,  // 距离太阳的相对距离（天文单位）
    sizeRatio: 0.038,  // 相对于地球的尺寸比例
  },
  'venus': {
    name: '金星',
    color: '#FF8A65',
    base: 'sun',
    orbitRatio: 0.72,
    sizeRatio: 0.95,
  },
  'earth': {
    name: '地球',
    color: '#4DB6AC',
    base: 'sun',
    orbitRatio: 1.0,  // 地球距离太阳1个天文单位，作为基准
    sizeRatio: 1.0,   // 地球大小作为基准
  },
  'moon': {
    name: '月球',
    color: '#E0E0E0',
    base: 'earth',  // 围绕地球运动
    orbitRatio: 0.00257,  // 月球到地球的距离约为地球到太阳距离的0.00257倍
    sizeRatio: 0.273,  // 月球大小约为地球的0.273倍
  },
  'mars': {
    name: '火星',
    color: '#E57373',
    base: 'sun',
    orbitRatio: 1.52,
    sizeRatio: 0.53,
  },
  'phobos': {
    name: '火卫一',
    color: '#BDBDBD',
    base: 'mars',
    orbitRatio: 0.00016,  // 火卫一距离火星非常近
    sizeRatio: 0.005,  // 火卫一非常小
  },
  'deimos': {
    name: '火卫二',
    color: '#9E9E9E',
    base: 'mars',
    orbitRatio: 0.00041,  // 火卫二距离火星稍远
    sizeRatio: 0.003,  // 火卫二更小
  },
  'jupiter': {
    name: '木星',
    color: '#F06292',
    base: 'sun',
    orbitRatio: 5.2,
    sizeRatio: 11.2,
  },
  'europa': {
    name: '木卫二',
    color: '#F5F5F5',
    base: 'jupiter',
    orbitRatio: 0.0048,  // 相对于地日距离
    sizeRatio: 0.245,  // 相对于地球大小
  },
  'io': {
    name: '木卫一',
    color: '#FFEB3B',
    base: 'jupiter',
    orbitRatio: 0.0028,  // 相对于地日距离
    sizeRatio: 0.286,  // 相对于地球大小
  },
}

// 行星ID映射到天体数据
const planetMapping = {
  'space-exploration': 'mercury',
  'science-lab': 'venus',
  'technology': 'earth',
  'mathematics': 'mars',
  'robotics': 'jupiter'
}

// 卫星映射，每个行星对应的卫星列表
const satelliteMapping = {
  'earth': ['moon'],
  'mars': ['phobos', 'deimos'],
  'jupiter': ['io', 'europa']
}

// 添加天体角度和位置数据存储
const celestialAngles = ref({})  // 存储所有天体的角度
const celestialPositions = ref({})  // 存储所有天体的位置

// 地球尺寸基准（观赏模式）
const earthBaseSizeAlmost = 45;
// 地球到太阳距离基准（观赏模式）
const earthOrbitRadiusAlmost = 350;

// 地球尺寸基准（真实比例）
const earthBaseSizeReal = 1;
// 地球到太阳距离基准（真实比例）
const earthOrbitRadiusReal = 100;

// 根据是否使用真实比例，获取地球基础尺寸
const earthBaseSize = computed(() => {
  return useRealProportions.value ? earthBaseSizeReal : earthBaseSizeAlmost;
})

// 根据是否使用真实比例，获取地球轨道基础半径
const earthOrbitRadius = computed(() => {
  return useRealProportions.value ? earthOrbitRadiusReal : earthOrbitRadiusAlmost;
})

// 初始化所有天体的角度
function initCelestialAngles() {
  const angles = {}
  
  // 先为所有行星设置随机初始角度
  Object.keys(planetInfo).forEach(bodyId => {
    // 对每个天体初始化公转角度和自转角度
    angles[bodyId] = {
      orbit: Math.random() * 360,  // 公转角度，0-360度随机值
      rotation: Math.random() * 360  // 自转角度，0-360度随机值
    }
  })
  
  celestialAngles.value = angles
}

// 初始化所有天体的位置
function initCelestialPositions() {
  celestialPositions.value = {}
  updateCelestialPositions()
}

// 更新所有天体的位置
function updateCelestialPositions() {
  const positions = {}
  
  // 计算太阳位置（中心）
  positions['sun'] = { x: 0, y: 0 }
  
  // 递归计算所有天体的位置
  Object.keys(planetInfo).forEach(bodyId => {
    if (bodyId !== 'sun') {
      calculateCelestialPosition(bodyId, positions)
    }
  })
  
  celestialPositions.value = positions
}

// 递归计算天体位置
function calculateCelestialPosition(bodyId, positions) {
  // 如果已经计算过位置，直接返回
  if (positions[bodyId]) return positions[bodyId]
  
  const body = planetInfo[bodyId]
  
  // 如果没有base，返回原点位置
  if (!body.base) {
    positions[bodyId] = { x: 0, y: 0 }
    return positions[bodyId]
  }
  
  // 先确保base的位置已经计算
  const basePosition = positions[body.base] || calculateCelestialPosition(body.base, positions)
  
  // 获取天体的轨道半径
  let orbitRadius
  if (body.base === 'sun') {
    // 如果围绕太阳，使用地球轨道作为基准
    orbitRadius = earthOrbitRadius.value * body.orbitRatio
  } else {
    // 如果围绕其他天体，使用地球轨道作为参考，但要考虑比例
    orbitRadius = earthOrbitRadius.value * body.orbitRatio * 6 // 放大卫星轨道以便可视化
  }
  
  // 获取天体的轨道角度
  const angle = celestialAngles.value[bodyId]?.orbit || 0
  const angleRad = angle * (Math.PI / 180)
  
  // 计算相对于base的位置
  const relX = Math.cos(angleRad) * orbitRadius
  const relY = Math.sin(angleRad) * orbitRadius
  
  // 计算绝对位置
  positions[bodyId] = {
    x: basePosition.x + relX,
    y: basePosition.y + relY
  }
  
  return positions[bodyId]
}

// 计算天体大小
function getCelestialSize(bodyId) {
  const body = planetInfo[bodyId]
  
  if (bodyId === 'sun') {
    return body.size
  }
  
  // 使用地球尺寸作为基准
  return earthBaseSize.value * body.sizeRatio * (body.base === 'sun' ? 1 : 2) // 放大卫星以便可视化
}

// 更新天体运动
function updateCelestialMotion() {
  if (!isRotating.value) return
  
  // 更新所有天体的角度
  Object.keys(planetInfo).forEach(bodyId => {
    if (!celestialAngles.value[bodyId]) {
      celestialAngles.value[bodyId] = { orbit: 0, rotation: 0 }
    }
    
    // 不同天体的公转和自转速度
    let orbitSpeed = 1
    let rotationSpeed = 1
    
    // 根据天体类型设置不同的速度
    if (bodyId === 'sun') {
      orbitSpeed = 0
      rotationSpeed = 0.1
    } else if (planetInfo[bodyId].base === 'sun') {
      // 行星围绕太阳的速度，根据距离调整
      orbitSpeed = 1 / Math.pow(planetInfo[bodyId].orbitRatio, 1.5) // 开普勒第三定律的简化实现
      rotationSpeed = 0.5
    } else {
      // 卫星围绕行星的速度，比行星围绕太阳快
      orbitSpeed = 5
      rotationSpeed = 1
    }
    
    // 更新公转角度
    celestialAngles.value[bodyId].orbit = 
      (celestialAngles.value[bodyId].orbit + rotationSpeedMultiplier.value * orbitSpeed * 0.5) % 360
    
    // 更新自转角度
    celestialAngles.value[bodyId].rotation = 
      (celestialAngles.value[bodyId].rotation + rotationSpeedMultiplier.value * rotationSpeed * 0.5) % 360
  })
  
  // 更新所有天体位置
  updateCelestialPositions()
}

// 修改updateClock函数
function updateClock() {
  if (isRotating.value) {
    // 更新所有天体运动
    updateCelestialMotion()
  }
  
  // 请求下一帧动画
  requestAnimationFrame(updateClock);
}

// 在组件挂载或数据初始化时调用
function initCelestialBodies() {
  initCelestialAngles()
  initCelestialPositions()
}

// 添加缺失的计算属性和变量
const showPlanetNames = ref(true); // 添加显示行星名称的控制变量

// 计算太阳系容器的尺寸
const scaledSize = computed(() => {
  const baseSize = 2000; // 基础大小
  return {
    width: baseSize,
    height: baseSize
  };
});

// 获取行星状态
function getUnitStatus(unitId) {
  // 检查单元的完成状态
  const unitProgress = progressStore.getUnitProgress(unitId);
  if (unitProgress && unitProgress.completed) {
    return 'completed';
  } else if (unitProgress && unitProgress.started) {
    return 'started';
  }
  return 'locked';
}

// 获取行星图片
function getPlanetImage(unitId) {
  const planetId = planetMapping[unitId];
  switch (planetId) {
    case 'mercury': return mercuryImg;
    case 'venus': return venusImg;
    case 'earth': return earthImg;
    case 'mars': return marsImg;
    case 'jupiter': return jupiterImg;
    default: return '';
  }
}

// 处理行星点击
function handlePlanetClick(unit) {
  const unitProgress = progressStore.getUnitProgress(unit.id);
  if (unitProgress && (unitProgress.started || unitProgress.completed)) {
    router.push(`/unit/${unit.id}`);
  }
}

// 处理行星悬停
function handlePlanetHover(unit) {
  hoveredUnit.value = unit;
}

// 处理行星离开
function handlePlanetLeave() {
  hoveredUnit.value = null;
}

// 鼠标移动处理
function handleMouseMove(e) {
  if (!solarSystemContainer.value) return;
  
  mouseDebugInfo.value = {
    x: e.clientX,
    y: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    isDragging: isDragging.value,
    scrollLeft: solarSystemContainer.value.scrollLeft,
    scrollTop: solarSystemContainer.value.scrollTop
  };
  
  if (isDragging.value) {
    const x = e.pageX - solarSystemContainer.value.offsetLeft;
    const y = e.pageY - solarSystemContainer.value.offsetTop;
    const walkX = (x - startX.value) * 1;
    const walkY = (y - startY.value) * 1;
    
    solarSystemContainer.value.scrollLeft = scrollLeft.value - walkX;
    solarSystemContainer.value.scrollTop = scrollTop.value - walkY;
    
    // 如果鼠标移动超过一定距离，则不是简单的点击
    if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
      isJustClick.value = false;
    }
  }
}

// 鼠标按下处理
function handleMouseDown(e) {
  if (!solarSystemContainer.value) return;
  
  isDragging.value = true;
  isJustClick.value = true;
  startX.value = e.pageX - solarSystemContainer.value.offsetLeft;
  startY.value = e.pageY - solarSystemContainer.value.offsetTop;
  scrollLeft.value = solarSystemContainer.value.scrollLeft;
  scrollTop.value = solarSystemContainer.value.scrollTop;
  
  solarSystemContainer.value.style.cursor = 'grabbing';
}

// 鼠标释放处理
function handleMouseUp() {
  isDragging.value = false;
  if (solarSystemContainer.value) {
    solarSystemContainer.value.style.cursor = 'grab';
  }
}

// 在组件销毁前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mouseleave', handleMouseUp);
});

// 修改onMounted钩子，移除initSpacecrafts
onMounted(() => {
  // 初始化天体系统
  initCelestialBodies()
  
  // 初始化时调用一次时钟更新
  updateClock()
  
  // 只有在浏览器环境下才执行DOM操作
  if (typeof window !== 'undefined') {
    // 确保组件完全渲染后再添加事件监听器
    nextTick(() => {
      // 添加鼠标事件监听器
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mouseleave', handleMouseUp)
    })
  }
})

</script>

<template>
  <div class="star-map-container" :style="{ '--nav-height': `${navHeight}px` }">
    <!-- 添加可滚动容器 -->
    <div 
      class="solar-system-container" 
      ref="solarSystemContainer"
      :class="{ 'dragging': isDragging }"
    >
      <div
        class="solar-system"
        :class="{ 'real-proportions': useRealProportions }"
        :style="{
          width: `${scaledSize.width}px`,
          height: `${scaledSize.height}px`,
          transform: `scale(${scale})`
        }"
      >
        <!-- 太阳 -->
        <div 
          class="sun" 
          ref="sun"
          :style="{
            width: `${getCelestialSize('sun')}px`,
            height: `${getCelestialSize('sun')}px`,
          }"
        ></div>
        
        <!-- 行星轨道 -->
        <div
          v-for="unit in units"
          :key="`orbit-${unit.id}`"
          class="orbit"
          :style="{ 
            '--orbit-radius': `${earthOrbitRadius.value * planetInfo[planetMapping[unit.id]].orbitRatio}px`,
            'left': `${celestialPositions.value['sun']?.x || 0}px`,
            'top': `${celestialPositions.value['sun']?.y || 0}px`
          }"
        ></div>
        
        <!-- 卫星轨道 -->
        <template v-for="unit in units" :key="`satellite-orbits-${unit.id}`">
          <div 
            v-for="satelliteId in satelliteMapping[planetMapping[unit.id]] || []" 
            :key="`orbit-${satelliteId}`"
            class="satellite-orbit"
            :style="{ 
              '--orbit-radius': `${earthOrbitRadius.value * planetInfo[satelliteId].orbitRatio * 6}px`,
              'left': `${celestialPositions.value[planetMapping[unit.id]]?.x || 0}px`,
              'top': `${celestialPositions.value[planetMapping[unit.id]]?.y || 0}px`
            }"
          ></div>
        </template>
        
        <!-- 行星 -->
        <div
          v-for="unit in units"
          :key="`planet-${unit.id}`"
          class="planet"
          :class="[getUnitStatus(unit.id), { 'active': hoveredUnit === unit }]"
          :style="{
            '--planet-color': planetInfo[planetMapping[unit.id]].color,
            '--planet-size': `${getCelestialSize(planetMapping[unit.id])}px`,
            'transform': `translate(-50%, -50%) rotate(${celestialAngles.value[planetMapping[unit.id]]?.rotation || 0}deg)`,
            'left': `${celestialPositions.value[planetMapping[unit.id]]?.x || 0}px`,
            'top': `${celestialPositions.value[planetMapping[unit.id]]?.y || 0}px`,
            'will-change': isRotating ? 'transform, left, top' : 'auto'
          }"
          @click="handlePlanetClick(unit)"
          @mouseenter="!isMobileDevice && handlePlanetHover(unit)"
          @mouseleave="!isMobileDevice && handlePlanetLeave()"
        >
          <!-- 行星图标 - 根据不同情况显示图片或文字 -->
          <div class="planet-icon" :style="{ 'font-size': `${getCelestialSize(planetMapping[unit.id]) * 0.4}px` }">
            <!-- 当isRotating时显示图片，否则显示原始图标 -->
            <img v-show="isRotating" :src="getPlanetImage(unit.id)" class="planet-image" alt="行星" />
            <template v-if="!isRotating">{{ unit.icon }}</template>
          </div>
        </div>
        
        <!-- 卫星 -->
        <template v-for="unit in units" :key="`satellites-${unit.id}`">
          <div 
            v-for="satelliteId in satelliteMapping[planetMapping[unit.id]] || []" 
            :key="`satellite-${satelliteId}`"
            class="satellite"
            :style="{
              '--satellite-color': planetInfo[satelliteId].color,
              '--satellite-size': `${getCelestialSize(satelliteId)}px`,
              'transform': `translate(-50%, -50%) rotate(${celestialAngles.value[satelliteId]?.rotation || 0}deg)`,
              'left': `${celestialPositions.value[satelliteId]?.x || 0}px`,
              'top': `${celestialPositions.value[satelliteId]?.y || 0}px`,
              'display': isRotating ? 'block' : 'none'
            }"
          >
            <div class="satellite-icon">
              {{ satelliteId === 'moon' ? '🌑' : '•' }}
            </div>
          </div>
        </template>
        
        <!-- 行星名称单独定位，但使用相同的位置计算 -->
        <div 
          v-for="unit in units" 
          :key="`name-${unit.id}`"
          v-show="showPlanetNames"
          class="planet-name"
          :style="{
            'left': `${celestialPositions.value[planetMapping[unit.id]]?.x || 0}px`,
            'top': `${(celestialPositions.value[planetMapping[unit.id]]?.y || 0) + getCelestialSize(planetMapping[unit.id]) / 2 + 20}px`,
            'transform': 'translateX(-50%)',
            'opacity': showPlanetNames ? '1' : '0',
            'will-change': isRotating ? 'left, top' : 'auto',
            'font-size': `${Math.max(1, getCelestialSize(planetMapping[unit.id]) * 0.015)}rem`,
            '--planet-color': planetInfo[planetMapping[unit.id]].color
          }"
        >
          {{ planetInfo[planetMapping[unit.id]].name }}
        </div>
        
        <!-- 卫星名称 -->
        <template v-if="showPlanetNames && isRotating">
          <div 
            v-for="unit in units" 
            :key="`satellite-names-${unit.id}`"
          >
            <div
              v-for="satelliteId in satelliteMapping[planetMapping[unit.id]] || []"
              :key="`name-${satelliteId}`"
              class="satellite-name"
              :style="{
                'left': `${celestialPositions.value[satelliteId]?.x || 0}px`,
                'top': `${(celestialPositions.value[satelliteId]?.y || 0) + getCelestialSize(satelliteId) / 2 + 12}px`,
                'transform': 'translateX(-50%)',
                '--satellite-color': planetInfo[satelliteId].color
              }"
            >
              {{ planetInfo[satelliteId].name }}
            </div>
          </div>
        </template>
        
      </div>
    </div>
    
    <!-- 控制按钮 - 添加缺失的控制按钮 -->
    <div class="control-buttons">
      <button class="control-btn rotate-btn" @click="isRotating = !isRotating">
        {{ isRotating ? '暂停' : '旋转' }}
      </button>
      
      <div v-if="isRotating" class="speed-controls">
        <button 
          class="control-btn speed-btn" 
          @click="rotationSpeedMultiplier = Math.max(minSpeedMultiplier, rotationSpeedMultiplier - speedStep)"
          :disabled="rotationSpeedMultiplier <= minSpeedMultiplier"
        >
          慢 -
        </button>
        <span class="speed-indicator">{{ rotationSpeedMultiplier.toFixed(1) }}x</span>
        <button 
          class="control-btn speed-btn" 
          @click="rotationSpeedMultiplier = Math.min(maxSpeedMultiplier, rotationSpeedMultiplier + speedStep)"
          :disabled="rotationSpeedMultiplier >= maxSpeedMultiplier"
        >
          快 +
        </button>
      </div>
      
      <button class="control-btn names-btn" @click="showPlanetNames = !showPlanetNames">
        {{ showPlanetNames ? '隐藏名称' : '显示名称' }}
      </button>
      
      <button class="control-btn proportion-btn" @click="useRealProportions = !useRealProportions">
        {{ useRealProportions ? '切换到观赏比例' : '切换到真实比例' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 星图容器 */
.star-map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--nav-height));
  background: linear-gradient(to bottom, #020111 0%, #20202c 100%);
  overflow: hidden;
}

/* 太阳系容器 */
.solar-system-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  cursor: grab;
  scroll-behavior: smooth;
  display: flex;
  justify-content: center;
  align-items: center;
}

.solar-system-container.dragging {
  cursor: grabbing;
  scroll-behavior: auto;
}

/* 太阳系 */
.solar-system {
  position: relative;
  width: 2000px;
  height: 2000px;
  transform-origin: center;
  transition: transform 0.3s ease;
}

/* 太阳 */
.sun {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #FFF176, #FFC107, #FF9800, #FF5722);
  box-shadow: 0 0 100px rgba(255, 193, 7, 0.8), 0 0 50px rgba(255, 87, 34, 0.6);
  z-index: 10;
  animation: sunAnimation 8s infinite linear;
}

/* 行星轨道 */
.orbit {
  position: absolute;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: calc(var(--orbit-radius) * 2);
  height: calc(var(--orbit-radius) * 2);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

/* 行星 */
.planet {
  position: absolute;
  width: var(--planet-size);
  height: var(--planet-size);
  border-radius: 50%;
  background-color: var(--planet-color);
  background: radial-gradient(circle at 30% 30%, var(--planet-color), #fff, var(--planet-color));
  box-shadow: 
    inset calc(var(--planet-size) * -0.1) calc(var(--planet-size) * -0.1) calc(var(--planet-size) * 0.2) rgba(0, 0, 0, 0.5),
    0 0 calc(var(--planet-size) * 0.5) rgba(var(--planet-color), 0.6);
  z-index: 5;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.planet:hover {
  transform: translate(-50%, -50%) scale(1.1) !important;
  z-index: 15;
}

.planet.active {
  transform: translate(-50%, -50%) scale(1.1) !important;
  z-index: 15;
  box-shadow: 
    inset calc(var(--planet-size) * -0.1) calc(var(--planet-size) * -0.1) calc(var(--planet-size) * 0.2) rgba(0, 0, 0, 0.5),
    0 0 calc(var(--planet-size) * 0.8) rgba(var(--planet-color), 0.8);
}

.planet-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: inherit;
}

.planet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.planet-name {
  position: absolute;
  text-align: center;
  color: var(--color-text-primary);
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  pointer-events: none;
  white-space: nowrap;
  z-index: 15;
  transition: opacity 0.3s ease;
  border: 1px solid var(--planet-color);
  box-shadow: 0 0 8px rgba(var(--planet-color), 0.5);
}

/* 状态样式 */
.planet.locked {
  filter: grayscale(80%) brightness(60%);
  cursor: not-allowed;
}

.planet.started {
  animation: pulse 3s infinite;
}

.planet.completed {
  border: 2px solid #4CAF50;
}

/* 控制按钮 */
.control-buttons {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
}

.control-btn {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.4);
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.speed-indicator {
  color: white;
  font-size: 0.9rem;
  width: 40px;
  text-align: center;
}

/* 动画 */
@keyframes pulse {
  0% { box-shadow: 0 0 10px rgba(var(--planet-color), 0.6); }
  50% { box-shadow: 0 0 20px rgba(var(--planet-color), 0.8); }
  100% { box-shadow: 0 0 10px rgba(var(--planet-color), 0.6); }
}

@keyframes sunAnimation {
  0% { box-shadow: 0 0 100px rgba(255, 193, 7, 0.7), 0 0 50px rgba(255, 87, 34, 0.5); }
  50% { box-shadow: 0 0 120px rgba(255, 193, 7, 0.9), 0 0 70px rgba(255, 87, 34, 0.7); }
  100% { box-shadow: 0 0 100px rgba(255, 193, 7, 0.7), 0 0 50px rgba(255, 87, 34, 0.5); }
}

/* 卫星轨道样式 */
.satellite-orbit {
  position: absolute;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: calc(var(--orbit-radius) * 2);
  height: calc(var(--orbit-radius) * 2);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 4;
}

/* 卫星样式 */
.satellite {
  position: absolute;
  width: var(--satellite-size);
  height: var(--satellite-size);
  border-radius: 50%;
  background-color: var(--satellite-color);
  background: radial-gradient(circle at 30% 30%, var(--satellite-color), rgba(255, 255, 255, 0.7), var(--satellite-color));
  box-shadow: 
    inset calc(var(--satellite-size) * -0.075) calc(var(--satellite-size) * -0.075) calc(var(--satellite-size) * 0.15) rgba(0, 0, 0, 0.3),
    0 0 calc(var(--satellite-size) * 0.375) rgba(var(--satellite-color), 0.7);
  transition: transform 0.2s ease;
  pointer-events: none;
  z-index: 5;
}

.satellite-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: calc(var(--satellite-size) * 0.6);
  pointer-events: none;
}

.satellite-name {
  position: absolute;
  text-align: center;
  color: var(--color-text-primary);
  font-size: 0.7rem;
  padding: 3px 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  pointer-events: none;
  white-space: nowrap;
  z-index: 16;
  transition: opacity 0.3s ease;
  border: 1px solid var(--satellite-color);
  box-shadow: 0 0 6px rgba(var(--satellite-color), 0.4);
}

/* 确保卫星在真实比例模式下也可见 */
.real-proportions .satellite {
  box-shadow: 0 0 8px 3px var(--satellite-color);
  min-width: 4px;
  min-height: 4px;
}

.real-proportions .satellite-orbit {
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
}

/* 媒体查询 - 响应式设计 */
@media (max-width: 768px) {
  .control-buttons {
    bottom: 20px;
    right: 20px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 100%;
  }
  
  .control-btn {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
  
  .planet-name, .satellite-name {
    font-size: 0.6rem;
    padding: 2px 4px;
  }
}
</style>
