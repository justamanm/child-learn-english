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
import moonImg from '../assets/imgs/moon.webp'

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

// 控制旋转的函数
let animationFrameId = null;

// 添加每个行星原始图标的引用
const originalIcons = {};

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

// ------------------------------ 行星信息 ------------------------------
// 卫星映射，每个行星对应的卫星列表
const satelliteMapping = {
  'earth': ['moon'],
  'mars': ['phobos', 'deimos'],
  'jupiter': ['io', 'europa']
}

const sunInfo = {
    name: '太阳',
    color: '#FFC107',
    sizeRatioAlmost: 4,
    sizeRatioReal: 4,
}

// 修改行星信息部分，添加base字段和卫星信息
const planetInfo = {
  'mercury': {
    name: '水星',
    color: '#FFB74D',
    base: 'sun',  // 围绕太阳运动
    orbitRatioReal: 0.45,  // 距离太阳的相对距离（天文单位）
    sizeRatioReal: 0.38,  // 相对于地球的尺寸比例
    orbitRatioAlmost: 0.45,
    sizeRatioAlmost: 0.38,
    orbitSpeed: 0.24,
    rotationSpeed: 0.017,
    img: "https://img.timex.fun/blot-english/mercury-pamolal.png",
    img_local: mercuryImg
  },
  'venus': {
    name: '金星',
    color: '#FF8A65',
    base: 'sun',
    orbitRatioReal: 0.72,
    sizeRatioReal: 0.95,
    orbitRatioAlmost: 0.72,
    sizeRatioAlmost: 0.95,
    orbitSpeed: 0.62,
    rotationSpeed: -0.004,  // 这家伙反着转
    img: "https://img.timex.fun/blot-english/venus-pala6m3.jpg",
    img_local: venusImg
  },
  'earth': {
    name: '地球',
    color: '#4DB6AC',
    base: 'sun',
    orbitRatioReal: 1.0,  // 地球距离太阳1个天文单位，作为基准
    sizeRatioReal: 1.0,   // 地球大小作为基准
    orbitRatioAlmost: 1.0,
    sizeRatioAlmost: 1.0,
    orbitSpeed: 1,
    rotationSpeed: 1,
    img: "https://img.timex.fun/blot-english/earth-pamolpz.jpg",
    img_local: earthImg
  },
  'moon': {
    name: '月球',
    color: '#E0E0E0',
    base: 'earth',  // 围绕地球运动
    orbitRatioReal: 0.00257,  // 月球到地球的距离约为地球到太阳距离的0.00257倍
    sizeRatioReal: 0.273,  // 月球大小约为地球的0.273倍
    orbitRatioAlmost: 0.00257,
    sizeRatioAlmost: 0.273,
    orbitSpeed: 13.37,
    rotationSpeed: 13.37,  // 月球公转和自转速度相同，好神奇
    img: "https://img.timex.fun/blot-english/moon-pamol65.png",
    img_local: moonImg
  },
  'mars': {
    name: '火星',
    color: '#E57373',
    base: 'sun',
    orbitRatioReal: 1.62,
    sizeRatioReal: 0.53,
    orbitRatioAlmost: 1.62,
    sizeRatioAlmost: 0.53,
    orbitSpeed: 0.53,
    rotationSpeed: 0.97,
    img: "https://img.timex.fun/blot-english/mars-pamolg4.png",
    img_local: marsImg
  },
  // 'phobos': {
  //   name: '火卫一',
  //   color: '#BDBDBD',
  //   base: 'mars',
  //   orbitRatioReal: 0.00016,  // 火卫一距离火星非常近
  //   sizeRatioReal: 0.005,  // 火卫一非常小
  //   orbitRatioAlmost: 0.00016,
  //   sizeRatioAlmost: 0.005,
  // },
  // 'deimos': {
  //   name: '火卫二',
  //   color: '#9E9E9E',
  //   base: 'mars',
  //   orbitRatioReal: 0.00041,  // 火卫二距离火星稍远
  //   sizeRatioReal: 0.003,  // 火卫二更小
  //   orbitRatioAlmost: 0.00041,
  //   sizeRatioAlmost: 0.003,
  // },
  'jupiter': {
    name: '木星',
    color: '#F06292',
    base: 'sun',
    orbitRatioReal: 5.2,
    sizeRatioReal: 10.96,
    orbitRatioAlmost: 5.2,
    sizeRatioAlmost: 10.96,
    orbitSpeed: 0.084,
    rotationSpeed: 2.44,
    img: "https://img.timex.fun/blot-english/jupiter-pamol65.png",
    img_local: jupiterImg
  },
  // 'io': {
  //   name: '木卫一',
  //   color: '#FFEB3B',
  //   base: 'jupiter',
  //   orbitRatioReal: 0.0028,  // 相对于地日距离
  //   sizeRatioReal: 0.286,  // 相对于地球大小
  //   orbitRatioAlmost: 0.0028,
  //   sizeRatioAlmost: 0.286,
  // },
  // 'europa': {
  //   name: '木卫二',
  //   color: '#F5F5F5',
  //   base: 'jupiter',
  //   orbitRatioReal: 0.0048,  // 相对于地日距离
  //   sizeRatioReal: 0.245,  // 相对于地球大小
  //   orbitRatioAlmost: 0.0048,
  //   sizeRatioAlmost: 0.245,
  // },
  // 'saturn': {
  //   name: '土星',
  //   color: '#FF9800',
  //   base: 'sun',
  //   orbitRatioReal: 9.58,
  //   sizeRatioReal: 10.96,
  //   orbitRatioAlmost: 9.58,
  //   sizeRatioAlmost: 10.96,
  //   orbitSpeed: 0.034,
  //   rotationSpeed: 2.27,
  // },
  // 'titan': {
  //   name: '土卫六',
  //   color: '#FF9800',
  //   base: 'saturn',
  //   orbitRatioReal: 0.0001,  // 相对于地日距离
  //   sizeRatioReal: 0.286,  // 相对于地球大小
  //   orbitRatioAlmost: 0.0001,
  //   sizeRatioAlmost: 0.286,
  // },
  // 'uranus': {
  //   name: '天王星',
  //   color: '#FF9800',
  //   base: 'sun',
  //   orbitRatioReal: 19.22,
  //   sizeRatioReal: 4,
  //   orbitRatioAlmost: 19.22,
  //   sizeRatioAlmost: 4,
  //   orbitSpeed: 0.01,
  //   rotationSpeed: 1.39,
  // },
  // 'neptune': {
  //   name: '海王星',
  //   color: '#FF9800',
  //   base: 'sun',
  //   orbitRatioReal: 30.07,
  //   sizeRatioReal: 4,
  //   orbitRatioAlmost: 30.07,
  //   sizeRatioAlmost: 4,
  //   orbitSpeed: 0.01,
  //   rotationSpeed: 1.49,
  // },
}

// ------------------------------ 大小 ------------------------------
const earthBaseRadiusReal = ref(100);
const earthBaseRadiusAlmost = ref(100);
const earthBaseRadius = computed(() => {
  return useRealProportions.value ? earthBaseRadiusReal.value : earthBaseRadiusAlmost.value;
})

const earthBaseOrbitReal = ref(200);
const earthBaseOrbitAlmost = ref(200);
const earthBaseOrbit = computed(() => {
  return useRealProportions.value ? earthBaseOrbitReal.value : earthBaseOrbitAlmost.value;
})

const sunRadius = computed(() => {
  return useRealProportions.value ? 
    sunInfo.sizeRatioReal * earthBaseRadius.value : sunInfo.sizeRatioAlmost * earthBaseRadius.value;
})

// 单元ID映射到真实行星名称
const unitMapping = {
  'space-exploration': 'mercury',
  'science-lab': 'venus',
  'technology': 'earth',
  'mathematics': 'mars',
  'robotics': 'jupiter'
}
// 行星ID映射到单元ID
// const planetMapping = {}
// Object.entries(unitMapping).forEach(([unitId, planetId]) => {
//   unitMapping[planetId] = unitId;
// })

// 动态计算行星数据
const planets = computed(() => {
  const result = {};
  Object.keys(planetInfo).forEach(planetId => {
    const orbitRatio = useRealProportions.value ? planetInfo[planetId].orbitRatioReal : planetInfo[planetId].orbitRatioAlmost;
    const sizeRatio = useRealProportions.value ? planetInfo[planetId].sizeRatioReal : planetInfo[planetId].sizeRatioAlmost;
    result[planetId] = {
      name: planetInfo[planetId].name,
      color: planetInfo[planetId].color,
      orbit: earthBaseOrbit.value * orbitRatio,  // 半径
      size: earthBaseRadius.value * sizeRatio  // 直径
    };
  });
  
  return result;
});


// 计算最大轨道半径（用于设置容器大小）
const maxOrbitRadius = computed(() => {
  return Math.max(...Object.values(planets.value).map(p => p.orbit)) + 100; // 增加一些边距
});

function getOrbitBaseSize() {
  return maxOrbitRadius.value * 3 + 200;
}

// 计算缩放后的宽高
const scaledSize = computed(() => {
  const baseSize = getOrbitBaseSize();
  return {
    width: baseSize * scale.value,
    height: baseSize * scale.value
  }
});


// ------------------------------ 角度 & 速度 ------------------------------
// 行星的公转角
// 初始角度，确保它们不会重叠
const orbitAngles = ref({});

// 初始化所有天体的角度，在onMounted中调用
function initOrbitAngles() {
  const angles = {}
  
  // 先为所有行星设置随机初始角度
  Object.keys(planetInfo).forEach(planetId => {
    // 对每个天体初始化公转角度和自转角度
    angles[planetId] = {
      orbit: parseInt(Math.random() * 360),  // 公转角度，0-360度随机值
    }
  })
  
  orbitAngles.value = angles
}

// 行星的自转角
const rotationAngles = ref({
  'mercury': 0, // 水星
  'venus': 0,   // 金星
  'earth': 0,   // 地球
  'mars': 0,    // 火星
  'jupiter': 0  // 木星
});

// 恢复到0度应该自转多少角度，根据轨道角度计算，直接加90度即可
function getRotationAngle(){
  Object.keys(orbitAngles.value).forEach(planetId => {
    const orbitAngle = orbitAngles.value[planetId];
    rotationAngles.value[planetId] =  90 + orbitAngle;
    // console.log('planetId', planetId, rotationAngles.value[planetId]);
  });
}


