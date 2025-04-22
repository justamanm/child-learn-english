<script setup lang="js">
import { computed, ref } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  isFlipped: {
    type: Boolean,
    required: true
  },
  isSpeaking: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['flip', 'speak'])
const showTranslation = ref(false)

const cardClasses = computed(() => {
  return {
    'word-card--flipped': props.isFlipped
  }
})

function handleFlip() {
  emit('flip')
}

function handleSpeak() {
  emit('speak')
}

function toggleTranslation() {
  showTranslation.value = !showTranslation.value
}
</script>

<template>
  <div 
    class="word-card-container"
    @click="handleFlip"
  >
    <div class="word-card" :class="cardClasses">
      <div class="word-card__front">
        <div class="word-card__content">
          <div class="word-card__word">{{ word.word }}</div>
          <div class="word-card__pronunciation">{{ word.pronunciation }}</div>
          <div class="word-card__part-of-speech">{{ word.partOfSpeech }}</div>
          
          <button 
            class="speak-button"
            @click.stop="handleSpeak"
            :disabled="isSpeaking"
          >
            <span class="speak-icon" :class="{ 'speaking': isSpeaking }">🔊</span>
            <span v-if="isSpeaking">播放中...</span>
            <span v-else>听发音</span>
          </button>
          
          <div class="flip-hint">
            <span>点击卡片查看含义</span>
          </div>
        </div>
        <div class="card-decoration front-decoration"></div>
      </div>
      
      <div class="word-card__back">
        <div class="word-card__content">
          <div class="word-card__word">{{ word.zh }}</div>
          <div class="word-card__meaning-label">含义：</div>
          <div class="word-card__meaning">{{ word.meaning }}</div>
          
          <div class="word-card__example-label">例句：</div>
          <div class="word-card__example">{{ word.exampleSentence }}</div>
          
          <div v-if="showTranslation" class="word-card__example-zh">{{ word.exampleSentence_zh }}</div>
          
          <button 
            class="translation-button"
            @click.stop="toggleTranslation"
          >
            <span class="translation-icon">🔄</span>
            <span>{{ showTranslation ? '隐藏' : '显示' }}中文翻译</span>
          </button>
          
          <div class="flip-hint">
            <span>点击卡片查看单词</span>
          </div>
        </div>
        <div class="card-decoration back-decoration"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.word-card-container {
  width: 100%;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
}

.word-card {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.word-card--flipped {
  transform: rotateY(180deg);
}

.word-card__front,
.word-card__back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.word-card__front {
  background-color: var(--color-space-medium);
  border: 1px solid rgba(88, 166, 255, 0.3);
}

.word-card__back {
  background-color: var(--color-space-medium);
  border: 1px solid rgba(137, 87, 229, 0.3);
  transform: rotateY(180deg);
}

/* 添加针对Safari和iOS的修复 */
@supports (-webkit-touch-callout: none) {
  /* 在iOS设备上应用特殊处理 */
  .word-card--flipped .word-card__front {
    opacity: 0;
  }
  
  .word-card:not(.word-card--flipped) .word-card__back {
    opacity: 0;
  }
}

.word-card:not(.word-card--flipped) .word-card__front {
  /* 在非翻转状态下显示正面 */
  visibility: visible;
  opacity: 1;
}

.word-card--flipped .word-card__front {
  /* 在翻转状态下隐藏正面 */
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s 0.3s, opacity 0.3s;
}

.word-card:not(.word-card--flipped) .word-card__back {
  /* 在非翻转状态下隐藏背面 */
  visibility: hidden;
  opacity: 0;
}

.word-card--flipped .word-card__back {
  /* 在翻转状态下显示背面 */
  visibility: visible;
  opacity: 1;
  transition: visibility 0s, opacity 0.3s 0.3s;
}

.word-card__content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.word-card__word {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.word-card__pronunciation {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.word-card__part-of-speech {
  font-style: italic;
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.speak-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem auto;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  background-color: rgba(88, 166, 255, 0.1);
  color: var(--color-star-blue);
  border: 1px solid rgba(88, 166, 255, 0.3);
  transition: all 0.3s ease;
}

.speak-button:hover {
  background-color: rgba(88, 166, 255, 0.2);
}

.speak-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.speak-icon {
  font-size: 1.2rem;
}

.speak-icon.speaking {
  animation: pulse 1s infinite;
}

.translation-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem auto;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  background-color: rgba(137, 87, 229, 0.1);
  color: var(--color-star-purple);
  border: 1px solid rgba(137, 87, 229, 0.3);
  transition: all 0.3s ease;
}

.translation-button:hover {
  background-color: rgba(137, 87, 229, 0.2);
}

.translation-icon {
  font-size: 1.2rem;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.word-card__meaning-label,
.word-card__example-label {
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
  color: var(--color-star-purple);
}

.word-card__meaning {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.word-card__example {
  font-size: 1.1rem;
  font-style: italic;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.word-card__example-zh {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(137, 87, 229, 0.05);
  border-radius: 6px;
  border-left: 3px solid var(--color-star-purple);
  animation: fadeIn 0.3s ease;
}

.flip-hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.card-decoration {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.1;
  z-index: 0;
}

.front-decoration {
  background: var(--color-star-blue);
  top: -100px;
  right: -100px;
}

.back-decoration {
  background: var(--color-star-purple);
  bottom: -100px;
  left: -100px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .word-card-container {
    height: 300px;
  }
  
  .word-card__word {
    font-size: 2rem;
  }
  
  .word-card__front,
  .word-card__back {
    padding: 1.5rem;
  }
  
  .word-card__pronunciation,
  .word-card__meaning {
    font-size: 1rem;
  }
  
  .word-card__example {
    font-size: 0.9rem;
    padding: 0;
  }
  
  .speak-button {
    padding: 0.5rem 1rem;
    margin: 0.7rem auto;
  }
  
  /* 强化移动端的卡片翻转效果，使用更简单直接的方法 */
  .word-card--flipped .word-card__front {
    /* 翻转时强制隐藏正面 */
    display: none !important;
  }
  
  .word-card:not(.word-card--flipped) .word-card__back {
    /* 非翻转时强制隐藏背面 */
    display: none !important;
  }
}
</style>