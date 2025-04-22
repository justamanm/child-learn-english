import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// 导入路由组件
import Home from './views/Home.vue'
import StarMap from './views/StarMap.vue'
import WordExplorer from './views/WordExplorer.vue'
import MissionCenter from './views/MissionCenter.vue'
import AchievementCenter from './views/AchievementCenter.vue'

// 定义路由
const routes = [
  { path: '/', component: Home },
  { path: '/star-map', component: StarMap },
  { path: '/word-explorer/:unitId', component: WordExplorer },
  { path: '/mission-center/:unitId?', component: MissionCenter },
  { path: '/achievements', component: AchievementCenter }
]

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建应用并使用插件
const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')