function toggleRotation() {
  isRotating.value = !isRotating.value;
  
  if (isRotating.value) {
    // 开启旋转
    // 保存原始图标
    // units.value.forEach(unit => {
    //   originalIcons[unit.id] = unit.icon;
    // });
    
    // 替换为行星图标
    // units.value.forEach(unit => {
    //   unit.icon = planetIcons[unit.id];
    // });
    
    // 重置速度到默认值
    resetSpeed();
    
    // 重置自转角度
    getRotationAngle();

    // 开启旋转
    startRotation();
    
    
  } else {
    // 停止旋转前记录当前速度，用于平滑停止
    const currentSpeeds = {};
    const step = 1;
    Object.keys(planetInfo).forEach(planetId => {
      currentSpeeds[planetId] = step * planetInfo[planetId].orbitSpeed * rotationSpeedMultiplier.value;
    });
    
    // 平滑停止旋转，传递当前速度
    smoothStopRotation(currentSpeeds);
    
    // 恢复原始图标
    // units.value.forEach(unit => {
    //   unit.icon = originalIcons[unit.id];
    // });
    
    togglePlanetNames();
  }
}

function startRotation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  console.log('startRotation', allImagesLoaded.value);
  // 确保图片已加载
  if (!allImagesLoaded.value) {
    console.log('等待图片加载完成后开始旋转...');
    // 设置短暂延迟再次尝试启动旋转
    setTimeout(() => {
      startRotation();
    }, 500);
    return;
  }

  console.log('rotationAngles', rotationAngles.value);
  const animate = () => {
    // console.log('animate');
    // 更新行星公转角度，应用速度倍率
    Object.keys(orbitAngles.value).forEach(planetId => {
      orbitAngles.value[planetId] += rotationAngleSpeeds[planetId] * rotationSpeedMultiplier.value;
    });
    
    // 更新行星自转角度，应用速度倍率
    // Object.keys(rotationAngles.value).forEach(planetId => {
    //   // 不能使用模运算获取自转角度值，否则会失去连续性（无需担心数值过大的问题）
    //   rotationAngles.value[planetId] = (rotationAngles.value[planetId] + rotationSpeeds[planetId] * rotationSpeedMultiplier.value);
    // });
    getRotationAngle();
    
    // 减少更新卡片位置的频率，仅当有悬停行星时更新
    if (hoveredUnit.value) {
      updateCardPosition.value++;
    }
    
    animationFrameId = requestAnimationFrame(animate);
  };
  
  animate();

  togglePlanetNames();
}


// 添加平滑停止旋转的函数
function smoothStopRotation(speeds) {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  // 创建临时速度对象，使用传入的当前速度初始化
  const decayingSpeeds = { ...speeds };
  const decayFactor = 0.95; // 减小减速幅度，使减速更加平滑
  const minSpeed = 0.0005; // 设置更小的最小速度阈值

  const miniAngle = 0.01;
  let x = 2;

  const approachFactor = 0.1; // 趋近因子，值越小，趋近越慢；用于让自转角度减小的速度越来越慢
  const decayAngles = {};
  Object.keys(rotationAngles.value).forEach(planetId => {
    decayAngles[planetId] = rotationAngles.value[planetId] % 360;
  });
  // console.log('decayAngles', decayAngles);
  // console.log('rotationAngles', rotationAngles.value);
  const robot = rotationAngles.value['science-lab'];

  const animate = () => {
    // console.log('------------------------------');
    let stillMovingOrbit = false;
    let stillMovingAngle = false;

    x += 0.01;
    let decayFactorAngle = 1 - Math.exp(-x);

    // decayFactorAngle += (1 - decayFactorAngle) * approachFactor;
    // decayFactorAngle = Math.min(decayFactorAngle, 0.95);
    // console.log('decayFactorAngle', decayFactorAngle);
    
    // 更新行星公转角度，使用逐渐减小的速度
    Object.keys(orbitAngles.value).forEach(planetId => {
      // 如果速度还大于最小阈值，继续减速
      if (decayingSpeeds[planetId] > minSpeed) {
        // 减小速度
        decayingSpeeds[planetId] *= decayFactor;
        stillMovingOrbit = true;
        
        // 更新行星位置，添加模运算限制角度
        orbitAngles.value[planetId] = (orbitAngles.value[planetId] + decayingSpeeds[planetId]) % 360;
        // console.log('decayingSpeed', decayingSpeeds[planetId]);
      }
    });
    
    // console.log('decayAngles', decayAngles);
    // 更新行星自转角度，也使用逐渐减小的速度
    Object.keys(rotationAngles.value).forEach(planetId => {
      const remain = Math.abs(rotationAngles.value[planetId] % 360);
      if (remain < miniAngle) {
        if (remain !== 0) {
          // rotationAngles.value[planetId] -= remainAngle;
          // if (planetId === 'science-lab') {
          //   console.log('----rotationAngles0', remain, planetId);
          // }
        }
      } else {
        // if (planetId === 'science-lab') {
        //   let remain = rotationAngles.value[planetId] - rotationAngles.value[planetId] % 360;
        //   console.log("初始角度", parseInt(robot), "共应减去", parseInt(robot % 360), );
        // }
        stillMovingAngle = true;
        rotationAngles.value[planetId] -= decayAngles[planetId] * (1 - decayFactorAngle);
        decayAngles[planetId] *= decayFactorAngle;
        // if (planetId === 'science-lab') {
        //   console.log('减去', parseInt(decayAngles[planetId] * (1 - decayFactorAngle)),"还应减去", parseInt(rotationAngles.value[planetId] % 360), '当前角度', parseInt(rotationAngles.value[planetId]), parseInt(decayAngles[planetId]));
        // }
        // console.log('每次减去的', parseInt(100 * (1 - decayFactorAngle)), parseInt(decayAngles[planetId] * (1 - decayFactorAngle)), parseInt(decayAngles[planetId]), planetId);
      }
    });
    
    // 仅当有悬停行星时更新卡片位置
    if (hoveredUnit.value) {
      updateCardPosition.value++;
    }
    // console.log('decayingSpeed', decayingSpeeds);
    // console.log('stillMovingAngle', stillMovingAngle);
    
    if (stillMovingAngle || stillMovingOrbit) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      animationFrameId = null;
      // 停止旋转后，将所有行星的自转角度重置为0
      // Object.keys(rotationAngles.value).forEach(planetId => {
      //   rotationAngles.value[planetId] -= rotationAngles.value[planetId] % 360;
      // });
      console.log('rotationAngles', rotationAngles.value);
    }
  };
  
  animate();
  togglePlanetNames();
}


// 只是在unmounted时调用
function stopRotation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

const showPlanetNames = ref(!isRotating.value ? true : false);

// 添加一个函数来控制行星名称的显示
function togglePlanetNames() {
  showPlanetNames.value = !showPlanetNames.value;
  // console.log('togglePlanetNames', showPlanetNames.value);
}

// 更新窗口宽度函数
function updateWindowSize() {
  windowWidth.value = window.innerWidth;
}

// 检测是否为移动设备
function checkMobileDevice() {
  isMobileDevice.value = window.innerWidth <= 768 || 
                         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         (window.matchMedia && window.matchMedia('(hover: none)').matches);
  console.log('isMobileDevice:', isMobileDevice.value);
}

// 检查是否需要显示滚动提示
function checkNeedsScrolling() {
  if (!solarSystemContainer.value) return false;
  
  // 如果内容宽度或高度大于视窗，则需要滚动
  const containerWidth = solarSystemContainer.value.clientWidth;
  const containerHeight = solarSystemContainer.value.clientHeight;
  const maxPlanetRadius = Math.max(...Object.values(planets.value).map(p => p.orbit));
  
  // 如果最远的行星轨道直径大于容器尺寸，则需要滚动
  return (maxPlanetRadius * 2 > containerWidth || maxPlanetRadius * 2 > containerHeight);
}

// 移除滚动提示
function hideScrollHint() {
  showScrollHint.value = false;
}

function openUnit(unitId) {
  router.push(`/word-explorer/${unitId}`)
}

function getUnitProgress(unitId) {
  return progressStore.getUnitProgress(unitId)
}

function getUnitStatus(unitId) {
  const progress = getUnitProgress(unitId)
  if (progress >= 90) return 'mastered'
  if (progress >= 50) return 'learning'
  if (progress > 0) return 'started'
  return 'new'
}

function handlePlanetHover(unit) {
  // if (isRotating.value) {
  //   return;
  // }

  // 如果正在拖动，则不设置悬停
  if (!isDragging.value && !isWheeling.value) {
    hoveredUnit.value = unit;
  }

  // 使用nextTick确保DOM更新后再计算位置
  nextTick(() => {
    // 强制触发位置更新
    updateCardPosition.value++;
    
    // 添加调试信息
    console.log('鼠标悬停在行星上:', unit.id, unit.name);
  });

  // 如果太阳系正在转动，则10秒后关闭卡片显示
  if (isRotating.value) {
    setTimeout(() => {
      hoveredUnit.value = null;
    }, 10*1000);
  }
}

function handlePlanetLeave() {
  // if (isRotating.value) {
  //   return;
  // }

  // 在移动设备上，我们保持卡片显示，直到用户点击关闭
  if (!isMobileDevice.value) {
    // 添加短暂延迟，避免鼠标从行星移动到卡片时卡片消失
    setTimeout(() => {
      hoveredUnit.value = null;
    }, 100);
  }
}

// 移动设备上点击星球图标，切换行星的信息卡片
function togglePlanetInfo(unit) {
  console.log('togglePlanetInfo', unit.id, isMobileDevice.value);
  if (isMobileDevice.value) {
    if (hoveredUnit.value === unit) {
      hoveredUnit.value = null;
    } 
    else {
      hoveredUnit.value = unit;
      // 使用nextTick确保DOM更新后再更新位置
      nextTick(() => {
        // 强制触发位置更新
        updateCardPosition.value++;
      });
    }
  }
}

// 处理行星点击事件
function handlePlanetClick(unit) {
  if (isMobileDevice.value) {
    togglePlanetInfo(unit);
  } else {
    openUnit(unit.id);
  }
}

