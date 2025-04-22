<script setup lang="js">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WordMatchGame from './games/WordMatchGame.vue'
import SpellCheckGame from './games/SpellCheckGame.vue'
import SentenceBuilderGame from './games/SentenceBuilderGame.vue'
import WordRocketGame from './games/WordRocketGame.vue'

const props = defineProps({
  gameId: {
    type: String,
    required: true
  },
  words: {
    type: Array,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])

const timeRemaining = ref(props.options.timeLimit)
const timer = ref(null)
const score = ref(0)
const isTimerActive = ref(true)

const progressPercent = computed(() => {
  return Math.round((timeRemaining.value / props.options.timeLimit) * 100)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
})

function startTimer() {
  timer.value = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      stopTimer()
      emit('complete', score.value)
    }
  }, 1000)
}

function stopTimer() {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
    isTimerActive.value = false
  }
}

function updateScore(newScore) {
  score.value = newScore
  
  // 如果所有单词都正确，结束游戏
  if (score.value >= props.options.wordCount) {
    stopTimer()
    emit('complete', score.value)
  }
}

function exitGame() {
  stopTimer()
  emit('complete', score.value)
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <button class="exit-button" @click="exitGame">退出游戏</button>
      
      <div class="timer-container">
        <div class="timer-label">剩余时间：</div>
        <div class="timer-display">{{ formattedTime }}</div>
        <div class="timer-bar">
          <div 
            class="timer-bar-fill"
            :style="{ width: `${progressPercent}%` }"
            :class="{ 'warning': progressPercent < 50, 'danger': progressPercent < 20 }"
          ></div>
        </div>
      </div>
      
      <div class="score-container">
        <div class="score-label">得分：</div>
        <div class="score-display">{{ score }} / {{ props.options.wordCount }}</div>
      </div>
    </div>
    
    <div class="game-content">
      <WordMatchGame 
        v-if="gameId === 'word-match'"
        :words="words"
        :isActive="isTimerActive"
        @update-score="updateScore"
      />
      
      <SpellCheckGame 
        v-else-if="gameId === 'spell-check'"
        :words="words"
        :isActive="isTimerActive"
        @update-score="updateScore"
      />
      
      <SentenceBuilderGame 
        v-else-if="gameId === 'sentence-builder'"
        :words="words"
        :isActive="isTimerActive"
        @update-score="updateScore"
      />
      
      <WordRocketGame 
        v-else-if="gameId === 'word-rocket'"
        :words="words"
        :isActive="isTimerActive"
        @update-score="updateScore"
      />
      
      <div v-else class="game-not-found">
        <h2>游戏未找到</h2>
        <p>此任务仍在开发中。</p>
        <button class="primary" @click="exitGame">返回任务中心</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  background-color: var(--color-space-medium);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  border: 1px solid rgba(88, 166, 255, 0.2);
}

.game-header {
  background-color: rgba(13, 17, 23, 0.8);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.exit-button {
  background-color: rgba(248, 81, 73, 0.2);
  color: var(--color-error);
  border: 1px solid rgba(248, 81, 73, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.exit-button:hover {
  background-color: rgba(248, 81, 73, 0.3);
}

.timer-container {
  text-align: center;
}

.timer-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.timer-display {
  font-size: 1.2rem;
  font-weight: 600;
  font-family: monospace;
  margin-bottom: 0.25rem;
}

.timer-bar {
  width: 150px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.timer-bar-fill {
  height: 100%;
  background-color: var(--color-star-teal);
  transition: width 1s linear;
}

.timer-bar-fill.warning {
  background-color: var(--color-warning);
}

.timer-bar-fill.danger {
  background-color: var(--color-error);
}

.score-container {
  text-align: center;
}

.score-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.score-display {
  font-size: 1.2rem;
  font-weight: 600;
}

.game-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.game-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .timer-bar {
    width: 100%;
  }
}
</style>