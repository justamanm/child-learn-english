<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProgressStore } from '../stores/userProgress'

const router = useRouter()
const progressStore = useUserProgressStore()
const userName = ref(progressStore.userName || '')
const isNewUser = ref(!progressStore.userName)

function startJourney() {
  if (userName.value.trim()) {
    progressStore.setUserName(userName.value)
    progressStore.login()
    router.push('/star-map')
  }
}

function continueJourney() {
  router.push('/star-map')
}

onMounted(() => {
  // Add some animated elements
  const createStarElement = () => {
    const star = document.createElement('div')
    const size = Math.random() * 3 + 1
    star.classList.add('star')
    star.style.width = `${size}px`
    star.style.height = `${size}px`
    star.style.left = `${Math.random() * 100}%`
    star.style.top = `${Math.random() * 100}%`
    star.style.animationDelay = `${Math.random() * 5}s`
    
    if (Math.random() > 0.7) {
      star.classList.add('star-slow')
    } else if (Math.random() > 0.4) {
      star.classList.add('star-medium')
    } else {
      star.classList.add('star-fast')
    }
    
    return star
  }
  
  const homePage = document.querySelector('.home-page')
  if (homePage) {
    for (let i = 0; i < 50; i++) {
      homePage.appendChild(createStarElement())
    }
  }
})
</script>

<template>
  <div class="home-page">
    <div class="welcome-container">
      <h1 class="title">
        <span class="title-line">太空探险家</span>
        <span class="subtitle">英语冒险</span>
      </h1>
      
      <div class="intro-text">
        <p>踏上激动人心的英语词汇宇宙之旅！探索单词、完成任务，成为语言大师。</p>
      </div>
      
      <div v-if="isNewUser" class="welcome-form">
        <h2>欢迎，太空探险家！</h2>
        <p>你叫什么名字？</p>
        <input 
          type="text" 
          v-model="userName" 
          placeholder="输入你的名字"
          class="name-input"
          @keyup.enter="startJourney"
        >
        <button class="primary start-btn" @click="startJourney">
          开始冒险
          <span class="btn-stars"></span>
        </button>
      </div>
      
      <div v-else class="welcome-back">
        <h2>欢迎回来，{{ userName }}！</h2>
        <p>准备继续你的英语太空冒险吗？</p>
        <div class="stats-summary">
          <div class="stat-item">
            <div class="stat-value">{{ progressStore.wordsLearned }}</div>
            <div class="stat-label">已学单词</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ progressStore.missionsCompleted }}</div>
            <div class="stat-label">完成任务</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ progressStore.userLevel }}</div>
            <div class="stat-label">探险等级</div>
          </div>
        </div>
        <button class="primary start-btn" @click="continueJourney">
          继续旅程
          <span class="btn-stars"></span>
        </button>
      </div>
    </div>
    
    <div class="planet-decoration planet-1"></div>
    <div class="planet-decoration planet-2"></div>
    <div class="rocket-decoration">🚀</div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.welcome-container {
  background-color: rgba(22, 27, 34, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(88, 166, 255, 0.2);
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 
              0 0 15px rgba(88, 166, 255, 0.2);
}

.title {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-line {
  font-size: 2.8rem;
  background: linear-gradient(90deg, #58a6ff, #8957e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(88, 166, 255, 0.3);
}

.subtitle {
  font-size: 1.8rem;
  color: var(--color-star-teal);
  opacity: 0.9;
}

.intro-text {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.welcome-form, .welcome-back {
  background-color: rgba(13, 17, 23, 0.5);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.name-input {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1.1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text-primary);
  margin: 1rem 0;
  transition: all 0.3s ease;
}

.name-input:focus {
  outline: none;
  border-color: var(--color-star-blue);
  box-shadow: 0 0 10px rgba(88, 166, 255, 0.3);
}

.start-btn {
  margin-top: 1rem;
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
  position: relative;
  overflow: hidden;
}

.btn-stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
  background-size: 10px 10px;
  opacity: 0.1;
  animation: glitter 2s linear infinite;
}

@keyframes glitter {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 10px 10px;
  }
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-star-blue);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.planet-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 1;
}

.planet-1 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #58a6ff, #8957e5);
  top: 15%;
  right: 10%;
  box-shadow: 0 0 30px rgba(88, 166, 255, 0.3);
  animation: float 15s infinite ease-in-out;
}

.planet-2 {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #f97583, #ffea7f);
  bottom: 15%;
  left: 10%;
  box-shadow: 0 0 30px rgba(249, 117, 131, 0.3);
  animation: float 12s infinite ease-in-out reverse;
}

.rocket-decoration {
  position: absolute;
  font-size: 3rem;
  z-index: 1;
  bottom: 20%;
  right: 20%;
  animation: rocket-float 8s infinite ease-in-out;
  transform: rotate(-45deg);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes rocket-float {
  0%, 100% {
    transform: translate(0, 0) rotate(-45deg);
  }
  50% {
    transform: translate(15px, -15px) rotate(-30deg);
  }
}

@media (max-width: 768px) {
  .welcome-container {
    padding: 1.5rem;
  }
  
  .title-line {
    font-size: 2.2rem;
  }
  
  .subtitle {
    font-size: 1.4rem;
  }
  
  .planet-1, .planet-2 {
    display: none;
  }
  
  .stats-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .rocket-decoration {
    font-size: 2rem;
    bottom: 10%;
    right: 10%;
  }
}
</style>