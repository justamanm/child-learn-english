<template>
  <div ref="container" class="model-container">
    <div v-if="loading" class="model-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ loadingProgress }}%</div>
    </div>
    <div v-if="error" class="model-error">
      加载失败
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const props = defineProps({
  modelUrl: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 100
  },
  height: {
    type: Number,
    default: 100
  },
  backgroundColor: {
    type: String,
    default: 'transparent'
  },
  autoRotate: {
    type: Boolean,
    default: true
  },
  scale: {
    type: Number,
    default: 1
  },
  rotationSpeed: {
    type: Number,
    default: 0.005
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0, z: 0 })
  }
});

const container = ref(null);
let scene, camera, renderer, model, controls, mixer, clock;
let animationFrameId = null;
let isComponentMounted = false;

const loading = ref(true);
const loadingProgress = ref(0);
const error = ref(false);

// 初始化Three.js场景
const initThree = () => {
  if (!container.value || !isComponentMounted) {
    console.warn('容器元素不存在或组件未挂载，无法初始化Three.js');
    return;
  }
  
  try {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // 创建相机
    const aspectRatio = props.width / props.height;
    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    // 再次检查组件是否仍然挂载
    if (!isComponentMounted || !container.value) {
      console.warn('组件在创建场景过程中被卸载，取消初始化');
      disposeResources();
      return;
    }
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(props.width, props.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制最大像素比以优化性能
    
    // 检查浏览器兼容性
    if (renderer.capabilities.isWebGL2) {
      console.log('使用WebGL 2.0');
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      console.log('使用WebGL 1.0');
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    
    renderer.shadowMap.enabled = true;
    
    // 安全检查：确保组件仍然挂载，避免在组件卸载后进行DOM操作
    if (!isComponentMounted || !container.value) {
      console.warn('组件已卸载，取消初始化Three.js');
      disposeResources();  // 释放已创建的资源
      return;
    }
    
    // 使用更安全的DOM操作方式
    try {
      // 清空容器内容
      if (container.value) {
        container.value.innerHTML = '';
        // 将渲染器DOM元素添加到容器
        container.value.appendChild(renderer.domElement);
      }
    } catch (domError) {
      console.error('DOM操作失败:', domError);
      disposeResources();
      return;
    }
    
    // 再次检查组件是否仍然挂载
    if (!isComponentMounted) {
      console.warn('组件在DOM操作后被卸载，取消剩余初始化');
      disposeResources();
      return;
    }
    
    // 添加环境光和平行光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 初始化OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.autoRotate = props.autoRotate;
    controls.autoRotateSpeed = props.rotationSpeed;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    
    // 初始化模型时钟
    clock = new THREE.Clock();
    
    // 再次检查，确保组件仍然挂载
    if (!isComponentMounted) {
      console.warn('组件在初始化过程完成前被卸载，取消加载模型和渲染');
      disposeResources();
      return;
    }
    
    // 加载模型
    loadModel();
    
    // 开始渲染循环
    animate();
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('初始化Three.js时发生错误:', error);
    disposeResources();
  }
};

// 加载3D模型
const loadModel = () => {
  if (!isComponentMounted || !container.value) return;

  const loader = new GLTFLoader();
  
  loading.value = true;
  error.value = false;
  
  // 保存当前组件实例的引用和挂载状态标记
  const currentComponent = container.value;
  const mountedAtStart = isComponentMounted;
  
  let cancelled = false;
  
  const cancelLoad = () => {
    cancelled = true;
    // 不要尝试继续加载或处理任何资源
  };
  
  // 保存cancel函数，以便在组件卸载时调用
  window._cancelModelLoad = cancelLoad;
  
  loader.load(
    props.modelUrl,
    (gltf) => {
      // 如果加载被取消或组件已卸载，不执行任何操作
      if (cancelled || !mountedAtStart || !isComponentMounted || !container.value || container.value !== currentComponent) {
        console.warn('组件已卸载或更新，取消模型加载');
        return;
      }
      
      try {
        model = gltf.scene;
        
        // 再次检查组件状态
        if (!isComponentMounted || !scene) {
          console.warn('组件已卸载或场景不存在，无法添加模型');
          return;
        }
        
        // 设置模型的缩放
        model.scale.set(props.scale, props.scale, props.scale);
        
        // 设置模型的位置
        model.position.set(props.position.x, props.position.y, props.position.z);
        
        // 确保场景和渲染器仍然存在
        if (!scene || !renderer) {
          console.warn('场景或渲染器不存在，无法添加或渲染模型');
          return;
        }
        
        // 将模型添加到场景中
        scene.add(model);
        
        // 处理动画（如果有）
        if (gltf.animations && gltf.animations.length > 0 && isComponentMounted) {
          mixer = new THREE.AnimationMixer(model);
          const animation = gltf.animations[0];
          const action = mixer.clipAction(animation);
          action.play();
        }
        
        // 调整相机位置以适应模型大小
        if (camera && controls && isComponentMounted) {
          fitCameraToObject(model);
        }
        
        // 再次检查组件状态后再更新UI
        if (isComponentMounted) {
          // 将更新UI的操作放入微任务队列
          nextTick(() => {
            if (isComponentMounted) {
              loading.value = false;
            }
          });
        }
      } catch (e) {
        console.error('处理模型时出错:', e);
        if (isComponentMounted) {
          nextTick(() => {
            if (isComponentMounted) {
              error.value = true;
              loading.value = false;
            }
          });
        }
      }
    },
    (xhr) => {
      // 进度更新安全检查
      if (!cancelled && isComponentMounted && container.value && container.value === currentComponent) {
        loadingProgress.value = Math.floor(xhr.loaded / xhr.total * 100);
      }
    },
    (err) => {
      console.error('加载模型时出错:', err);
      // 错误处理安全检查
      if (!cancelled && isComponentMounted && container.value && container.value === currentComponent) {
        nextTick(() => {
          if (isComponentMounted) {
            loading.value = false;
            error.value = true;
          }
        });
      }
    }
  );
  
  return cancelLoad;
};

// 调整相机位置以适应模型大小
const fitCameraToObject = (object) => {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());
  
  // 调整相机位置
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const cameraZ = Math.abs(maxDim / Math.sin(fov / 2) * 1.5);
  
  camera.position.z = cameraZ;
  
  // 重新设置控制器目标为模型中心
  controls.target.copy(center);
  controls.update();
};

// 动画渲染循环
const animate = () => {
  // 如果组件已卸载，停止动画循环
  if (!isComponentMounted) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    return;
  }
  
  try {
    animationFrameId = requestAnimationFrame(animate);
    
    // 更新控制器
    if (controls) {
      controls.update();
    }
    
    // 更新动画混合器
    if (mixer && clock) {
      mixer.update(clock.getDelta());
    }
    
    // 渲染场景
    if (scene && camera && renderer) {
      renderer.render(scene, camera);
    }
  } catch (error) {
    console.warn('渲染循环中出现错误:', error);
    
    // 出错时取消动画循环，防止错误持续
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
};

// 处理窗口大小变化
const handleResize = () => {
  if (!isComponentMounted || !renderer || !camera) return;
  
  try {
    // 更新渲染器大小
    if (container.value) {
      const aspectRatio = props.width / props.height;
      camera.aspect = aspectRatio;
      camera.updateProjectionMatrix();
      renderer.setSize(props.width, props.height);
    }
  } catch (error) {
    console.warn('处理窗口大小变化时出错:', error);
  }
};

// 监听属性变化
watch(() => props.width, (newValue, oldValue) => {
  if (newValue !== oldValue && isComponentMounted) {
    handleResize();
  }
});

watch(() => props.height, (newValue, oldValue) => {
  if (newValue !== oldValue && isComponentMounted) {
    handleResize();
  }
});

watch(() => props.autoRotate, (newValue, oldValue) => {
  if (newValue !== oldValue && isComponentMounted && controls) {
    controls.autoRotate = newValue;
  }
});

watch(() => props.rotationSpeed, (newValue, oldValue) => {
  if (newValue !== oldValue && isComponentMounted && controls) {
    controls.autoRotateSpeed = newValue;
  }
});

// 当属性变更时处理
watch(
  () => [props.width, props.height, props.autoRotate, props.rotationSpeed],
  () => {
    // 确保组件已挂载且Three.js已初始化
    if (!isComponentMounted || !renderer || !camera || !controls) return;
    
    // 更新属性
    if (renderer && camera) {
      const aspectRatio = props.width / props.height;
      camera.aspect = aspectRatio;
      camera.updateProjectionMatrix();
      renderer.setSize(props.width, props.height);
    }
    
    if (controls) {
      controls.autoRotate = props.autoRotate;
      controls.autoRotateSpeed = props.rotationSpeed;
    }
  }
);

// 组件挂载时初始化Three.js
onMounted(() => {
  isComponentMounted = true;
  // 确保在下一个微任务中初始化，让Vue完成DOM更新
  nextTick(() => {
    if (container.value && isComponentMounted) {
      initThree();
    }
  });
});

// 释放资源的辅助函数
const disposeResources = () => {
  // 取消动画循环
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // 销毁渲染器
  if (renderer) {
    renderer.dispose();
    
    // 移除DOM元素（如果容器仍然存在）
    if (renderer.domElement && renderer.domElement.parentNode) {
      try {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      } catch (e) {
        console.warn('移除渲染器DOM元素时出错:', e);
      }
    }
    renderer = null;
  }
  
  // 销毁控制器
  if (controls) {
    controls.dispose();
    controls = null;
  }
  
  // 释放模型资源
  if (model && scene) {
    scene.remove(model);
    
    // 遍历模型中的所有网格，释放几何体和材质
    model.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
    model = null;
  }
  
  // 清空场景
  if (scene) {
    while(scene.children.length > 0) { 
      const object = scene.children[0];
      scene.remove(object);
    }
    scene = null;
  }
  
  // 清空混合器
  if (mixer) {
    mixer = null;
  }
  
 // 清除时钟
  if (clock) {
    clock = null;
  }
  
  // 清空相机引用
  camera = null;
};

// 在组件卸载前销毁Three.js资源
onBeforeUnmount(() => {
  console.log('ThreeDModel组件正在卸载，清理资源...');
  // 立即标记组件为未挂载状态，防止后续的异步操作尝试访问DOM
  isComponentMounted = false;
  
  // 取消任何正在进行中的模型加载
  if (window._cancelModelLoad) {
    window._cancelModelLoad();
    window._cancelModelLoad = null;
  }
  
  // 移除窗口大小变化监听器
  window.removeEventListener('resize', handleResize);
  
  // 使用辅助函数释放所有资源
  disposeResources();
});
</script>

<style scoped>
.model-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.model-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  margin-top: 10px;
  font-size: 16px;
}

.model-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
</style> 