// 创建一个 ref 来存储卡片的位置结果，初始化为默认值
const cardPosition = ref({ x: 0, y: 0 });

// 使用 watchEffect 侦听 hoveredUnit.value 的变化
// watchEffect 的回调函数可以是 async 的
watchEffect(async () => {
  updateCardPosition.value

  const currentHoveredUnit = hoveredUnit.value; // 获取当前依赖的值，watchEffect 会自动追踪

  // 如果没有悬停的单元，将卡片位置重置为默认值并返回
  if (!currentHoveredUnit) {
    cardPosition.value = { x: 0, y: 0 };
    // console.log('没有悬停单元，重置卡片位置');
    return;
  }

  // console.log(`侦听到 hoveredUnit 变化，ID: ${currentHoveredUnit.id}`);

  try {
    // 在 watchEffect 的 async 回调中使用 await 调用异步函数
    const planetPos = await getPlanetPosition(currentHoveredUnit.id);

    // 根据行星位置和缩放计算卡片最终位置
    // 这里的 scale.value 也是 watchEffect 自动追踪的依赖
    const finalCardX = planetPos.x;
    const finalCardY = planetPos.y;
    // console.log('cardPosition:', parseInt(finalCardX), parseInt(finalCardY));

    // 更新响应式状态 cardPosition
    cardPosition.value = {
      x: finalCardX + 'px',
      y: finalCardY + 'px'
    };
    // console.log('更新 cardPosition:', cardPosition.value);

  } catch (error) {
    console.error("获取行星位置或计算卡片位置时出错:", error);
    // 错误处理：可以设置一个错误状态，或者将位置重置为默认值
    cardPosition.value = { x: 0, y: 0 }; // 出错时重置位置
  }
});


// 行星相对于视口的位置（x, y坐标）
async function getPlanetPosition(planetId) {
  if (planetId === 'sun') {
    // 获取太阳系中心位置
    const sunPosition = await getSolarPosition()
    return sunPosition
  }

  const basePlanetId = planetInfo[planetId]['base']
  const basePosition = await getPlanetPosition(basePlanetId)

  // 计算x和y的偏移（相对于父行星中心）
  const offset = getPlanetOffset(planetId)
  // console.log('行星相对父行星的偏移', basePlanetId, x_offset, y_offset)

  // 计算行星相对于视口的位置
  const x = basePosition.x + offset.x
  const y = basePosition.y + offset.y
  // console.log('x_offset', x_offset, 'y_offset', y_offset)
  // console.log('x_offset', x_offset * scale.value, 'y_offset', y_offset * scale.value)
  // console.log('行星相对于视口的偏移', x, y)
  
  return { 
    x, 
    y
  }
}


// 行星相对于太阳系中心的位置（x, y坐标）
function getPlanetOffset(planetId) {
  const angle = orbitAngles.value[planetId];
  const radius = planets.value[planetId].orbit;
  // 将角度转换为弧度，使用模运算确保在0-360度范围内
  const radians = ((angle % 360) * Math.PI) / 180;
  
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;

  x *= scale.value
  y *= scale.value
  
  return { 
    x, 
    y,
  }
}

// 太阳系中心相对于视口的位置（x, y坐标）
function getSolarPosition() {
  if (!solarSystemContainer.value) return { x: 0, y: 0 };

  // 返回一个 Promise
  return new Promise((resolve, reject) => {
    // 可以在这里先检查元素是否存在，如果不存在，立即返回一个默认值或者拒绝 Promise
    if (!solarSystemContainer.value) {
      // 如果元素不存在，立即解决 Promise，返回默认坐标
      resolve({ x: 0, y: 0 });
      // console.warn("solarSystemContainer.value 不存在");
      return; // 结束 Promise 的执行
    }

    // 使用 nextTick 确保 DOM 更新后执行
    nextTick(() => {
      // 在 nextTick 内部再次确认元素是否存在，更保险
      // if (!sun.value) {
      //     console.warn("sun.value 在 nextTick 中不存在");
      //     resolve({ x: 0, y: 0 }); // 如果 sun.value 不存在，也返回默认坐标
      //     return;
      // }

      try {
        const sunRect = sun.value.getBoundingClientRect();
        // console.log('sunRect',sunRect.left, sunRect.top);

        // 计算太阳中心相对于视口的坐标
        const sunCenterX = sunRect.left + sunRect.width / 2;
        const sunCenterY = sunRect.top + sunRect.height / 2;

        // console.log('solar', parseInt(sunCenterX), parseInt(sunCenterY));

        // 在 nextTick 内部计算完成后，通过 resolve 将结果传递出去
        resolve({ x: sunCenterX, y: sunCenterY });

      } catch (error) {
        // 如果在获取位置过程中发生错误，可以通过 reject 报告错误
        console.error("获取太阳位置时发生错误:", error);
        // reject(error); // 可以选择拒绝 Promise
        resolve({ x: 0, y: 0 }); // 或者在错误时返回默认值
      }
    });
  });
}


// 监听窗口大小变化
function handleResize() {
  checkMobileDevice();
  updateWindowSize();
  // 窗口大小变化时也要重新居中太阳
  nextTick(() => {
    centerSun();
  });
}

// 监听滚动事件，隐藏滚动提示
function handleScroll() {
  // 如果用户已经滚动，则隐藏提示
  if (solarSystemContainer.value && (solarSystemContainer.value.scrollLeft > 10 || solarSystemContainer.value.scrollTop > 10)) {
    hideScrollHint();
  }
}

// 居中太阳的函数
// function centerSun() {
//   if (!solarSystemContainer.value) return;
//   console.log('centerSun')
//   // 获取容器和太阳系的尺寸
//   const containerWidth = solarSystemContainer.value.clientWidth;
//   const containerHeight = solarSystemContainer.value.clientHeight;
//   const solarSystemContainerWidth = getOrbitBaseSize();
//   const solarSystemContainerHeight = getOrbitBaseSize();
  
//   // 计算滚动位置，使太阳居中
//   const scrollLeft = (solarSystemContainerWidth - containerWidth) / 2;
//   const scrollTop = (solarSystemContainerHeight - containerHeight) / 2;
  
//   // 平滑滚动到计算的位置
//   solarSystemContainer.value.scrollTo({
//     left: scrollLeft,
//     top: scrollTop,
//     behavior: 'instant'
//   });
// }

function centerSun() {
  if (!solarSystemContainer.value) return;
  console.log('centerSun called');

  const containerWidth = solarSystemContainer.value.clientWidth;
  const containerHeight = solarSystemContainer.value.clientHeight;

  // **修正：使用实际缩放后的内容尺寸**
  const contentWidth = scaledSize.value.width;
  const contentHeight = scaledSize.value.height;

  // 计算滚动位置，使内容中心位于容器视口中心
  const scrollLeft = (contentWidth - containerWidth) / 2;
  const scrollTop = (contentHeight - containerHeight) / 2;

  // console.log(`Container: ${containerWidth}x${containerHeight}, Content: ${contentWidth}x${contentHeight}, ScrollTo: ${scrollLeft}, ${scrollTop}`);

  // 应用滚动
  solarSystemContainer.value.scrollTo({
    left: scrollLeft,
    top: scrollTop,
    behavior: 'instant' // 'instant' 表示立即滚动，避免视觉上的跳跃
  });
   console.log('Centering complete. ScrollLeft:', solarSystemContainer.value.scrollLeft, 'ScrollTop:', solarSystemContainer.value.scrollTop);
}

// 鼠标拖拽相关函数
function handleMouseDown(e) {
  if (!solarSystemContainer.value) return;
  
  // 避免与行星点击事件冲突
  if (e.target.closest('.planet') || e.target.closest('.info-card')) {
    return;
  }
  
  // 记录这是一个空白区域的点击，可能需要关闭卡片
  isJustClick.value = true;
  
  isDragging.value = true;
  //e.pageX/Y是鼠标按下时相对于整个文档的坐标位置
  // solarSystemContainer.value.offsetLeft/offsetTop：
  //  是solar-system-container 左/上边缘相对于其父元素 star-map-container 左/上边缘的距离
  // startX/Y是相对于父容器（star-map-container）的鼠标坐标
  startX.value = e.pageX - solarSystemContainer.value.offsetLeft;  // offsetLeft是0，startX就是pageX
  startY.value = e.pageY - solarSystemContainer.value.offsetTop;  // offsetTop是0，startY就是pageY

  // scrollLeft/scrollTop
  // 当内容大小超过容器大小时，会出现滚动条，用户可以滚动查看超出视图的内容
  // solar-system-container相当于可视窗口，而solar-system是画卷， solar-system可以缩放，所以尺寸会超过窗口，所以滚动条就出现了
  //  scrollLeft/scrollTop就是滚动条滚动的距离
  //  solar-system-container是固定大小，solar-system是其内部的可滚动元素，scrollLeft/scrollTop是相对于solar-system-container滚动的距离
  scrollLeft.value = solarSystemContainer.value.scrollLeft;
  scrollTop.value = solarSystemContainer.value.scrollTop;
  
  console.log('offsetLeft',solarSystemContainer.value.offsetLeft, 'offsetTop',solarSystemContainer.value.offsetTop)
  console.log('scrollLeft',solarSystemContainer.value.scrollLeft, 'scrollTop',solarSystemContainer.value.scrollTop)

  const containerRect = solarSystemContainer.value.getBoundingClientRect();
  console.log('containerRect.width',containerRect.width, 'containerRect.height',containerRect.height)

  // left/top是sun相对于视口的坐标位置
  const sunRect = sun.value.getBoundingClientRect();
    
  // 计算太阳中心相对于视口的坐标
  // 太阳中心 = 太阳左上角 + 太阳宽度/2
  const sunCenterX = sunRect.left + sunRect.width / 2;
  const sunCenterY = sunRect.top + sunRect.height / 2;

  // console.log('sunCenterX',sunCenterX, 'sunCenterY',sunCenterY)
  // 改变鼠标样式
  document.body.style.cursor = 'grabbing';
  // 禁止选择文本
  document.body.style.userSelect = 'none';
}

