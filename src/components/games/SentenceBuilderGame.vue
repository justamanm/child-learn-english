<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps<{
  words: any[]
  isActive: boolean
}>()

const emit = defineEmits(['update-score'])

interface Sentence {
  id: string
  text: string
  words: string[]
  mainWord: string
}

const sentences = ref<Sentence[]>([])
const currentIndex = ref(0)
const score = ref(0)
const shuffledWords = ref<string[]>([])
const selectedWords = ref<string[]>([])
const isChecking = ref(false)
const showHint = ref(false)
const attempts = ref(0)

const currentSentence = computed(() => sentences.value[currentIndex.value])

// Generate simple sentences using the vocabulary words
function generateSentences() {
  sentences.value = props.words.map(word => {
    // Create a basic sentence using the word
    const sentence = {
      id: word.id,
      text: word.exampleSentence || generateSimpleSentence(word.word),
      words: [],
      mainWord: word.word
    }
    
    // Extract words from the sentence
    sentence.words = sentence.text
      .replace(/[.,!?;:"]/g, '')
      .split(' ')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 1)
    
    return sentence
  })
  
  // Shuffle the sentences
  sentences.value.sort(() => Math.random() - 0.5)
  
  // Take first 5 sentences or all if fewer
  sentences.value = sentences.value.slice(0, Math.min(5, sentences.value.length))
  
  prepareCurrentSentence()
}

function generateSimpleSentence(word: string) {
  const templates = [
    `The ${word} is very important for students.`,
    `I like to study about the ${word} in school.`,
    `Scientists discovered a new ${word} in space.`,
    `My teacher explained what ${word} means yesterday.`,
    `The book contains information about ${word}.`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

function prepareCurrentSentence() {
  if (!currentSentence.value) return
  
  // Create a shuffled copy of the words
  shuffledWords.value = [...currentSentence.value.words].sort(() => Math.random() - 0.5)
  selectedWords.value = []
  showHint.value = false
  attempts.value = 0
}

function selectWord(word: string, index: number) {
  if (isChecking.value) return
  
  // Add word to selected words
  selectedWords.value.push(word)
  
  // Remove from shuffled words
  shuffledWords.value.splice(index, 1)
}

function deselectWord(word: string, index: number) {
  if (isChecking.value) return
  
  // Add back to shuffled words
  shuffledWords.value.push(word)
  
  // Remove from selected words
  selectedWords.value.splice(index, 1)
}

function checkSentence() {
  if (isChecking.value || selectedWords.value.length === 0) return
  
  isChecking.value = true
  attempts.value++
  
  // Compare with original sentence words
  const isCorrect = areArraysEqual(
    selectedWords.value.map(w => w.toLowerCase()),
    currentSentence.value.words.map(w => w.toLowerCase())
  )
  
  if (isCorrect) {
    // Increase score
    score.value++
    emit('update-score', score.value)
    
    // Move to next sentence after a short delay
    setTimeout(() => {
      if (currentIndex.value < sentences.value.length - 1) {
        currentIndex.value++
        prepareCurrentSentence()
      }
      isChecking.value = false
    }, 1500)
  } else {
    // Show feedback that it's incorrect
    setTimeout(() => {
      isChecking.value = false
      
      // Show hint after first attempt
      if (attempts.value >= 1) {
        showHint.value = true
      }
    }, 1500)
  }
}

function areArraysEqual(arr1: string[], arr2: string[]) {
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }
  return true
}

function resetCurrentSentence() {
  prepareCurrentSentence()
}

function skipSentence() {
  if (currentIndex.value < sentences.value.length - 1) {
    currentIndex.value++
    prepareCurrentSentence()
  }
}

const progress = computed(() => {
  return Math.round((currentIndex.value + 1) / sentences.value.length * 100)
})

const isCompleted = computed(() => {
  return score.value >= sentences.value.length
})

// Initialize the game
onMounted(() => {
  generateSentences()
})

// Reset the game if it becomes active again
watch(() => props.isActive, (newValue) => {
  if (newValue) {
    score.value = 0
    currentIndex.value = 0
    generateSentences()
  }
})
</script>

<template>
  <div class="sentence-builder-game">
    <div class="game-instructions">
      <h2>造句练习</h2>
      <p>排列单词组成正确的英语句子。</p>
    </div>
    
    <div class="game-progress">
      <div class="progress-text">句子 {{ currentIndex + 1 }} / {{ sentences.length }}</div>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
    
    <div v-if="currentSentence" class="sentence-card" :class="{ 'checking': isChecking }">
      <div class="sentence-info">
        <div class="word-highlight">目标单词：<span>{{ currentSentence.mainWord }}</span></div>
        
        <div v-if="showHint" class="sentence-hint">
          <div class="hint-label">提示：</div>
          <div class="hint-text">{{ currentSentence.text }}</div>
        </div>
      </div>
      
      <div class="sentence-workspace">
        <div 
          class="sentence-result"
          :class="{ 'correct': isChecking && score > currentIndex }"
        >
          <div v-if="selectedWords.length === 0" class="placeholder">
            在此处按顺序排列单词...
          </div>
          
          <div v-else class="selected-words">
            <div
              v-for="(word, index) in selectedWords"
              :key="`selected-${index}`"
              class="word-chip selected"
              @click="deselectWord(word, index)"
            >
              {{ word }}
            </div>
          </div>
        </div>
        
        <div class="word-bank">
          <div
            v-for="(word, index) in shuffledWords"
            :key="`shuffled-${index}`"
            class="word-chip"
            @click="selectWord(word, index)"
          >
            {{ word }}
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button 
          class="check-button"
          @click="checkSentence"
          :disabled="selectedWords.length === 0 || isChecking"
        >
          检查句子
        </button>
        
        <button 
          class="reset-button"
          @click="resetCurrentSentence"
          :disabled="isChecking"
        >
          重置
        </button>
        
        <button 
          class="skip-button"
          @click="skipSentence"
          :disabled="isChecking || currentIndex >= sentences.length - 1"
        >
          跳过
        </button>
      </div>
    </div>
    
    <div v-if="isCompleted" class="completion-message">
      <h3>太棒了！你已完成所有句子！</h3>
      <p>你成功组建了 {{ score }} 个句子，共 {{ sentences.length }} 个。</p>
    </div>
  </div>
</template>

<style scoped>
.sentence-builder-game {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
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

.sentence-card {
  background-color: var(--color-space-dark);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sentence-card.checking {
  pointer-events: none;
  opacity: 0.8;
}

.sentence-info {
  text-align: center;
}

.word-highlight {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.word-highlight span {
  color: var(--color-star-blue);
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  background-color: rgba(88, 166, 255, 0.1);
  border-radius: 4px;
}

.sentence-hint {
  background-color: rgba(255, 211, 61, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 211, 61, 0.3);
  margin-top: 1rem;
  animation: fadeIn 0.5s ease;
}

.hint-label {
  font-weight: 600;
  color: var(--color-warning);
  margin-bottom: 0.5rem;
}

.hint-text {
  color: var(--color-text-secondary);
  font-style: italic;
}

.sentence-workspace {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sentence-result {
  min-height: 80px;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  transition: all 0.3s ease;
}

.sentence-result.correct {
  background-color: rgba(57, 211, 83, 0.1);
  border-color: rgba(57, 211, 83, 0.4);
}

.placeholder {
  width: 100%;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

.selected-words {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
}

.word-bank {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  min-height: 60px;
}

.word-chip {
  padding: 0.5rem 1rem;
  background-color: rgba(88, 166, 255, 0.1);
  border: 1px solid rgba(88, 166, 255, 0.3);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.word-chip:hover {
  transform: translateY(-2px);
  background-color: rgba(88, 166, 255, 0.2);
}

.word-chip.selected {
  background-color: rgba(137, 87, 229, 0.1);
  border-color: rgba(137, 87, 229, 0.3);
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

.reset-button {
  background-color: rgba(255, 211, 61, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(255, 211, 61, 0.3);
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.reset-button:hover:not(:disabled) {
  background-color: rgba(255, 211, 61, 0.2);
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
  .sentence-card {
    padding: 1.5rem;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .check-button, .reset-button, .skip-button {
    flex: 1;
    min-width: 100px;
    padding: 0.7rem 0.5rem;
  }
}
</style>