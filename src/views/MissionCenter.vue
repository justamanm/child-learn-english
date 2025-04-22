<script setup lang="js">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVocabularyStore } from '../stores/vocabulary'
import { useUserProgressStore } from '../stores/userProgress'
import MissionCard from '../components/MissionCard.vue'
import GameContainer from '../components/GameContainer.vue'

const route = useRoute()
const router = useRouter()
const vocabStore = useVocabularyStore()
const progressStore = useUserProgressStore()

const unitId = computed(() => route.params.unitId || '')
const unit = computed(() => unitId.value ? vocabStore.getUnitById(unitId.value) : null)

const activeGame = ref('')
const gameWords = ref([])
const gameOptions = ref({})
const gameScore = ref(0)
const gameMaxScore = ref(0)

const games = [
  {
    id: 'word-match',
    name: '单词配对',
    description: '将英语单词与其含义匹配',
    icon: '🔤',
    difficulty: 1
  },
  {
    id: 'spell-check',
    name: '拼写检查',
    description: '测试你的拼写技能，输入正确的单词',
    icon: '✏️',
    difficulty: 2
  },
  {
    id: 'sentence-builder',
    name: '造句练习',
    description: '使用你学过的单词创建句子',
    icon: '📝',
    difficulty: 3
  },
  {
    id: 'word-rocket',
    name: '单词火箭',
    description: '快速反应！在时间结束前选择正确的单词',
    icon: '🚀',
    difficulty: 2
  }
]

