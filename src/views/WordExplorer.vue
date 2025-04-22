<script setup lang="js">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVocabularyStore } from '../stores/vocabulary'
import { useUserProgressStore } from '../stores/userProgress'
import WordCard from '../components/WordCard.vue'
import { Howl } from 'howler'
import flipSoundMp3 from '@/assets/audio/card-flip.mp3';
import successSoundMp3 from '@/assets/audio/success.mp3';

const route = useRoute()
const router = useRouter()
const vocabStore = useVocabularyStore()
const progressStore = useUserProgressStore()

const unitId = computed(() => route.params.unitId)
const unit = computed(() => vocabStore.getUnitById(unitId.value))
const words = computed(() => vocabStore.getWordsByUnitId(unitId.value))

const currentIndex = ref(0)
const currentWord = computed(() => words.value[currentIndex.value])
const isFlipped = ref(false)
const isSpeaking = ref(false)
const isCompleted = ref(false)


// Sound effects
let flipSound = null
let successSound = null

function nextWord() {
  if (currentIndex.value < words.value.length - 1) {
    isFlipped.value = false
    currentIndex.value++
  } else {
    completeStudy()
  }
}

function prevWord() {
  if (currentIndex.value > 0) {
    isFlipped.value = false
    currentIndex.value--
  }
}

function flipCard() {
  // 先翻转卡片，提高用户体验的响应速度
  isFlipped.value = !isFlipped.value
  
  // 异步播放音效，避免阻塞UI渲染
  if (flipSound) {
    setTimeout(() => {
      try {
        flipSound.play();
      } catch (error) {
        console.warn('音频播放失败:', error);
        // 播放失败时不阻止卡片翻转
      }
    }, 0);
  }
}

function speakWord() {
  if (isSpeaking.value) return
  
  isSpeaking.value = true
  
  // Use browser's speech synthesis
  // 使用浏览器内置的语音合成
  const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  
  utterance.onend = () => {
    isSpeaking.value = false
  }
  
  speechSynthesis.speak(utterance)
}

function markAsKnown() {
  progressStore.markWordAsKnown(unitId.value, currentWord.value.id)
  newKnownWordIds.value.push(currentWord.value.id)
  if (successSound) successSound.play()
  nextWord()
}

function markForReview() {
  progressStore.markWordForReview(unitId.value, currentWord.value.id)
  newReviewedWordIds.value.push(currentWord.value.id)
  nextWord()
}

function jumpToWord(index) {
  isFlipped.value = false
  currentIndex.value = index
}

function getWordStatus(wordId) {
  return progressStore.getWordStatus(unitId.value, wordId)
}

function completeStudy() {
  isCompleted.value = true

  progressStore.addExperience(experienceGained.value)
  
  const progressPercentage = Math.round((wordsLearned.value / words.value.length) * 100)
  progressStore.updateUnitProgress(unitId.value, progressPercentage)
  
  newKnownWordIds.value = []
  newReviewedWordIds.value = []
  if (successSound) successSound.play()
}


function restartLearning() {
  isCompleted.value = false
  currentIndex.value = 0
  isFlipped.value = false
}

function goToMissionCenter() {
  router.push(`/mission-center/${unitId.value}`)
}

const progress = computed(() => {
  return Math.round((currentIndex.value + 1) / words.value.length * 100)
})

// 所有已掌握的单词
const wordsLearned = computed(() => {
  return words.value.filter(word => 
    getWordStatus(word.id) === 'known'
  ).length
})

// 所有需要练习的单词
const wordsReviewed = computed(() => {
  return words.value.filter(word => 
    getWordStatus(word.id) === 'review'
  ).length
})

// 新已掌握的单词ID
const newKnownWordIds = ref([])
// 新标记需要练习的单词ID
const newReviewedWordIds = ref([])


const knownPercent = computed(() => {
  return Math.round(wordsLearned.value / words.value.length * 100)
})

const experienceGained = computed(() => {
  // 计算经验值：新掌握的单词每个10点，标记为复习的每个2点
  return newKnownWordIds.value.length * 10 + newReviewedWordIds.value * 2
})

