<script setup lang="js">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserProgressStore } from '../stores/userProgress'

const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const progressStore = useUserProgressStore()
const isHoveringNav = ref(false)
const hoveringPath = ref(null)
const showLogoutConfirm = ref(false)

// 计算当前路由是否匹配特定路径
const isRouteActive = (path) => {
  if (path === '/star-map') {
    return route.path === '/star-map'
  } else if (path === '/mission-center') {
    // 匹配任务中心或包含特定unitId的任务中心路径
    return route.path === '/mission-center' || route.path.startsWith('/mission-center/')
  } else if (path === '/achievements') {
    return route.path === '/achievements'
  } else if (path === '/') {
    return route.path === '/'
  }
  return false
}

// 判断导航项是否应该显示激活状态
const isNavActive = (path) => {
  // 如果正在悬浮某个导航项，则只有被悬浮的导航显示激活状态
  if (isHoveringNav.value) {
    return path === hoveringPath.value && path !== '/' // 排除首页logo路径
  }
  // 否则根据当前路由判断
  return isRouteActive(path)
}

// 处理导航项的鼠标悬浮
const handleNavHover = (path) => {
  // 排除首页路径('/')，不触发hover效果
  if (path === '/') return;
  
  isHoveringNav.value = true
  hoveringPath.value = path
}

// 处理导航区域的鼠标离开
const handleNavLeave = () => {
  isHoveringNav.value = false
  hoveringPath.value = null
}