function handleMouseMove(e) {
  // console.log('isDragging', isDragging.value)
  if (!isDragging.value) return;
  
  // 如果鼠标移动，则不是简单点击
  isJustClick.value = false;
  
  // e.preventDefault();
  
  // 计算鼠标移动的距离
  const x = e.pageX - solarSystemContainer.value.offsetLeft;
  const y = e.pageY - solarSystemContainer.value.offsetTop;

  // 计算移动的距离
  const moveX = x - startX.value;
  const moveY = y - startY.value;
  // console.log('scrollLeft', scrollLeft.value, 'scrollTop', scrollTop.value)
  // console.log('startX', startX.value, 'startY', startY.value)
  // console.log('x', x, 'y', y)
  // console.log('moveX', moveX, 'moveY', moveY)

  // 设置滚动位置（反向滚动以匹配拖拽方向）
  solarSystemContainer.value.scrollTo({
    left: scrollLeft.value - moveX,
    top: scrollTop.value - moveY,
    behavior: 'instant'
  });
  // console.log('left', scrollLeft.value - moveX, 'top', scrollTop.value - moveY)
  
  // 隐藏滚动提示
  if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
    hideScrollHint();
  }
  updateCardPosition.value++
  // console.log('moveX',moveX, 'moveY',moveY)
}

function handleMouseUp(e) {
  // 如果是简单点击（没有拖动）且有显示卡片，关闭卡片
  if (isJustClick.value && hoveredUnit.value) {
    // 在PC端和移动端都关闭卡片显示
    hoveredUnit.value = null;
  }
  
  isDragging.value = false;
  // 恢复鼠标样式
  document.body.style.cursor = 'auto';
  // 恢复文本选择
  // document.body.style.userSelect = '';
}

// 鼠标和触控板的判断
// 鼠标：
    //  鼠标滚轮都是垂直方向的移动，所以**deltaX始终为0**
    //  且鼠标滚轮的deltaY始终都是**固定的整数**（比如现在用的是13），这应该是和鼠标厂家的设定有关，不会是浮点数
// 触控板：
    //  双指拖动，deltaX/Y的值始终是**整数**，取决于拖动的距离大小，缓慢拖动时值都很小，只有1、2这么大
    //  缩放，deltaX始终为0，deltaY始终是浮点数，取决于缩放的距离大小，缓慢缩放时值都很小，只有0、1、2这么大
//  总结：
//    区分鼠标和触控板：
//      deltaX为0，且deltaY是一个大于一定值的整数
//    区分触控板的拖动和缩放：
//      deltaY是浮点数

function isMouseWheel(event) {
  // 请注意：这仍然是一个基于启发式的方法，尽管改进了垂直方向检测，
  // 但本质上仍不可靠，可能出现误判。最可靠的区分缩放和平移方法仍是检查修饰键。

    const absDeltaX = Math.abs(event.deltaX);
    const absDeltaY = Math.abs(event.deltaY);
    // console.log('absDeltaX', absDeltaX, 'absDeltaY', absDeltaY)
    // console.log(absDeltaX === 0, )

    // 1.触控板的缩放被判定为鼠标，没问题，因为两者的缩放逻辑是一致的
    // 2.触控板的拖动被判定为鼠标操作是会出问题的，因为就会把拖动当作缩放
    //   但问题在于触控板的拖动和鼠标的缩放的deltaX/Y在本质上是无法区分的（但问题不大）
    //   因为触控板的垂直拖动时，deltaX为0，deltaY为整数，这和鼠标滚轮的值是一致的，即垂直拖动距离很大时会变成缩放
    if (absDeltaX === 0 && absDeltaY > 10){
      // console.log('推定为鼠标滚轮');
      return true
    } else {
      // console.log('推定为触摸板拖动');
      return false
    }

    // 检查是否是双指拖动（通常不带修饰键）
    // if (!e.ctrlKey && !e.metaKey) { // metaKey 是 Mac 上的 Command 键
    //   // 根据 deltaX 和 deltaY 实现平移逻辑
    //   const panX = e.deltaX;
    //   const panY = e.deltaY;
    //   // console.log('双指拖动 - deltaX:', panX, 'deltaY:', panY);
    // }else{
    //   // console.log('鼠标缩放')
    // }
}

function isTrackpadWheel(event) {
  // 检查是否是触摸板滚轮, 只有滚动时deltaY才是浮点数
  // console.log("wheel", typeof event.deltaY !== 'number', event.deltaY)
  if (!Number.isInteger(event.deltaY)) {
    return true
  } else {
    return false
  }
}

function doWheel(e, isMouse){
  isWheeling.value = true
  showZoomIndicator.value = true;
    
  // 添加自动隐藏缩放指示器的定时器
  clearTimeout(window.zoomIndicatorTimer);
  window.zoomIndicatorTimer = setTimeout(() => {
    showZoomIndicator.value = false;
  }, 1500); // 1.5秒后隐藏
  
  // 缩放步长
  const step = isMouse ? 0.05 : 0.01  // 值越小缩放越丝滑
  const delta = -Math.sign(e.deltaY) * step;
  
  // 计算新的缩放比例，限制在最小和最大范围内
  const newScale = Math.max(minScale.value, Math.min(maxScale.value, scale.value + delta));
  
  if (newScale !== scale.value) {
    // mouseX/Y是鼠标相对于solar-system-container容器中的距离
    // clientX/Y是鼠标相对于视口的坐标位置，注意和pageX/Y(相对于整个文档)的区别
    // getBoundingClientRect().left/top是元素相对于视口的坐标位置
    const mouseX = e.clientX - solarSystemContainer.value.getBoundingClientRect().left;
    const mouseY = e.clientY - solarSystemContainer.value.getBoundingClientRect().top;
    // console.log('rect-left',solarSystemContainer.value.getBoundingClientRect().left, 'rect-top',solarSystemContainer.value.getBoundingClientRect().top)
    
    // scrollLeft表示作为容器，相对于自身内容的偏移量，即由于内容超出容器(窗口)了大小，所以容器滚动了
    // 而这个滚动是容器自身的滚动，是相对于内部内容的滚动
    // mouseX/Y是鼠标相对于容器的坐标位置，再加上scrollLeft/scrollTop，就是相对于容器内部内容元素的坐标位置
    const oldScrollLeft = solarSystemContainer.value.scrollLeft;
    const oldScrollTop = solarSystemContainer.value.scrollTop;
    
    // console.log('oldScrollLeft',oldScrollLeft, 'oldScrollTop',oldScrollTop)

    // 是此次缩放前，容器内部元素.solar-system的宽高，和下面标签中设置的宽高公式是保持一致的
    const oldScale = scale.value;
    const oldWidth = getOrbitBaseSize() * oldScale;
    const oldHeight = getOrbitBaseSize() * oldScale;

    // 鼠标位置下的元素相对于内容的比例
    // mouseX + oldScrollLeft是鼠标相对于容器内部元素.solar-system的位置
    // ratioX是鼠标在旧内容大小中占据的比例（0到1之间的比例值）
    const ratioX = (mouseX + oldScrollLeft) / oldWidth;
    const ratioY = (mouseY + oldScrollTop) / oldHeight;

    // 更新缩放比例
    scale.value = newScale;
    // console.log('scale', scale.value)

    // 计算新的内容尺寸
    const newWidth = getOrbitBaseSize() * newScale;
    const newHeight = getOrbitBaseSize() * newScale;
    
    // 应用新的滚动位置，保持鼠标下的内容点不变
    // 要保持鼠标下方的内容点不变，新的滚动位置应该是
    const newScrollLeft = ratioX * newWidth - mouseX;
    const newScrollTop = ratioY * newHeight - mouseY;
    
    // 使用setTimeout确保在计算完毕后立即应用新的滚动位置
    // 这样可以避免在某些情况下scrollLeft不变的问题
    // setTimeout(() => {
    //   solarSystemContainer.value.scrollTop = newScrollTop;
    //   solarSystemContainer.value.scrollLeft = newScrollLeft;
    //   console.log('设置后scrollLeft:', solarSystemContainer.value.scrollLeft, 'scrollTop:', solarSystemContainer.value.scrollTop);
    // }, 0);
    solarSystemContainer.value.scrollTo({
      top: newScrollTop,
      left: newScrollLeft,
      behavior: 'instant' // 'instant' 表示立即滚动，无平滑效果
                          // 如果需要平滑滚动，可以使用 'instant' 或省略此项（默认通常不是瞬间的）
    });
    // console.log('mouseX + oldScrollLeft', mouseX + oldScrollLeft)
    // console.log('oldWidth', oldWidth);
    // console.log('ratioX',ratioX);
    // console.log('ratioX * newWidth',ratioX * newWidth);
    // console.log('mouseX',mouseX);
    // console.log('newScrollLeft',newScrollLeft);
    
    
    // console.log('mouseX',mouseX, 'mouseY',mouseY)
    // console.log('ratioX',ratioX, 'ratioY',ratioY)
    // console.log('newWidth',newWidth, 'newHeight',newHeight)
    // console.log('old pos', mouseX + oldScrollLeft, mouseY + oldScrollTop)
    // console.log('new pos',ratioX * newWidth,ratioY * newHeight)
    // console.log('oldScrollLeft',oldScrollLeft, 'oldScrollTop',oldScrollTop)
    // console.log('newScrollLeft',solarSystemContainer.value.scrollLeft, 'newScrollTop',solarSystemContainer.value.scrollTop)

    // 更新卡片位置
    updateCardPosition.value++;

    // 隐藏滚动提示
    hideScrollHint();
  }
}