function showNotification(message) {
  const notification = document.createElement('div')
  notification.className = 'game-notification'
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">ℹ️</span>
      <span class="notification-message">${message}</span>
    </div>
  `
  document.body.appendChild(notification)

  // 添加显示类以触发动画
  setTimeout(() => notification.classList.add('show'), 100)

  // 3秒后移除通知
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

function startGame(gameId) {
  if (unitId.value) {
    gameWords.value = vocabStore.getWordsByUnitId(unitId.value)
  } else {
    gameWords.value = progressStore.getReviewWords().map(wordId => {
      return vocabStore.getWordById(wordId)
    }).filter(Boolean)
  }
  
  if (gameWords.value.length === 0) {
    showNotification('没有可用的单词。请先学习一些单词！')
    return
  }
  
  if (gameWords.value.length > 10) {
    gameWords.value = gameWords.value
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
  }
  
  gameOptions.value = {
    wordCount: gameWords.value.length,
    difficulty: unit.value?.difficulty || 2,
    timeLimit: 120
  }
  
  activeGame.value = gameId
  gameScore.value = 0
  gameMaxScore.value = gameWords.value.length
}

function endGame(finalScore) {
  gameScore.value = finalScore
  
  // 更新进度并给予奖励
  if (unitId.value) {
    const scorePercent = Math.round((finalScore / gameMaxScore.value) * 100)
    progressStore.updateUnitProgress(unitId.value, scorePercent)
    
    // 为玩游戏添加经验值
    progressStore.addExperience(finalScore * 10)
  } else {
    // 为练习复习单词添加经验值
    progressStore.addExperience(finalScore * 15)
  }
  
  // 显示成功消息并允许重新开始
  setTimeout(() => {
    activeGame.value = 'completed'
  }, 1000)
}

function restartGame() {
  activeGame.value = ''
}

onMounted(() => {
  // 初始化任务中心的动画效果
  const container = document.querySelector('.mission-center')
  if (container) {
    const createStar = () => {
      const star = document.createElement('div')
      const size = Math.random() * 2 + 1
      
      star.classList.add('star')
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      
      if (Math.random() > 0.7) {
        star.classList.add('star-slow')
      } else if (Math.random() > 0.4) {
        star.classList.add('star-medium')
      } else {
        star.classList.add('star-fast')
      }
      
      container.appendChild(star)
    }
    
    for (let i = 0; i < 40; i++) {
      createStar()
    }
  }
})
</script>

<template>
  <div class="mission-center">
    <div class="mission-header">
      <button v-if="unitId" class="back-button" @click="router.push('/star-map')">
        返回星系
      </button>
      
      <h1 v-if="unit">{{ unit.name }} - 任务中心</h1>
      <h1 v-else>单词任务中心</h1>
      
      <p v-if="unit" class="unit-description">
        完成这些任务来掌握本单元的词汇。
      </p>
      <p v-else class="unit-description">
        通过这些有趣的任务练习你的词汇！
      </p>
    </div>
    
    <template v-if="!activeGame">
      <div class="mission-list">
        <MissionCard 
          v-for="game in games" 
          :key="game.id"
          :mission="game"
          @select="startGame(game.id)"
        />
      </div>
      
      <div class="mission-tips">
        <h3>指挥官提示：</h3>
        <ul>
          <li>完成任务可以获得经验值并提升等级！</li>
          <li>不同的任务测试不同的语言技能</li>
          <li>难度更高的任务给予更多经验值</li>
          <li>定期练习以保持你的语言技能</li>
        </ul>
      </div>
    </template>
    
    <template v-else-if="activeGame === 'completed'">
      <div class="game-completed">
        <h2>任务完成！</h2>
        <div class="game-score">
          <div class="score-display">
            <span class="score-value">{{ gameScore }}</span>
            <span class="score-max">/ {{ gameMaxScore }}</span>
          </div>
          <div class="score-label">掌握单词数</div>
        </div>
        
        <div class="rewards">
          <div class="reward-item">
            <div class="reward-value">+{{ gameScore * 10 }} 经验值</div>
            <div class="reward-label">获得经验</div>
          </div>
        </div>
        
        <button class="primary restart-button" @click="restartGame">
          开始新任务
        </button>
      </div>
    </template>
    
    <template v-else>
      <GameContainer 
        :gameId="activeGame"
        :words="gameWords"
        :options="gameOptions"
        @complete="endGame"
      />
    </template>
  </div>
</template>

<style scoped>
.mission-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
  position: relative;
  min-height: calc(100vh - 69px);
}

.mission-header {
  text-align: center;
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 8;
  /* padding: 1.5rem 1rem; */
}

.back-button {
  /* position: absolute;
  left: 0;
  top: 0.5rem; */
  position: fixed;
  left: 14rem;
  top: calc(69px + 60px);
  background: transparent;
  border: 2px solid var(--button-border-default);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  transition: transform 0.5s ease; 
}

.back-button:hover {
  background: var(--button-primary-bg-hover);
  color: var(--button-text-hover);
  transform: scale(1.05);
  /* box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.4); */
}

.mission-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.unit-description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.mission-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 100px;
}

.mission-tips {
  background-color: rgba(88, 166, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid var(--color-star-blue);
  margin-top: 1rem;
}

.mission-tips h3 {
  margin-bottom: 1rem;
  color: var(--color-star-blue);
}

.mission-tips ul {
  padding-left: 1.5rem;
}

.mission-tips li {
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.game-completed {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-space-medium);
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid rgba(57, 211, 83, 0.3);
  box-shadow: 0 0 30px rgba(57, 211, 83, 0.2);
  max-width: 500px;
  margin: 0 auto;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.game-completed h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--color-star-teal);
}

.game-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.score-display {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.score-value {
  font-weight: 700;
  color: var(--color-star-teal);
}

.score-max {
  color: var(--color-text-secondary);
  font-size: 2rem;
}

.score-label {
  color: var(--color-text-secondary);
}

.rewards {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.reward-item {
  text-align: center;
}

.reward-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-star-yellow);
}

.reward-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.restart-button {
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
}

@media (max-width: 768px) {
  .mission-header h1 {
    font-size: 2rem;
  }
  
  .mission-header {
    padding: 1rem;
  }
  
  .mission-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 80px;
  }
  
  .game-completed {
    padding: 1.5rem;
    margin-top: 80px;
  }
  
  .score-display {
    font-size: 2.5rem;
  }
  
  .score-max {
    font-size: 1.5rem;
  }
}
</style>

<style>
.game-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  background-color: rgba(22, 27, 34, 0.95);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(88, 166, 255, 0.3);
  z-index: 1000;
  transition: transform 0.3s ease;
  pointer-events: none;
}

.game-notification.show {
  transform: translateX(-50%) translateY(0);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-icon {
  font-size: 1.2rem;
}

.notification-message {
  color: var(--color-text-primary);
  font-size: 1rem;
}
</style>