<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps<{
  words: any[]
  isActive: boolean
}>()

const emit = defineEmits(['update-score'])

interface MatchItem {
  id: string
  type: 'word' | 'meaning'
  content: string
  isMatched: boolean
  isSelected: boolean
}

const items = ref<MatchItem[]>([])
const selectedItem = ref<MatchItem | null>(null)
const matchedPairs = ref(0)
const isChecking = ref(false)

// Prepare game items
function prepareItems() {
  const wordItems = props.words.map(word => ({
    id: `word-${word.id}`,
    type: 'word' as const,
    content: word.word,
    isMatched: false,
    isSelected: false
  }))
  
  const meaningItems = props.words.map(word => ({
    id: `meaning-${word.id}`,
    type: 'meaning' as const,
    content: word.meaning,
    isMatched: false,
    isSelected: false
  }))
  
  // Combine and shuffle
  items.value = [...wordItems, ...meaningItems].sort(() => Math.random() - 0.5)
  matchedPairs.value = 0
  selectedItem.value = null
}

function handleItemClick(item: MatchItem) {
  if (!props.isActive || item.isMatched || isChecking.value) return
  
  // If clicking the same item, deselect it
  if (selectedItem.value && selectedItem.value.id === item.id) {
    selectedItem.value.isSelected = false
    selectedItem.value = null
    return
  }
  
  // Mark as selected
  item.isSelected = true
  
  // If no item is currently selected, set this as selected
  if (!selectedItem.value) {
    selectedItem.value = item
    return
  }
  
  // Check for match
  const previousItem = selectedItem.value
  selectedItem.value = null
  
  // Can't match two of the same type
  if (previousItem.type === item.type) {
    setTimeout(() => {
      previousItem.isSelected = false
      item.isSelected = false
    }, 500)
    return
  }
  
  // Check if the IDs match (removing the prefix)
  const prevId = previousItem.id.split('-')[1]
  const currentId = item.id.split('-')[1]
  
  isChecking.value = true
  
  if (prevId === currentId) {
    // Match found!
    previousItem.isMatched = true
    item.isMatched = true
    matchedPairs.value++
    
    // Update score
    emit('update-score', matchedPairs.value)
    
    isChecking.value = false
  } else {
    // No match
    setTimeout(() => {
      previousItem.isSelected = false
      item.isSelected = false
      isChecking.value = false
    }, 1000)
  }
}

const isCompleted = computed(() => {
  return matchedPairs.value === props.words.length
})

// Initialize the game
onMounted(() => {
  prepareItems()
})

// Reset the game if it becomes active again
watch(() => props.isActive, (newValue) => {
  if (newValue) {
    prepareItems()
  }
})
</script>

<template>
  <div class="word-match-game">
    <div class="game-instructions">
      <h2>单词配对</h2>
      <p>将每个英语单词与其正确含义匹配。</p>
    </div>
    
    <div class="match-board" :class="{ 'completed': isCompleted }">
      <div 
        v-for="item in items" 
        :key="item.id"
        class="match-item"
        :class="{
          'word': item.type === 'word',
          'meaning': item.type === 'meaning',
          'selected': item.isSelected,
          'matched': item.isMatched
        }"
        @click="handleItemClick(item)"
      >
        <div class="match-item-content">{{ item.content }}</div>
      </div>
    </div>
    
    <div v-if="isCompleted" class="completion-message">
      <h3>太棒了！所有配对都找到了！</h3>
    </div>
  </div>
</template>

<style scoped>
.word-match-game {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

.match-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 0 auto;
  max-width: 900px;
}

.match-board.completed {
  opacity: 0.7;
}

.match-item {
  height: 100px;
  background-color: var(--color-space-dark);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  padding: 1rem;
}

.match-item.word {
  border-left: 3px solid var(--color-star-blue);
}

.match-item.meaning {
  border-left: 3px solid var(--color-star-purple);
}

.match-item-content {
  text-align: center;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.match-item:hover:not(.matched) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.match-item.selected {
  background-color: rgba(88, 166, 255, 0.2);
  box-shadow: 0 0 15px rgba(88, 166, 255, 0.3);
  transform: scale(1.05);
}

.match-item.matched {
  background-color: rgba(57, 211, 83, 0.2);
  border-color: rgba(57, 211, 83, 0.5);
  cursor: default;
}

.match-item.matched .match-item-content {
  color: var(--color-star-teal);
}

.completion-message {
  text-align: center;
  color: var(--color-star-teal);
  animation: fadeIn 1s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .match-board {
    grid-template-columns: 1fr 1fr;
  }
  
  .match-item {
    height: 80px;
  }
  
  .match-item-content {
    font-size: 0.9rem;
  }
}
</style>