// 原理：
// 处理鼠标滚轮缩放，为了让缩放前后鼠标底下的元素保持一致，且鼠标的位置是不变的，所以要调节滚动条，让新的缩放后元素调整到鼠标下面
// 调节原理：
//  虽然有缩放，但元素在内容中的位置是不变的，即元素距离内容最左侧与内容总长度的比例是不变的
//  所以只要知道缩放前的比例，乘上当前缩放后的内容总长度就能获得元素的新位置
// 可视窗口与整个页面的原理
//   如果不调节，由于可视窗口相对于整个页面的位置是固定的（即水平/垂直滚动条的位置），所以缩放后（如缩小）
//   ，整个页面的宽高会从右下角往左上角缩放，就像是图片工具里，按住右下角往左上角裁切图片一样，这时候在当前视口的角度里
//   ，页面的内容就是随着缩小而向左上角移动的，无论是水平还是垂直方向
//   解决方法就是，移动可视窗口，内容往左上角移动多少，可视窗口就跟着同方向移动多少，这样鼠标指针下面的元素就保持不变了
//     所以最后的操作就是调节滚动条位置
//     这也可以解释，到最后一次或几次，元素无法保持在鼠标下面，因为这时候可视窗口已经没办法向左上角再移动了
//     ，即可能算出来还要还要调节一小段，但实际移不动了，这时元素就无法和鼠标保持同步了，现象就是元素相对鼠标往左上角移动了
function handleWheel(e) {
  // console.log('handleWheel-------------------------')
  const isMouse = isMouseWheel(e)
  // console.log('e.deltaX', e.deltaX, 'e.deltaY', e.deltaY, 'isMouse', isMouse, 'e.target', e.target)

  e.preventDefault();

  // 鼠标滚轮缩放
  if (isMouse){
    // console.log('鼠标滚轮缩放')
    doWheel(e, isMouse)
  } else {
    // console.log('推定为触摸板拖动', scrollEndTimer);
    // 改变鼠标样式
    // document.body.style.cursor = 'grabbing';
    // 禁止选择文本
    document.body.style.userSelect = 'none';

    if (isTrackpadWheel(e)){
      // 缩放
      // console.log('触控板缩放')
      doWheel(e, isMouse)
    } 
    else {
      // 拖动
      // console.log('触控板拖动')
      isDragging.value = true
      isTrackpadDragging.value = true
      solarSystemContainer.value.scrollLeft += e.deltaX;
      solarSystemContainer.value.scrollTop += e.deltaY;

      // 更新卡片位置
      updateCardPosition.value++;
    }
  }
}

function handleScrollEnd(e) {
  // console.log('handleScrollEnd')
  if (isTrackpadDragging.value) {
    isDragging.value = false
    isTrackpadDragging.value = false
  }
  isWheeling.value = false;
}


// 处理多指触控缩放
let lastTouchDistance = 0;

function handleTouchStart(e) {
  if (!solarSystemContainer.value) return;
  
  // 如果是多点触控（双指操作），记录初始距离用于缩放
  if (e.touches.length > 1) {
    e.preventDefault();
    // 计算两个触摸点之间的距离
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    lastTouchDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    return;
  }
  
  // 避免与行星点击事件冲突
  if (e.target.closest('.planet') || e.target.closest('.info-card')) {
    return;
  }
  
  // 重置触摸状态跟踪
  touchStartTime.value = Date.now();
  touchMoved.value = false;
  
  // 阻止默认事件以避免文本选择
  e.preventDefault();
  
  isDragging.value = true;
  
  // 使用第一个触摸点
  const touch = e.touches[0];
  startX.value = touch.pageX - solarSystemContainer.value.offsetLeft;
  startY.value = touch.pageY - solarSystemContainer.value.offsetTop;
  scrollLeft.value = solarSystemContainer.value.scrollLeft;
  scrollTop.value = solarSystemContainer.value.scrollTop;
}

function handleTouchMove(e) {
  // 标记已经移动
  touchMoved.value = true;
  
  // 如果是多点触控（双指操作），处理缩放
  if (e.touches.length > 1) {
    e.preventDefault();
    
    // 显示缩放指示器
    showZoomIndicator.value = true;
    
    // 添加自动隐藏缩放指示器的定时器
    clearTimeout(window.zoomIndicatorTimer);
    window.zoomIndicatorTimer = setTimeout(() => {
      showZoomIndicator.value = false;
    }, 1500); // 1.5秒后隐藏
    
    // 计算当前两点距离
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    // 计算缩放比例变化
    if (lastTouchDistance > 0) {
      // 计算缩放因子，值更小可以让缩放更平滑
      const scaleFactor = 0.01;
      const delta = (currentDistance - lastTouchDistance) * scaleFactor;
      
      // 计算新的缩放比例，限制在最小和最大范围内
      const newScale = Math.max(minScale.value, Math.min(maxScale.value, scale.value + delta));
      
      if (newScale !== scale.value) {
        // 获取触摸中心点位置
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // 获取触摸中心点相对于容器的位置
        const containerRect = solarSystemContainer.value.getBoundingClientRect();
        const touchCenterX = centerX - containerRect.left;
        const touchCenterY = centerY - containerRect.top;
        
        // 获取当前滚动位置
        const oldScrollLeft = solarSystemContainer.value.scrollLeft;
        const oldScrollTop = solarSystemContainer.value.scrollTop;
        
        // 计算触摸中心点相对于内容的位置比例
        const oldScale = scale.value;
        const oldWidth = getOrbitBaseSize() * oldScale;
        const oldHeight = getOrbitBaseSize() * oldScale;
        
        // 触摸中心位置相对于内容的比例
        const ratioX = (touchCenterX + oldScrollLeft) / oldWidth;
        const ratioY = (touchCenterY + oldScrollTop) / oldHeight;
        
        // 更新缩放比例
        scale.value = newScale;
        
        // 计算新的内容尺寸
        const newWidth = getOrbitBaseSize() * newScale;
        const newHeight = getOrbitBaseSize() * newScale;
        
        // 应用新的滚动位置，保持触摸中心点的内容不变
        const newScrollLeft = ratioX * newWidth - touchCenterX;
        const newScrollTop = ratioY * newHeight - touchCenterY;
        
        // 使用scrollTo替代单独设置scrollLeft和scrollTop
        solarSystemContainer.value.scrollTo({
          left: newScrollLeft,
          top: newScrollTop,
          behavior: 'instant'
        });
        
        // 更新卡片位置
        updateCardPosition.value++;
      }
    }
    
    // 更新距离记录
    lastTouchDistance = currentDistance;
    return;
  }
  
  if (!isDragging.value) return;
  
  // 阻止默认行为（例如页面滚动）
  e.preventDefault();
  
  // 使用第一个触摸点
  const touch = e.touches[0];
  const x = touch.pageX - solarSystemContainer.value.offsetLeft;
  const y = touch.pageY - solarSystemContainer.value.offsetTop;
  
  // 计算移动的距离
  const moveX = x - startX.value;
  const moveY = y - startY.value;
  
  // 设置滚动位置（反向滚动以匹配拖拽方向）
  solarSystemContainer.value.scrollTo({
    left: scrollLeft.value - moveX,
    top: scrollTop.value - moveY,
    behavior: 'instant'
  });
  
  // 隐藏滚动提示
  if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
    hideScrollHint();
  }
  updateCardPosition.value++;
}


function handleTouchEnd(e) {
  isDragging.value = false;
  // 重置触摸距离
  lastTouchDistance = 0;
  
  // 检查是否是点击事件（触摸持续时间短且没有明显移动）
  const touchDuration = Date.now() - touchStartTime.value;
  if (!touchMoved.value && touchDuration < 300 && hoveredUnit.value && isMobileDevice.value) {
    // 是简单点击，关闭卡片
    hoveredUnit.value = null;
  }
}




onMounted(() => {
  solarSystemContainer.value = document.querySelector('.solar-system-container')
  checkMobileDevice();
  updateWindowSize();
  window.addEventListener('resize', handleResize);
  
  // 初始化所有天体的角度
  initOrbitAngles();

  // 预加载行星图片
  preloadPlanetImages();
  
  // 添加滚动事件监听
  if (solarSystemContainer.value) {
    solarSystemContainer.value.addEventListener('scroll', handleScroll);
    
    // 添加鼠标拖拽事件
    solarSystemContainer.value.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // 鼠标离开窗口也应该停止拖拽
    window.addEventListener('mouseleave', handleMouseUp);
    
    // 添加触摸事件监听
    solarSystemContainer.value.addEventListener('touchstart', handleTouchStart, { passive: false });
    solarSystemContainer.value.addEventListener('touchmove', handleTouchMove, { passive: false });
    solarSystemContainer.value.addEventListener('touchend', handleTouchEnd);
    solarSystemContainer.value.addEventListener('touchcancel', handleTouchEnd);
    
    // 添加鼠标滚轮事件
    solarSystemContainer.value.addEventListener('wheel', handleWheel, { passive: false });
    solarSystemContainer.value.addEventListener('scrollend', handleScrollEnd, { passive: false });
  }
  
  // 检查是否需要显示滚动提示
  nextTick(() => {
    showScrollHint.value = checkNeedsScrolling();
    // 页面加载后自动居中太阳
    centerSun();
  });

  // 给整个文档添加一个键盘按下事件监听器
  document.addEventListener('keydown', function(event) {
    // 检查按下的键是否是 Escape (使用 event.key)
    if (event.key === 'Escape') {
      hoveredUnit.value = null;
    }
  });

  // 给整个文档添加一个键盘抬起事件监听器
  document.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      // console.log("Escape 键被释放了！");
      // ...
    }
  });
})

// 组件卸载前清理事件监听
onBeforeUnmount(() => {
  stopRotation();
  // 重置速度倍率
  resetSpeed();
  window.removeEventListener('resize', handleResize);
  
  if (solarSystemContainer.value) {
    solarSystemContainer.value.removeEventListener('scroll', handleScroll);
    solarSystemContainer.value.removeEventListener('mousedown', handleMouseDown);
    solarSystemContainer.value.removeEventListener('touchstart', handleTouchStart);
    solarSystemContainer.value.removeEventListener('touchmove', handleTouchMove);
    solarSystemContainer.value.removeEventListener('touchend', handleTouchEnd);
    solarSystemContainer.value.removeEventListener('touchcancel', handleTouchEnd);
    solarSystemContainer.value.removeEventListener('wheel', handleWheel);
  }
  
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mouseleave', handleMouseUp);
})


// 更新鼠标调试信息
function updateMouseDebugInfo(e) {
  // 只在拖动状态或有悬停行星时更新鼠标信息，减少不必要的更新
  if (isDragging.value || hoveredUnit.value) {
    mouseDebugInfo.value = {
      x: e.clientX,
      y: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      isDragging: isDragging.value,
      scrollLeft: solarSystemContainer.value ? solarSystemContainer.value.scrollLeft : 0,
      scrollTop: solarSystemContainer.value ? solarSystemContainer.value.scrollTop : 0
    };
  }
}

// 切换调试面板显示状态
function toggleDebugPanel() {
  showDebugPanel.value = !showDebugPanel.value;
}