const navigate = (path) => {
  router.push(path)
  isMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 显示退出确认对话框
const confirmLogout = () => {
  showLogoutConfirm.value = true
}

// 确认退出
const handleLogout = () => {
  console.log('handleLogout');
  console.log("before-logStatus", progressStore.loginStatus);
  
  progressStore.logout()
  console.log("after-logStatus", progressStore.loginStatus);
  
  showLogoutConfirm.value = false
  router.push('/')
}

// 取消退出
const cancelLogout = () => {
  showLogoutConfirm.value = false
}

// 获取当前用户名，这里使用默认用户名
const username = computed(() => progressStore.username || '探险家')
</script>

<template>
  <header class="navbar">
    <div class="navbar-content">
      <div class="logo" 
           @click="navigate('/')"
           :class="{ 'active': route.path === '/' }">
        <span class="logo-icon">🚀</span>
        <span class="logo-text">太空探险家</span>
      </div>
      
      <div class="nav-separator"></div>
      
      <nav class="nav-links" 
           :class="{ 'active': isMenuOpen }"
           @mouseleave="handleNavLeave">
        <button class="nav-link" 
                @click="navigate('/star-map')" 
                @mouseenter="handleNavHover('/star-map')"
                :class="{ 'active': isNavActive('/star-map') }">
          <span class="nav-icon">🌌</span>
          词汇星系
        </button>
        <button class="nav-link" 
                @click="navigate('/mission-center')" 
                @mouseenter="handleNavHover('/mission-center')"
                :class="{ 'active': isNavActive('/mission-center') }">
          <span class="nav-icon">🎯</span>
          单词任务
        </button>
        <button class="nav-link" 
                @click="navigate('/achievements')" 
                @mouseenter="handleNavHover('/achievements')"
                :class="{ 'active': isNavActive('/achievements') }">
          <span class="nav-icon">🏆</span>
          成就中心
        </button>
      </nav>
      
      <div class="user-area">
        <div class="username-display">
          <span class="username-label">探险家：</span>
          <span class="username-value">{{ username }}</span>
        </div>
        
        <div class="progress-container" v-show="progressStore.loginStatus">
          <div class="progress-label">探险等级：</div>
          <div class="progress-level">{{ progressStore.userLevel }}</div>
        </div>
        
        <button class="logout-button" @click="confirmLogout" v-show="progressStore.loginStatus">
          <span class="logout-icon">🚪</span>
          <span class="logout-text">退出</span>
        </button>
      </div>
      
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-icon"></span>
      </button>
    </div>
  </header>
  
  <!-- 自定义退出确认对话框 -->
  <div class="modal-overlay" v-if="showLogoutConfirm" @click="cancelLogout">
    <div class="logout-modal" @click.stop>
      <div class="modal-header">
        <span class="modal-icon">⚠️</span>
        <h3>确认退出</h3>
      </div>
      <div class="modal-body">
        <p>确定要退出吗？这将清空您的学习记录和进度。</p>
        <p class="warning-text">所有已学习的单词和获得的成就将被清除。</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn cancel" @click="cancelLogout">取消</button>
        <button class="modal-btn confirm" @click="handleLogout">确认退出</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  background-color: rgba(13, 17, 23, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0.5rem 1rem;
}

.navbar-content {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  /* max-width: 1200px; */
  margin: 0 10%;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.logo:hover {
  transform: scale(1.05);
}

.logo.active {
  background-color: rgba(88, 166, 255, 0.15);
  box-shadow: 0 0 10px rgba(88, 166, 255, 0.1);
}

.logo-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-separator {
  width: 2px;
  height: 24px;
  background: linear-gradient(to bottom, transparent, var(--color-text-secondary), transparent);
  margin: 0 1rem;
  opacity: 0.3;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--color-text-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  border: none;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-link:hover {
  background-color: rgba(88, 166, 255, 0.15);
  color: var(--color-star-blue);
  transform: translateY(-1px);
  box-shadow: 0 0 12px rgba(88, 166, 255, 0.15);
}

.nav-link.active {
  background-color: rgba(88, 166, 255, 0.15);
  color: var(--color-star-blue);
  box-shadow: 0 0 12px rgba(88, 166, 255, 0.15);
  transform: translateY(-1px);
  position: relative;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  border-radius: 2px;
}

/* 用户区域样式 */
.user-area {
  display: flex;
  align-items: center;
  gap: 1rem;
  /* margin-left: auto; */
}

/* 用户名显示样式 */
.username-display {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem;
}

.username-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  /* 让文字垂直居中 */
  line-height: 22px
}

.username-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-star-blue);

}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.progress-level {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-star-teal);
  background: rgba(57, 211, 83, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* 退出按钮样式 */
.logout-button {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: rgba(249, 117, 131, 0.1);
  border: 1px solid rgba(249, 117, 131, 0.3);
  color: var(--color-star-orange);
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  transition: all 0.3s ease;
  margin-left: 1rem;
}

.logout-icon {
  font-size: 1.1rem;
}

.logout-button:hover {
  background-color: rgba(249, 117, 131, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 0 8px rgba(249, 117, 131, 0.2);
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  padding: 0.5rem;
  margin-left: 0.5rem;
}

.menu-icon {
  display: block;
  width: 24px;
  height: 2px;
  background-color: var(--color-text-primary);
  position: relative;
  transition: all 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: var(--color-text-primary);
  transition: all 0.3s ease;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  bottom: -8px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.logout-modal {
  background: var(--color-space-medium);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 1.5rem;
  border: 1px solid rgba(88, 166, 255, 0.2);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.modal-icon {
  font-size: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--color-text-primary);
}

.modal-body {
  margin-bottom: 1.5rem;
}

.warning-text {
  color: var(--color-star-orange);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-btn.cancel {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.modal-btn.confirm {
  background-color: rgba(249, 117, 131, 0.2);
  color: var(--color-star-orange);
  border: 1px solid rgba(249, 117, 131, 0.3);
}

.modal-btn.confirm:hover {
  background-color: rgba(249, 117, 131, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 0 12px rgba(249, 117, 131, 0.2);
}

@media (max-width: 768px) {
  .nav-separator {
    display: none;
  }

  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background-color: var(--color-space-medium);
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
  }
  
  .nav-links.active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  
  .nav-link {
    width: 100%;
    justify-content: center;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .user-area {
    display: none;
  }
  
  /* 在移动端菜单中显示用户区域 */
  .nav-links.active .user-area {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* 媒体查询调整 */
@media (max-width: 1024px) {
  .user-area {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .username-display,
  .progress-container {
    padding: 0.3rem;
  }
}
</style>