watch(unitId, () => {
  currentIndex.value = 0
  isFlipped.value = false
  isCompleted.value = false
})

onMounted(() => {
  // 音频配置选项
  const audioOptions = {
    preload: true,
    html5: true, // 使用HTML5 Audio而不是Web Audio API，解决iOS兼容性问题
    volume: 0.5,
    format: ['mp3']
  };

  // 初始化音效
  flipSound = new Howl({
    src: [flipSoundMp3],
    ...audioOptions
  });
  
  successSound = new Howl({
    src: [successSoundMp3],
    ...audioOptions
  });
  
  // 检测是否为iOS设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
})
</script>

<template>
  <div class="word-explorer" v-if="unit && words.length">
    <div class="unit-header">
      <button class="back-button" @click="router.push('/star-map')">
        返回星系
      </button>
      <h1>{{ unit.name }}</h1>
      <div class="unit-progress">
        <div class="progress-text">
          单词 {{ currentIndex + 1 }} / {{ words.length }}
          <span class="known-words">(已掌握 {{ wordsLearned }} 个单词 - {{ knownPercent }}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </div>
    
    <template v-if="!isCompleted">
      <div class="card-container">
        <WordCard 
          :word="currentWord"
          :isFlipped="isFlipped"
          :isSpeaking="isSpeaking"
          @flip="flipCard"
          @speak="speakWord"
        />
        
        <div class="card-actions">
          <button class="action-button prev" @click="prevWord" :disabled="currentIndex === 0">
            上一个
          </button>
          
          <div class="learning-actions">
            <button class="learning-button review" @click="markForReview">
              需要练习
            </button>
            <button class="learning-button known" @click="markAsKnown">
              我已掌握！
            </button>
          </div>
          
          <button class="action-button next" @click="nextWord" :disabled="currentIndex === words.length - 1">
            下一个
          </button>
        </div>
      </div>
      
      <div class="word-navigation">
        <h3>导航面板</h3>
        <div class="word-list-container">
          <div class="word-list">
            <button 
                v-for="(word, index) in words" 
              :key="word.id"
              class="word-nav-item"
              :class="{
                'active': index === currentIndex,
                'known': getWordStatus(word.id) === 'known',
                'review': getWordStatus(word.id) === 'review',
                'unseen': getWordStatus(word.id) === 'unseen'
              }"
              @click="jumpToWord(index)"
            >
              {{ index + 1 }}
            </button>
          
            <button class="finish-all-button" @click="completeStudy">
              完成
            </button>
          </div>
        </div>
      </div>
      
      <div class="learning-tips">
        <h3>太空探险家学习技巧</h3>
        <ul>
          <li>点击扬声器图标听发音</li>
          <li>在翻转卡片之前尝试用这个单词造句</li>
          <li>将单词与图像或动作联系起来以便更好地记忆</li>
          <li>只有当你确信掌握时才标记为"已知"</li>
          <li>标记为复习的单词将出现在你的练习任务中！</li>
        </ul>
      </div>
    </template>
    
    <template v-else>
      <div class="study-completed">
        <h2>学习完成！</h2>
        <div class="study-stats">
          <div class="stats-item">
            <div class="stats-value">{{ newKnownWordIds.length }}</div>
            <div class="stats-label">已学习单词</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ knownPercent }}%</div>
            <div class="stats-label">完成度</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">+{{ experienceGained }}</div>
            <div class="stats-label">获得经验</div>
          </div>
        </div>
        
        <div class="completion-buttons">
          <button class="primary-button" @click="goToMissionCenter">
            前往任务中心
          </button>
          <button class="secondary-button" @click="restartLearning">
            继续学习
          </button>
        </div>
      </div>
    </template>
  </div>
  
  <div class="word-explorer-empty" v-else>
    <h2>抱歉！这个区域似乎是空的。</h2>
    <p>未找到此单元的词汇数据。</p>
    <button class="primary" @click="router.push('/star-map')">
      返回星系地图
    </button>
  </div>