// 增加转速的函数
function increaseSpeed() {
  // 增加速度并限制在最大值内
  rotationSpeedMultiplier.value = Math.min(maxSpeedMultiplier, rotationSpeedMultiplier.value + speedStep);
  console.log('当前速度倍率:', rotationSpeedMultiplier.value.toFixed(1));
}

// 减小转速的函数
function decreaseSpeed() {
  // 减小速度并限制在最小值内
  rotationSpeedMultiplier.value = Math.max(minSpeedMultiplier, rotationSpeedMultiplier.value - speedStep);
  console.log('当前速度倍率:', rotationSpeedMultiplier.value.toFixed(1));
}

// 重置转速到默认值
function resetSpeed() {
  rotationSpeedMultiplier.value = 1.0;
  console.log('速度已重置:', rotationSpeedMultiplier.value.toFixed(1));
}



// 切换真实比例的函数
function toggleRealProportions() {
  // 如果正在旋转，先停止旋转
  if (isRotating.value) {
    toggleRotation();
  }
  
  // 切换比例模式
  useRealProportions.value = !useRealProportions.value;
  console.log('使用真实比例:', useRealProportions.value);
  
  // 居中太阳系
  nextTick(() => {
    centerSun();
  });
}


// 预加载的图片缓存
const preloadedImages = ref({});

// 预加载所有行星图片的函数
function preloadPlanetImages() {
  if (!units.value || units.value.length === 0) return;
  
  // console.log('开始预加载行星图片...');
  
  const totalImages = Object.keys(planetInfo).length;
  let loadedCount = 0;
  
  // 遍历各个单元加载对应图片
  Object.entries(planetInfo).forEach(([planetId, planet]) => {
    // 创建图片对象进行预加载
    const img = new Image();
    // 仅限于浏览器开启了缓存，没有disable cache
    // 只是让图片提前下载一次，这样浏览器开启缓存后就会使用缓存，而不会重新下载，但如果浏览器关闭了缓存，则每次依然会重新下载图片
    img.src = planet.img; 

    // 监听图片加载事件
    img.onload = () => {
      // console/.log(`图片加载成功: ${unitId}`);
      loadedCount++;
      // 将加载成功的图片保存到缓存中
      preloadedImages.value[planetId] = planet.img;
      
      if (loadedCount >= totalImages) {
        allImagesLoaded.value = true;
        // console.log('所有行星图片预加载完成');
      }
    };
    img.onerror = (e) => {
      // console.error(`加载行星图片失败: ${unitId}`, e);
      if (loadedCount >= totalImages) {
        allImagesLoaded.value = true;
      }
      allImagesLoaded.value = false;
    };
     
  });
}

