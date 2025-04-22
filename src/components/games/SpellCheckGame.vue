<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps<{
  words: any[]
  isActive: boolean
}>()

const emit = defineEmits(['update-score'])

interface GameWord {
  id: string
  original: string
  meaning: string
  userInput: string
  isCorrect: boolean | null
  attempts: number
}

const gameWords = ref<GameWord[]>([])
const currentIndex = ref(0)
const correctCount = ref(0)
const showHint = ref(false)
const isChecking = ref(false)

const currentWord = computed(() => gameWords.value[currentIndex.value])

function prepareGame() {
  gameWords.value = props.words.map(word => ({
    id: word.id,
    original: word.word,
    meaning: word.meaning,
    userInput: '',
    isCorrect: null,
    attempts: 0
  }))
  
  // Shuffle words
  gameWords.value.sort(() => Math.random() - 0.5)
  
  currentIndex.value = 0
  correctCount.value = 0
  showHint.value = false
}

function checkSpelling() {
  if (!currentWord.value || isChecking.value) return
  
  isChecking.value = true
  const word = currentWord.value
  
  // Trim and normalize input for comparison
  const normalizedInput = word.userInput.trim().toLowerCase()
  const normalizedOriginal = word.original.toLowerCase()
  
  // Check if the spelling is correct
  if (normalizedInput === normalizedOriginal) {
    word.isCorrect = true
    
    if (word.attempts === 0) {
      // First try gets full point
      correctCount.value++
    } else if (word.attempts === 1) {
      // Second try gets half point (implementation simplification)
      correctCount.value += 0.5
    }
    
    // Update score - rounded down to ensure whole numbers
    emit('update-score', Math.floor(correctCount.value))
    
    // Move to next word after a short delay
    setTimeout(() => {
      if (currentIndex.value < gameWords.value.length - 1) {
        currentIndex.value++
        showHint.value = false
      }
      isChecking.value = false
    }, 1500)
  } else {
    word.isCorrect = false
    word.attempts++
    
    // Show hint after first failed attempt
    if (word.attempts === 1) {
      showHint.value = true
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      word.isCorrect = null
      isChecking.value = false
    }, 2000)
  }
}

function getHint() {
  if (!currentWord.value) return ''
  
  const word = currentWord.value.original
  // Show first letter, then dots for remaining letters
  return `${word[0]}${'.'.repeat(word.length - 2)}${word[word.length - 1]}`
}

function skipWord() {
  if (currentIndex.value < gameWords.value.length - 1) {
    currentIndex.value++
    showHint.value = false
  }
}

const isCompleted = computed(() => {
  return currentIndex.value >= gameWords.value.length - 1 && 
         currentWord.value?.isCorrect === true
})

const progress = computed(() => {
  return Math.round((currentIndex.value + 1) / gameWords.value.length * 100)
})

// Initialize the game
onMounted(() => {
  prepareGame()
})

// Reset the game if it becomes active again
watch(() => props.isActive, (newValue) => {
  if (newValue) {
    prepareGame()
  }
})
</script>

<template>
  <div class="spell-check-game">
    <div class="game-instructions">
      <h2>拼写检查</h2>
      <p>根据单词的含义输入正确的拼写。</p>
    </div>
    
    <div class="game-progress">
      <div class="progress-text">单词 {{ currentIndex + 1 }} / {{ gameWords.length }}</div>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
    
    <div class="spell-card" :class="{ 'correct': currentWord?.isCorrect === true, 'incorrect': currentWord?.isCorrect === false }">
      <div class="meaning-display">{{ currentWord?.meaning }}</div>
      
      <div class="input-container">
        <input 
          type="text" 
          v-model="currentWord.userInput"
          placeholder="在此输入单词..."
          @keyup.enter="checkSpelling"
          :disabled="currentWord?.isCorrect === true || isChecking"
          class="word-input"
        />
        
        <div v-if="showHint" class="hint-text">
          提示: {{ getHint() }}
        </div>
        
        <div v-if="currentWord?.isCorrect === true" class="result-message correct">
          正确！做得好！
        </div>
        
        <div v-if="currentWord?.isCorrect === false" class="result-message incorrect">
          不太对，再试一次！
        </div>
      </div>
      
      <div class="action-buttons">
        <button 
          class="check-button"
          @click="checkSpelling"
          :disabled="!currentWord?.userInput || currentWord?.isCorrect === true || isChecking"
        >
          检查答案
        </button>
        
        <button 
          class="skip-button"
          @click="skipWord"
          :disabled="isChecking"
        >
          跳过单词
        </button>
      </div>
    </div>
    
    <div v-if="isCompleted" class="completion-message">
      <h3>做得好！你已完成拼写挑战！</h3>
      <p>你正确拼写了 {{ Math.floor(correctCount) }} 个单词，共 {{ gameWords.length }} 个。</p>
    </div>
  </div>
</template>

<style scoped>
.spell-check-game {
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

.game-progress {
  text-align: center;
}

.progress-text {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.progress-bar {
  height: 8px;
  background-color: var(--color-space-light);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  transition: width 0.3s ease;
}

.spell-card {
  background-color: var(--color-space-dark);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.spell-card.correct {
  border-color: rgba(57, 211, 83, 0.5);
  background-color: rgba(57, 211, 83, 0.1);
}

.spell-card.incorrect {
  border-color: rgba(248, 81, 73, 0.5);
  background-color: rgba(248, 81, 73, 0.1);
}

.meaning-display {
  font-size: 1.3rem;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.word-input {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1.2rem;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--color-text-primary);
  text-align: center;
  transition: all 0.3s ease;
}

.word-input:focus {
  outline: none;
  border-color: var(--color-star-blue);
  box-shadow: 0 0 15px rgba(88, 166, 255, 0.3);
}

.hint-text {
  color: var(--color-star-yellow);
  font-size: 1rem;
  animation: fadeIn 0.5s ease;
}

.result-message {
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  animation: fadeIn 0.5s ease;
}

.result-message.correct {
  color: var(--color-star-teal);
}

.result-message.incorrect {
  color: var(--color-error);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.check-button {
  background-color: rgba(88, 166, 255, 0.2);
  color: var(--color-star-blue);
  border: 1px solid rgba(88, 166, 255, 0.3);
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.check-button:hover:not(:disabled) {
  background-color: rgba(88, 166, 255, 0.3);
  transform: translateY(-2px);
}

.skip-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text-secondary);
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.skip-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
}

.completion-message {
  text-align: center;
  padding: 2rem;
  background-color: rgba(57, 211, 83, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(57, 211, 83, 0.3);
  animation: fadeIn 1s ease;
}

.completion-message h3 {
  color: var(--color-star-teal);
  margin-bottom: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .spell-card {
    padding: 1.5rem;
  }
  
  .meaning-display {
    font-size: 1.2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .check-button, .skip-button {
    width: 100%;
  }
}
</style>