</template>

<style scoped>
.word-explorer {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 60px auto;
}

.unit-header {
  text-align: center;
  position: relative;
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

.unit-progress {
  max-width: 500px;
  margin: 1rem auto;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.known-words {
  color: var(--color-star-teal);
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

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin: 0 auto;
  max-width: 600px;
  width: 100%;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}

.action-button {
  background-color: var(--color-space-light);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 0 12px rgba(88, 166, 255, 0.15);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.learning-actions {
  display: flex;
  gap: 1rem;
}

.learning-button {
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.learning-button.review {
  background-color: rgba(249, 117, 131, 0.2);
  color: var(--color-star-orange);
  border: 1px solid rgba(249, 117, 131, 0.3);
}

.learning-button.review:hover {
  background-color: rgba(249, 117, 131, 0.3);
  transform: translateY(-2px);
}

.learning-button.known {
  background-color: rgba(57, 211, 83, 0.2);
  color: var(--color-star-teal);
  border: 1px solid rgba(57, 211, 83, 0.3);
}

.learning-button.known:hover {
  background-color: rgba(57, 211, 83, 0.3);
  transform: translateY(-2px);
}

.word-navigation {
  background-color: var(--color-space-medium);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.word-navigation h3 {
  margin-bottom: 1rem;
  text-align: center;
}

.word-list-container {
  /* margin: 0 auto; */
  text-align: center;
}

.word-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  position: relative;
}

.word-nav-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-space-light);
  color: var(--color-text-secondary);
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.word-nav-item:hover {
  transform: scale(1.1);
}

.word-nav-item.active {
  background-color: var(--color-star-blue);
  color: white;
  box-shadow: 0 0 10px rgba(88, 166, 255, 0.5);
}

.word-nav-item.known {
  background-color: var(--color-star-teal);
  color: white;
}

.word-nav-item.review {
  background-color: var(--color-star-orange);
  color: white;
}

.finish-all-button {
  /* background: var(--button-primary-bg); */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
  /* box-shadow: var(--button-primary-shadow); */

  position: absolute;
  left: 105%;

  /* 由于超出word-list宽度后文字变成竖着的了，所以使用最小宽度或禁止换行来保持水平 */
  /* min-width: 64px; */
  /* 防止文本换行 */
  white-space: nowrap; 
}

.finish-all-button:hover {
  background: var(--button-primary-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--button-primary-shadow-hover);
}

.learning-tips {
  background-color: rgba(88, 166, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid var(--color-star-blue);
}

.learning-tips h3 {
  margin-bottom: 1rem;
  color: var(--color-star-blue);
}

.learning-tips ul {
  padding-left: 1.5rem;
}

.learning-tips li {
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.study-completed {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-space-medium);
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid rgba(88, 166, 255, 0.3);
  box-shadow: 0 0 30px rgba(88, 166, 255, 0.2);
  max-width: 600px;
  margin: 0 auto;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.study-completed h2 {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.study-stats {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
  width: 100%;
}

.stats-item {
  text-align: center;
  flex: 1;
  max-width: 120px;
}

.stats-value {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, var(--color-star-blue), var(--color-star-purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stats-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.completion-buttons {
  display: flex;
  gap: 1rem;
}

.primary-button {
  background: var(--button-primary-bg);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--button-primary-shadow);
}

.primary-button:hover {
  background: var(--button-primary-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--button-primary-shadow-hover);
}

.secondary-button {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid rgba(88, 166, 255, 0.3);
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background: rgba(88, 166, 255, 0.1);
  transform: translateY(-2px);
}

.word-explorer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .card-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .learning-actions {
    width: 100%;
    order: -1;
  }
  
  .action-button {
    width: 100%;
  }
  
  .learning-button {
    flex: 1;
  }
  
  .study-stats {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  
  .stats-item {
    max-width: none;
  }
  
  .completion-buttons {
    flex-direction: column;
    width: 100%;
  }
}
</style>