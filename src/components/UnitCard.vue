<script setup lang="js">
import { computed } from 'vue'

const props = defineProps({
  unit: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['click'])

const statusClasses = computed(() => {
  return {
    'unit-card--new': props.status === 'new',
    'unit-card--started': props.status === 'started',
    'unit-card--learning': props.status === 'learning',
    'unit-card--mastered': props.status === 'mastered'
  }
})

const statusLabel = computed(() => {
  switch (props.status) {
    case 'new': return '未探索'
    case 'started': return '已开始'
    case 'learning': return '探索中'
    case 'mastered': return '大师'
  }
})

const difficultyStars = computed(() => {
  return '⭐'.repeat(props.unit.difficulty)
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <div 
    class="unit-card" 
    :class="statusClasses"
    @click="handleClick"
  >
    <div class="unit-card__icon">{{ unit.icon }}</div>
    <div class="unit-card__content">
      <h3 class="unit-card__title">{{ unit.name }}</h3>
      <p class="unit-card__description">{{ unit.description }}</p>
      
      <div class="unit-card__details">
        <div class="unit-card__detail">
          <span class="unit-card__detail-label">单词数:</span>
          <span class="unit-card__detail-value">{{ unit.wordCount }}</span>
        </div>
        <div class="unit-card__detail">
          <span class="unit-card__detail-label">难度:</span>
          <span class="unit-card__detail-value">{{ difficultyStars }}</span>
        </div>
      </div>
      
      <div class="unit-card__progress">
        <div class="unit-card__progress-bar">
          <div 
            class="unit-card__progress-fill"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="unit-card__progress-label">
          <span class="unit-card__status">{{ statusLabel }}</span>
          <span class="unit-card__percentage">{{ progress }}%</span>
        </div>
      </div>
    </div>
    
    <div class="unit-card__glow"></div>
    <div class="unit-card__stars"></div>
  </div>
</template>

<style scoped>
.unit-card {
  background-color: rgba(22, 27, 34, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 1;
}

.unit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.unit-card__icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.unit-card__title {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.unit-card__description {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.unit-card__details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.unit-card__detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.unit-card__detail-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.unit-card__detail-value {
  font-size: 0.9rem;
}

.unit-card__progress {
  margin-top: auto;
}

.unit-card__progress-bar {
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.unit-card__progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.unit-card__progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.unit-card__status {
  color: var(--color-text-secondary);
}

.unit-card__percentage {
  font-weight: 600;
}

.unit-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.unit-card:hover .unit-card__glow {
  opacity: 0.8;
}

.unit-card__stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -2;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.05;
}

/* Status specific styles */
.unit-card--new {
  border-color: rgba(139, 148, 158, 0.3);
}

.unit-card--new .unit-card__progress-fill {
  background-color: var(--color-text-secondary);
}

.unit-card--new .unit-card__glow {
  box-shadow: 0 0 20px rgba(139, 148, 158, 0.3);
}

.unit-card--started {
  border-color: rgba(88, 166, 255, 0.3);
}

.unit-card--started .unit-card__progress-fill {
  background-color: var(--color-star-blue);
}

.unit-card--started .unit-card__glow {
  box-shadow: 0 0 20px rgba(88, 166, 255, 0.3);
}

.unit-card--learning {
  border-color: rgba(137, 87, 229, 0.3);
}

.unit-card--learning .unit-card__progress-fill {
  background-color: var(--color-star-purple);
}

.unit-card--learning .unit-card__glow {
  box-shadow: 0 0 20px rgba(137, 87, 229, 0.3);
}

.unit-card--mastered {
  border-color: rgba(57, 211, 83, 0.3);
}

.unit-card--mastered .unit-card__progress-fill {
  background-color: var(--color-star-teal);
}

.unit-card--mastered .unit-card__glow {
  box-shadow: 0 0 20px rgba(57, 211, 83, 0.3);
}
</style>