// 获取行星图片的函数
function getPlanetImage(planetId) {
  // console.log('getPlanetImage', unitId, preloadedImages.value[unitId]);
  return preloadedImages.value[planetId] || '';
}

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
        <div 
          class="sun" 
          ref="sun"
          :style="{
            width: `${sunRadius}px`,
            height: `${sunRadius}px`,
          }"
        ></div>
        
        <!-- 轨道 -->
        <div
          v-for="unit in units"
          :key="`orbit-${unit.id}`"
          class="orbit"
          :style="{ '--orbit-radius': `${planets[unit.planetId].orbit}px` }"
        ></div>
        
        <!-- 行星 -->
        <div
          v-for="unit in units"
          :key="`planet-${unit.id}`"
          class="planet"
          :class="[getUnitStatus(unit.id), { 'active': hoveredUnit === unit }]"
          :style="{
            '--orbit-angle': `${orbitAngles[unit.planetId]}deg`,
            '--planet-color': planets[unit.planetId].color,
            '--planet-size': `${planets[unit.planetId].size}px`,
            'transform': `translate(-50%, -50%) rotate(${rotationAngles[unit.planetId]}deg)`,
            'left': `calc(50% + ${getPlanetSolarOffset(unit.planetId).x}px)`,
            'top': `calc(50% + ${getPlanetSolarOffset(unit.planetId).y}px)`,
            'will-change': isRotating ? 'transform, left, top' : 'auto'
          }"
          @click="handlePlanetClick(unit)"
          @mouseenter="!isMobileDevice && handlePlanetHover(unit)"
          @mouseleave="!isMobileDevice && handlePlanetLeave()"
        >
          <!-- 行星图标 - 根据不同情况显示图片或文字 -->
          <div class="planet-icon" :style="{ 'font-size': `${planets[unit.planetId].size * 0.4}px` }">
            <!-- 当isRotating时显示图片，否则显示原始图标 -->
            <!-- <img :src="unit.icon" class="planet-image" alt="行星" /> -->
            <img v-show="isRotating" :src="getPlanetImage(unit.planetId)" class="planet-image" alt="行星" />
            <template v-if="!isRotating">{{ unit.icon }}</template>
          </div>
          
          <!-- 为地球添加月球 -->
          <div 
            v-if="unit.planetId === 'technology'" 
            class="moon"
            :style="{
              width: `${moonData.size}px`,
              height: `${moonData.size}px`,
              left: `${getMoonPosition().x}px`,
              top: `${getMoonPosition().y}px`,
              transform: `translate(-50%, -50%) rotate(${moonRotation}deg)`,
            }"
          >
            <div class="moon-icon">🌔</div>
          </div>
          
          <!-- 在旋转模式下，显示月球轨道 -->
          <div 
            
            class="moon-orbit"
            :style="{
              width: `${moonData.orbitRadius * 2}px`,
              height: `${moonData.orbitRadius * 2}px`
            }"
          ></div>
        </div>
        
        <!-- 行星名称单独定位，但使用相同的位置计算 -->
        <div 
          v-for="unit in units" 
          :key="`name-${unit.id}`"
          v-show="showPlanetNames"
          class="planet-name"
          :style="{
            'left': `calc(50% + ${getPlanetSolarOffset(unit.planetId).x}px)`,
            'top': `calc(50% + ${getPlanetSolarOffset(unit.planetId).y}px + ${planets[unit.planetId].size / 2 + 20}px)`,
            'transform': 'translateX(-50%)',
            'opacity': showPlanetNames ? '1' : '0',
            'will-change': isRotating ? 'left, top' : 'auto',
            'font-size': `${Math.max(1, planets[unit.planetId].size * 0.015)}rem`,
            '--planet-color': planets[unit.planetId].color
          }"
        >
          {{ planets[unit.planetId].name }}
        </div>
      </div>
    </div>
    
    
    <!-- 信息卡片容器 -->
    <div 
      v-if="solarSystemContainer"
      class="info-cards-container"
      :style="{
      }"
    >
      <div 
        v-for="unit in units" 
        :key="`info-${unit.id}`"
        v-show="hoveredUnit === unit"
        class="planet-info"
        :class="{ 
          'mobile-card': cardPosition.isMobile
        }"
        :style="{
          top: cardPosition.y,
          left: cardPosition.x,
          '--scale': scale
        }"
      >
        <div class="info-card">
          <h3>{{ unit.name }}</h3>
          <p>{{ unit.description }}</p>
          <div class="info-stats">
            <div class="info-stat">
              <span class="stat-label">单词数：</span>
              <span class="stat-value">{{ unit.wordCount }}</span>
            </div>
            <div class="info-stat">
              <span class="stat-label">难度：</span>
              <span class="stat-value">{{ '⭐'.repeat(unit.difficulty) }}</span>
            </div>
            <div class="info-stat">
              <span class="stat-label">进度：</span>
              <span class="stat-value">{{ getUnitProgress(unit.id) }}%</span>
            </div>
          </div>
          <div class="info-hint">
            {{ isMobileDevice ? '点击行星关闭' : '点击开始学习' }}
          </div>
          <div v-if="isMobileDevice" class="card-actions">
            <button @click="openUnit(unit.id)" class="start-btn">开始学习</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚动提示 -->
    <div v-if="showScrollHint" class="scroll-hint" @click="hideScrollHint">
      <div class="scroll-hint-text">
        <span>滚动查看更多行星</span>
        <div class="scroll-arrows">
          <span class="arrow">⟷</span>
          <span class="arrow">⟷</span>
        </div>
        <div class="scroll-tip">
          <span>鼠标拖动可平移视图</span>
          <span>鼠标滚轮可缩放视图</span>
          <span>点击行星可隐藏名称</span>
        </div>
      </div>
    </div>    

    <div class="debug-info-container">
      <!-- 调试信息面板和按钮 - 移到最外层确保始终固定 -->
      <div v-if="showDebugPanel" class="debug-info">
          <div>设备类型: {{ isMobileDevice ? '移动设备' : '桌面设备' }}</div>
          <div>窗口宽度: {{ windowWidth }}px</div>
          <div>缩放比例: {{ Math.round(scale * 100) }}%</div>
          <div>当前悬停行星: {{ hoveredUnit?.name || '无' }}</div>
          <div>鼠标位置: X={{ mouseDebugInfo.x }} Y={{ mouseDebugInfo.y }}</div>
          <div>页面坐标: pageX={{ mouseDebugInfo.pageX }} pageY={{ mouseDebugInfo.pageY }}</div>
          <div>拖动状态: {{ mouseDebugInfo.isDragging ? '拖动中' : '未拖动' }}</div>
          <div>滚动位置: 左={{ mouseDebugInfo.scrollLeft.toFixed(0) }} 上={{ mouseDebugInfo.scrollTop.toFixed(0) }}</div>
          <div>拖动起点: X={{ startX }} Y={{ startY }}</div>
        </div>

        <button @click="toggleDebugPanel" class="debug-toggle-btn" :class="{ 'shift-right': showDebugPanel }" title="切换调试面板">
          🐞
        </button>
    </div>

    <!-- 缩放指示器 - 移到容器外部确保固定位置 -->
    <div class="zoom-indicator" :class="{ 'visible': showZoomIndicator }">
      <span>{{ Math.round(scale * 100) }}%</span>
    </div>

    <div class="control-buttons">
      <!-- 速度控制按钮，只在旋转时显示 -->
      <div v-if="isRotating" class="speed-control-buttons">
        <button @click="decreaseSpeed" class="speed-control-btn" :disabled="rotationSpeedMultiplier <= minSpeedMultiplier" title="减小速度">
          <span class="speed-icon">−</span>
        </button>
        <div class="speed-display">{{ rotationSpeedMultiplier.toFixed(1) }}×</div>
        <button @click="increaseSpeed" class="speed-control-btn" :disabled="rotationSpeedMultiplier >= maxSpeedMultiplier" title="增加速度">
          <span class="speed-icon">+</span>
        </button>
        <!-- 重置速度按钮，只在速度不为1.0时显示 -->
        <button @click="resetSpeed" class="speed-reset-btn" title="重置速度">
          <span class="speed-icon">↺</span>
        </button>
      </div>

      <!-- 添加星系旋转控制按钮 -->
      <button @click="toggleRotation" class="rotation-toggle-btn">
        <span class="rotation-icon">{{ isRotating ? '⏹ ' : '⟳ ' }}</span>
        <span class="rotation-text">{{ isRotating ? '停止转动' : '启动太阳系' }}</span>
      </button>

      <!-- 真实比例切换按钮 -->
      <button @click="toggleRealProportions" class="proportion-toggle-btn" title="切换太阳系比例">
        <span class="proportion-text">{{ useRealProportions ? '返回观赏模式' : '真实比例' }}</span>
      </button>

      <!-- 添加一个按钮来重新显示行星名称 -->
      <button 
        @click="togglePlanetNames"
        class="show-names-btn"
      >
        {{ showPlanetNames ? '隐藏行星名称' : '显示行星名称' }}
      </button>
    </div>

    <!-- 调试信息 -->
    <div v-if="showDebugPanel" class="debug-info-container">
      <div class="debug-info">
        <div>Scale: {{ scale.toFixed(2) }}</div>
        <div>Earth Orbit: {{ orbitAngles['technology'].toFixed(2) }}°</div>
        <div>Earth Rotation: {{ rotationAngles['technology'].toFixed(2) }}°</div>
        <div>Rotating: {{ isRotating ? 'Yes' : 'No' }}</div>
        <div>Speed: {{ rotationSpeedMultiplier.toFixed(1) }}×</div>
        <div>Real Proportions: {{ useRealProportions ? 'Yes' : 'No' }}</div>
        <div>Mouse X: {{ mouseDebugInfo.x }}</div>
        <div>Mouse Y: {{ mouseDebugInfo.y }}</div>
        <!-- 添加触摸手势调试信息 -->
        <div>deltaX: {{ debugTouchInfo.cosValue.toFixed(2) }}</div>
        <div>deltaY: {{ debugTouchInfo.distChange.toFixed(2) }}</div>
        <div>Ctrl Key: {{ debugTouchInfo.isPinch ? 'Yes' : 'No' }}</div>
        <div>Is Trackpad: {{ isTrackpadGesture ? 'Yes' : 'No' }}</div>
        <div>Trackpad Drag: {{ trackpadDragging ? 'Yes' : 'No' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.star-map-container {
  /* min-height: calc(100vh - var(--nav-height)); */
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 新增滚动容器 */
.solar-system-container {
  width: 100%;
  /* 要减去导航栏的高度，否则100vh会使得底下还有距离，而默认只开启solar容器的滚动条，不开启整个页面的滚动条的话，导致下面的滚动条看不见 */
  height: calc(100vh - var(--nav-height));
  overflow: auto;
  position: relative;
  /* 设置滚动条宽度为0也可以实现隐藏滚动条 */
  /* scrollbar-width: none;  */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: instant;
  will-change: scroll-position;
  transform: translateZ(0);
  backface-visibility: hidden;
  cursor: grab; /* 添加抓取光标，表示可拖动 */
  /* 禁用默认的触摸缩放行为 */
  touch-action: pan-x pan-y;
  -ms-touch-action: pan-x pan-y;
}

/* 拖动中的状态 */
.solar-system-container.dragging {
  cursor: grabbing;
  scroll-behavior: auto; /* 拖动时禁用平滑滚动，使响应更直接 */
  user-select: none;
}

.solar-system-container.dragging .solar-system {
  transition: transform 0.05s linear;
}

.solar-system-container:hover::after {
  background-color: rgba(255, 255, 255, 0.03);
}

.solar-system-container.dragging::after {
  background-color: rgba(255, 255, 255, 0.05);
  width: 120px;
  height: 120px;
}

/* ::-webkit-scrollbar {
  display: none;
} */

/* 自定义滚动条样式 */
.solar-system-container::-webkit-scrollbar {
  /* none不显示滚动条，block显示滚动条 */
  /* display: block; */

  /* 设置滚动条宽度为0也可以实现隐藏滚动条，即是display是block */
  width: 0px;
  height: 0px;
}

.solar-system-container::-webkit-scrollbar-track {
  background: transparent;
}

.solar-system-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.solar-system-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.solar-system {
  position: relative;
  margin: 0 auto;
  /* 动态设置宽度和高度，但不使用min-width和min-height */
  display: flex;
  align-items: center;
  justify-content: center;
  /* 添加硬件加速，但移除transform属性，因为我们在内联样式中设置了它 */
  will-change: transform;
  backface-visibility: hidden;

  transform-origin: center center;
}

/* 为空白区域添加交互提示 */
.solar-system::after {
  content: '';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0);
  z-index: 1;
  pointer-events: none;
  transition: background-color 0.3s;
}

/* 滚动提示样式 */
.scroll-hint {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  z-index: 1000;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.5s, pulse 2s infinite;
  user-select: none;
}

.scroll-hint-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
}

.scroll-arrows {
  margin-top: 5px;
}

.arrow {
  display: inline-block;
  animation: arrowPulse 1.5s infinite;
  margin: 0 3px;
}

.arrow:nth-child(2) {
  animation-delay: 0.5s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes arrowPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.sun {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #FFEB3B, #FFC107, #FF5722);
  box-shadow: 0 0 60px rgba(255, 160, 0, 0.4), 0 0 20px rgba(255, 70, 0, 0.6) inset;
  box-shadow: 
    0 0 80px rgba(255, 160, 0, 0.6),
    0 0 120px rgba(255, 70, 0, 0.3);
  z-index: 2; /* 确保太阳显示在前面 */
  animation: sunAnimation 6s infinite alternate ease-in-out;
}

@keyframes sunAnimation {
  /* 动画开始状态 (0%) 和结束状态 (100%) - 正常大小 */
  0%, 100% {
    /* 保留平移，并设置缩放比例为 1 (正常大小) */
    transform: translate(-50%, -50%) scale(1);
  }
  
  /* 动画中间状态 (50%) - 缩小后的状态 */
  50% {
    /* 保留平移，并设置缩放比例为你想要的缩小比例 */
    transform: translate(-50%, -50%) scale(0.95); /* 例如缩小到原尺寸的 90% */
    /* 也可以稍微改变颜色或阴影来增强脉冲效果 */
    /* background: radial-gradient(circle at 30% 30%, #FFEE58, #FFC107, #FF5722); */
    /* box-shadow: 0 0 50px rgba(255, 140, 0, 0.5), 0 0 15px rgba(255, 60, 0, 0.7) inset; */
  }
}

@keyframes sunPulse {
  0% {
    box-shadow: 
      0 0 80px rgba(255, 160, 0, 0.6),
      0 0 120px rgba(255, 70, 0, 0.3),
      0 0 30px rgba(255, 255, 0, 0.8) inset;
  }
  100% {
    box-shadow: 
      0 0 100px rgba(255, 160, 0, 0.8),
      0 0 150px rgba(255, 70, 0, 0.5),
      0 0 40px rgba(255, 255, 0, 1) inset;
  }
}

/* 真实比例下的太阳效果增强 */
.real-proportions .sun {
  /* 添加更强烈的光芒效果 */
  background: radial-gradient(circle at 30% 30%, #ffea9d, #ffc43b, #ff8000, #f47236);
  box-shadow: 
    0 0 80px rgba(255, 160, 0, 0.6),
    0 0 120px rgba(255, 70, 0, 0.3),
    0 0 30px rgba(255, 230, 0, 0.8) inset;
  /* 添加光晕动画 */
  /* animation: sunPulse 5s infinite alternate ease-in-out; */
  /* 确保太阳在正确位置 */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  overflow: visible;
  animation: sunAnimation 6s infinite alternate ease-in-out;
}

/* 添加太阳光芒 */
.real-proportions .sun::before,
.real-proportions .sun::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 50%;
  z-index: -1;
  transform: translate(-50%, -50%);
}

.real-proportions .sun::before {
  box-shadow: 
    0 0 30px 10px rgba(255, 160, 0, 0.8),
    0 0 50px 20px rgba(255, 70, 0, 0.5);
  left: 50%;
  top: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  /* animation: sunCorona 20s infinite ease-in-out; */
}

.real-proportions .sun::after {
  box-shadow: 0 0 30px 20px rgba(255, 221, 0, 0.8);
  /* animation: sunRays 30s infinite alternate ease-in-out; */
}

@keyframes sunCorona {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.9;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 0.7;
  }
}

@keyframes sunRays {
  0% {
    transform: scale(1.1) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2) rotate(-180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1) rotate(-360deg);
    opacity: 0.6;
  }
}

.orbit {
  position: absolute;
  width: calc(var(--orbit-radius) * 2);
  height: calc(var(--orbit-radius) * 2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);

  /* 这里的动画一定要去掉，否则很卡 */
  /* animation: orbitPulse 8s infinite linear; */
  /* animation: glow 4s ease-in-out infinite; */
}

/* 轨道也增强一些，在其更明显 */
@keyframes orbitPulse {
  0% {
    border-color: rgba(255, 255, 255, 0.1);
  }
  50% {
    border-color: rgba(255, 255, 255, 0.3);
  }
  100% {
    border-color: rgba(255, 255, 255, 0.1);
  }
}





.planet {
  /* --planet-size: 80px; */
  width: var(--planet-size);
  height: var(--planet-size);
  border-radius: 50%;
  background: var(--planet-color);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset calc(var(--planet-size) * -0.075) calc(var(--planet-size) * -0.075) calc(var(--planet-size) * 0.15) rgba(0, 0, 0, 0.3),
    0 0 calc(var(--planet-size) * 0.375) rgba(0, 0, 0, 0.4);
  position: absolute;
  transform: translate(-50%, -50%); /* 确保行星中心点位于计算的坐标上，自转角度在内联样式中设置 */
  z-index: 15; /* 确保行星显示在轨道上方 */
  -webkit-tap-highlight-color: transparent; /* 移除移动设备点击时的高亮 */
}

