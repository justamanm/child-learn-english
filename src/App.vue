<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserProgressStore } from './stores/userProgress'
import NavBar from './components/NavBar.vue'
import StarsBackground from './components/StarsBackground.vue'

const progressStore = useUserProgressStore()
const route = useRoute()

// 计算当前路由的类名
const pageClass = computed(() => {
  const path = route.path
  return path.startsWith('/star-map') ? 'page-star-map' : ''
})

onMounted(() => {
  progressStore.loadProgress()
})


</script>

<template>
  <div class="app-container">
    <StarsBackground />
    <NavBar />
    <main class="main-content" :class="pageClass">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-content {
  flex: 1;
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
  /* overflow-y: auto; */
  /* height: calc(100vh - 69px); */
}

/* 设置星图页面特定样式 */
.main-content.page-star-map {
  padding: 0;
  max-width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .main-content.page-star-map {
    padding: 0;
  }
}

::-webkit-scrollbar {
  /* display: none; */
  /* 通常也会配合设置尺寸为0 */
  /* width: 0;
  height: 0; */
}
</style>