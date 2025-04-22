<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  words: any[]
  isActive: boolean
}>()

const emit = defineEmits(['update-score'])

interface GameWord {
  id: string
  word: string
  meaning: string
  options: string[]
  correct: string
  isAnswered: boolean
  isCorrect: boolean | null
}

const gameWords = ref<GameWord[]>([])
const currentIndex = ref(0)
const score = ref(0)
const timePerWord = ref(10) // seconds
const timeRemaining = ref(10)
const timer = ref<number | null>(null)
const gameActive = ref(true)
const isAnimating = ref(false)

const currentWord = computed(() => gameWords.value[currentIndex.value])

// Initialize the game
function prepareGame() {
  // Create game words with multiple choices for each
  gameWords.value = props.words.map(word => {
    // Get other random words for options (excluding current word)
    const otherWords = props.words
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.word)
    
    // Create all options including the correct word
    const allOptions = [...otherWords, word.word].sort(() => Math.random() - 0.5)
    
    return {
      id: word.id,
      word: word.word,
      meaning: word.meaning,
      options: allOptions,
      correct: word.word,
      isAnswered: false,
      isCorrect: null
    }
  })
  
  // Shuffle words
  gameWords.value.sort(() => Math.random() - 0.5)
  
  currentIndex.value = 0
  score.value = 0
  resetTimer()
  startTimer()
  gameActive.value = true
}

function resetTimer() {
  timeRemaining.value = timePerWord.value
}

function startTimer() {
  if (timer.value) clearInterval(timer.value)
  
  timer.value = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      // Time's up for this word
      handleTimeout()
    }
  }, 1000)
}

function stopTimer() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function handleTimeout() {
  if (!currentWord.value || currentWord.value.isAnswered) return
  
  // Mark as answered but incorrect
  currentWord.value.isAnswered = true
  currentWord.value.isCorrect = false
  
  moveToNextWord()
}

function checkAnswer(selectedOption: string) {
  if (!currentWord.value || currentWord.value.isAnswered || !gameActive.value || isAnimating.value) return
  
  isAnimating.value = true
  stopTimer()
  
  // Check if the answer is correct
  const isCorrect = selectedOption === currentWord.value.correct
  
  // Update word status
  currentWord.value.isAnswered = true
  currentWord.value.isCorrect = isCorrect
  
  // Update score if correct
  if (isCorrect) {
    score.value++
    emit('update-score', score.value)
  }
  
  // Wait a moment to show feedback before moving to next word
  setTimeout(() => {
    moveToNextWord()
    isAnimating.value = false
  }, 1500)
}

function moveToNextWord() {
  if (currentIndex.value < gameWords.value.length - 1) {
    currentIndex.value++
    resetTimer()
    startTimer()
  } else {
    // Game complete
    gameActive.value = false
    stopTimer()
  }
}

const timeProgressPercent = computed(() => {
  return (timeRemaining.value / timePerWord.value) * 100
})

const gameProgress = computed(() => {
  return ((currentIndex.value) / gameWords.value.length) * 100
})

onMounted(() => {
  prepareGame()
})

onUnmounted(() => {
  stopTimer()
})

watch(() => props.isActive, (newValue) => {
  if (newValue) {
    prepareGame()
  } else {
    stopTimer()
    gameActive.value = false
  }
})
</script>

<template>
  <div class="word-rocket-game">
    <div class="game-instructions">
      <h2>单词火箭</h2>
      <p>快速选择与含义匹配的正确单词，在时间结束前完成任务！</p>
    </div>
    
    <div class="game-status">
      <div class="time-container">
        <div class="time-label">剩余时间：</div>
        <div class="time-bar">
          <div 
            class="time-fill"
            :style="{ width: `${timeProgressPercent}%` }"
            :class="{ 'warning': timeProgressPercent < 50, 'danger': timeProgressPercent < 20 }"
          ></div>
        </div>
      </div>
      
      <div class="progress-container">
        <div class="progress-label">进度：</div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${gameProgress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ currentIndex }} / {{ gameWords.length }}</div>
      </div>
    </div>
    
    <div class="game-content" v-if="currentWord && gameActive">
      <div class="meaning-card">
        <div class="meaning-text">{{ currentWord.meaning }}</div>
      </div>
      
      <div class="options-container">
        <button 
          v-for="(option, index) in currentWord.options" 
          :key="index"
          class="option-button"
          :class="{
            'selected': currentWord.isAnswered && option === currentWord.correct,
            'incorrect': currentWord.isAnswered && option !== currentWord.correct && currentWord.isCorrect === false
          }"
          @click="checkAnswer(option)"
          :disabled="currentWord.isAnswered"
        >
          {{ option }}
        </button>
      </div>
    </div>
    
    <div v-else-if="!gameActive" class="game-complete">
      <h3>任务完成！</h3>
      <div class="final-score">
        <div class="score-value">{{ score }} / {{ gameWords.length }}</div>
        <div class="score-label">正确识别的单词</div>
      </div>
      
      <div class="accuracy">
        准确率：{{ Math.round((score / gameWords.length) * 100) }}%
      </div>
    </div>
  </div>
</template>

<style scoped>
.word-rocket-game {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 700px;
  margin: 0 auto;
}

.game-instructions {
  text-align: center;
  margin-bottom: 1rem;
}

.game-instructions h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--color-star-blue);
}

.game-instructions p {
  color: var(--color-text-secondary);
}

.game-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.time-container, .progress-container {
  flex: 1;
}

.time-label, .progress-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.time-bar, .progress-bar {
  height: 8px;
  background-color: var(--color-space-light);
  border-radius: 4px;
  overflow: hidden;
}

.time-fill {
  height: 100%;
  background-color: var(--color-star-teal);
  transition: width 1s linear;
}

.time-fill.warning {
  background-color: var(--color-warning);
}

.time-fill.danger {
  background-color: var(--color-error);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  text-align: right;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.meaning-card {
  background-color: var(--color-space-dark);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(88, 166, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.meaning-text {
  font-size: 1.3rem;
  line-height: 1.5;
}

.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.option-button {
  padding: 1.5rem 1rem;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.option-button:hover:not(:disabled) {
  transform: translateY(-3px);
  background-color: rgba(88, 166, 255, 0.1);
  border-color: rgba(88, 166, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.option-button.selected {
  background-color: rgba(57, 211, 83, 0.2);
  border-color: rgba(57, 211, 83, 0.5);
  color: var(--color-star-teal);
  transform: translateY(-3px);
  box-shadow: 0 0 15px rgba(57, 211, 83, 0.3);
}

.option-button.incorrect {
  background-color: rgba(248, 81, 73, 0.2);
  border-color: rgba(248, 81, 73, 0.5);
  color: var(--color-error);
}

.game-complete {
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--color-space-dark);
  border-radius: 16px;
  border: 1px solid rgba(88, 166, 255, 0.3);
  animation: fadeIn 1s ease;
}

.game-complete h3 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--color-star-blue);
}

.final-score {
  margin-bottom: 1.5rem;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.score-label {
  color: var(--color-text-secondary);
}

.accuracy {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-star-teal);
  background-color: rgba(57, 211, 83, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  display: inline-block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .game-status {
    flex-direction: column;
    gap: 1rem;
  }
  
  .options-container {
    grid-template-columns: 1fr;
  }
  
  .meaning-card {
    padding: 1.5rem;
  }
  
  .meaning-text {
    font-size: 1.2rem;
  }
}
</style>