/* 在真实比例模式下，增加行星的最小视觉尺寸 */
.real-proportions .planet {
  box-shadow: 0 0 20px 8px var(--planet-color);
  animation: planetGlow 4s infinite alternate ease-in-out;
}

/* 添加真实比例下的行星高亮效果 */
.planet::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--planet-size) * 1.5);
  height: calc(var(--planet-size) * 1.5);
  min-width: 20px; /* 确保最小尺寸 */
  min-height: 20px;
  background: transparent;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid var(--planet-color);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

/* 在真实比例模式下，为行星添加高亮轮廓效果 */
.real-proportions .planet::after {
  opacity: 0.7;
  box-shadow: 0 0 15px 5px var(--planet-color);
  animation: planetPulse 3s infinite ease-in-out;
}


.planet:hover, .planet.active {
  /* transform: translate(-50%, -50%) scale(1.15) rotate(var(--rotation-angle, 0deg));  */
  box-shadow: 
    inset calc(var(--planet-size) * -0.075) calc(var(--planet-size) * -0.075) calc(var(--planet-size) * 0.15) rgba(0, 0, 0, 0.3),
    0 0 calc(var(--planet-size) * 0.5) var(--planet-color);
  z-index: 20; /* 确保激活和悬停状态的行星也在导航栏上方 */
  transition: all 0.3s ease, transform 0.3s ease;

}


/* 行星图片样式 */
.planet-image {
  width: var(--planet-size);
  height: var(--planet-size);
  border-radius: 50%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
  box-shadow: 0 0 10px var(--planet-color);
  transition: all 0.3s ease;
}

/* 旋转模式下的行星图片样式 */
.planet:hover .planet-image, 
.planet.active .planet-image {
  box-shadow: 0 0 20px var(--planet-color);
  transform: scale(1.05);
}



/* 在真实比例模式下，调整图标大小确保可见 */
.real-proportions .planet-icon {
  font-size: max(calc(var(--planet-size) * 0.4), 14px) !important;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
}

/* 行星光晕脉动动画 */
@keyframes planetPulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.7;
  }
}

/* 行星自身光晕动画 */
@keyframes planetGlow {
  0% { 
    box-shadow: 0 0 15px 5px var(--planet-color);
  }
  100% { 
    box-shadow: 0 0 25px 10px var(--planet-color);
  }
}

.planet-icon {
  text-align: center;
  user-select: none;
  pointer-events: none; /* 阻止图标接收鼠标事件 */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}


.planet.new {
  filter: grayscale(0.8) brightness(0.7);
}



.planet-name {
  position: absolute;
  /* width: 100px; */
  text-align: center;
  color: var(--color-text-primary);
  font-size: 1.1rem;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  pointer-events: none;
  white-space: nowrap;
  z-index: 16; /* 确保名称在行星之上 */
  transition: opacity 0.3s ease; /* 简化过渡效果，仅保留不透明度的过渡 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 真实比例下的行星名称样式增强 */
.real-proportions .planet-name {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--planet-color);
  box-shadow: 0 0 10px var(--planet-color);
  text-shadow: 0 0 5px var(--planet-color);
  padding: 8px 15px;
  font-weight: bold;
  letter-spacing: 1px;
  min-width: 120px;
  /* 确保名称与行星图标相连接的指示线 */
  /* position: relative; */
}

/* 添加一条连接线连接行星和名称 */
.real-proportions .planet-name::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  width: 2px;
  height: 10px;
  background-color: var(--planet-color);
  transform: translateX(-50%);
  box-shadow: 0 0 5px var(--planet-color);
}



.info-cards-container {
  position: fixed;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  top: 0;
  left: 0;
  z-index: 9999;
}

.planet-info {
  position: absolute;
  z-index: 9999;
  width: 280px;
  max-width: calc(30vw - 60px);
  pointer-events: auto; /* 确保卡片可以接收鼠标事件 */
  /* 直接使用计算后的行星位置 */
  /* top: v-bind(cardPosition.top);
  left: v-bind(cardPosition.left); */
  
  transform: translate(calc(100px * var(--scale)), -50%);
}

/* 移动设备上的卡片样式 */
/* .planet-info.mobile-card {
  position: fixed;
  right: 10px;
  top: 100px;
  width: 180px;
  max-width: 180px;
} */

.info-card {
  background: rgba(22, 27, 34, 0.95);
  border-radius: 12px;
  padding: 0.8rem;
  border: 1px solid rgba(88, 166, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  font-size: 0.9rem;
  transition: transform 0.2s ease;
  animation: fadeIn 0.3s ease-in-out;
  position: relative;
  z-index: 200;
}

.card-actions {
  margin-top: 10px;
  text-align: center;
}

.start-btn {
  background: var(--color-star-blue, #4DB6AC);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.start-btn:hover {
  background: rgba(77, 182, 172, 0.8);
}

.debug-info-container {
  position: fixed;
  top: 80vh;
  left: 20px;
  z-index: 10000;
}

/* 调试信息 */
.debug-info {
  /* position: fixed; */
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 10000;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
  color: var(--color-star-blue);
}

.info-card p {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.8rem;
  line-height: 1.2;
}

.info-stats {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

.info-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.stat-label {
  color: var(--color-text-secondary);
}

.info-hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  padding-top: 0.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}

@media (max-width: 1300px) {
  .planet-info {
    width: 220px;
    max-width: calc(40vw - 60px);
    
  }
  
  .info-card {
    padding: 0.6rem;
  }
  
  .info-card h3 {
    font-size: 1rem;
  }
  
  .info-card p {
    font-size: 0.8rem;
  }
}

@media (max-width: 1200px) {

}

@media (max-width: 768px) {
  .solar-system-container {
    height: 100vh; /* 修改为100vh以确保全屏显示 */
  }
  
  .planet {
    /* 移动设备上所有行星尺寸缩小为桌面版的70% */
    --planet-size: calc(var(--planet-size) * 0.7);
  }
  
  .planet-icon {
    /* 图标字体大小跟随行星大小变化，保持比例 */
    font-size: calc(var(--planet-size) * 0.28);
  }
  
  .planet-name {
    width: 80px;
    padding: 4px 8px;
  }
  
  /* 在移动设备上调整信息卡片 */
  .planet-info {
    width: 180px;
    max-width: 180px;
    margin-top: 0;
    z-index: 9999;
    transform: translate(calc(60px * var(--scale)), -50%);
  }
  
  .info-card h3 {
    font-size: 0.9rem;
  }
  
  .info-card p {
    font-size: 0.75rem;
    margin-bottom: 0.6rem;
  }
  
  .info-stats {
    gap: 0.3rem;
    margin-bottom: 0.6rem;
  }
  
  .info-stat {
    font-size: 0.75rem;
  }
  
  .info-hint {
    font-size: 0.7rem;
  }
  
  .scroll-hint {
    bottom: 10px;
    right: 10px;
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .zoom-indicator {
    top: 15px;
    left: 15px;
    font-size: 12px;
    padding: 4px 8px;
  }

  .rotation-toggle-btn {
    padding: 8px 12px;
    font-size: 12px;
    left: 15px;
    bottom: 15px;
  }
  
  .rotation-icon {
    font-size: 16px;
  }

  .show-names-btn {
    padding: 8px 12px;
    font-size: 12px;
    right: 15px;
    bottom: 15px;
  }
}

/* 在移动设备上隐藏滚动条 */
@media (max-width: 768px), (hover: none) {
  .solar-system-container {
    scrollbar-width: none; /* Firefox */
  }
  
  .solar-system-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
}


/* 缩放指示器 */
.zoom-indicator {
  position: fixed;
  top: 80px; /* 调整到左上角位置 */
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s, transform 0.2s;
  z-index: 1001; /* 确保在滚动提示上面 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(10px);
}

.zoom-indicator.visible {
  opacity: 0.9;
  transform: translateY(0);
}

/* 强化滚动提示 */
.scroll-tip {
  margin-top: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 调试按钮样式 */
.debug-toggle-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.debug-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.debug-toggle-btn.shift-right {
  right: 120px;
}

.control-buttons {
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  width: auto;
  min-width: 220px; /* 设置最小宽度确保按钮不会太窄 */
}

/* 确保所有按钮宽度一致 */
.control-buttons > button,
.speed-control-buttons {
  width: 100%;
}

.proportion-toggle-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.proportion-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
}

.proportion-toggle-btn:active {
  transform: translateY(0);
}

.proportion-icon {
  font-size: 18px;
}

.rotation-text {
  display: inline-block;
}


/* 显示行星名称按钮样式 */
.show-names-btn {
  /* position: fixed; */
  /* right: 20px; */
  /* bottom: 20px; */
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  z-index: 1000;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.show-names-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
}

.proportion-text {
  flex-grow: 1;
  text-align: center;
}

.speed-control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.speed-control-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.speed-control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.speed-control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.speed-display {
  font-size: 14px;
  color: white;
  min-width: 40px;
  text-align: center;
}

.speed-reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.speed-reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 星系旋转控制按钮样式 */
.rotation-toggle-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  gap: 8px;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.rotation-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
}

.rotation-toggle-btn:active {
  transform: translateY(0);
}

.rotation-icon {
  font-size: 18px;
}

.rotation-text {
  flex-grow: 1;
  text-align: center;
}



/* 显示行星名称按钮样式 */
.show-names-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.show-names-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
}

.show-names-btn:active {
  transform: translateY(0);
}

/* 在样式部分添加月球相关样式 */

/* 月球轨道样式 */
.moon-orbit {
  position: absolute;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 月球样式 */
.moon {
  position: absolute;
  border-radius: 50%;
  background-color: #ccc;
  background: radial-gradient(circle at 30% 30%, #f5f5f5, #d7d7d7, #a0a0a0);
  box-shadow: 
    inset -3px -3px 8px rgba(0, 0, 0, 0.4),
    0 0 6px rgba(255, 255, 255, 0.7);
  transition: transform 0.2s ease;
  pointer-events: none;
  z-index: 5;
}

.moon-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 10px;
  pointer-events: none;
}

/* 确保月球在真实比例模式下也可见 */
.real-proportions .moon {
  box-shadow: 0 0 8px 3px rgba(255, 255, 255, 0.8);
  min-width: 4px;
  min-height: 4px;
}

.real-proportions .moon-orbit {
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
}
</style>
