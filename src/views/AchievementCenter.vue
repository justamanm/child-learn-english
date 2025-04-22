<script setup lang="js">
import { ref, onMounted } from 'vue'
import { useUserProgressStore } from '../stores/userProgress'

const progressStore = useUserProgressStore()

const achievements = [
  {
    id: 'first-words',
    name: '初次接触',
    description: '学习你的前10个英语单词',
    icon: '🌟',
    requiredProgress: 10,
    type: 'words_learned',
    reward: 50
  },
  {
    id: 'vocabulary-explorer',
    name: '词汇探险家',
    description: '学习50个英语单词',
    icon: '🔭',
    requiredProgress: 50,
    type: 'words_learned',
    reward: 200
  },
  {
    id: 'word-master',
    name: '单词大师',
    description: '学习100个英语单词',
    icon: '📚',
    requiredProgress: 100,
    type: 'words_learned',
    reward: 500
  },
  {
    id: 'first-mission',
    name: '任务新手',
    description: '完成你的第一个词汇任务',
    icon: '🚀',
    requiredProgress: 1,
    type: 'missions_completed',
    reward: 50
  },
  {
    id: 'mission-specialist',
    name: '任务专家',
    description: '完成10个词汇任务',
    icon: '🏆',
    requiredProgress: 10,
    type: 'missions_completed',
    reward: 300
  },
  {
    id: 'consistent-learner',
    name: '持续学习者',
    description: '连续学习5天',
    icon: '📅',
    requiredProgress: 5,
    type: 'login_streak',
    reward: 150
  }
]

function getAchievementStatus(achievement) {
  const progress = progressStore.getAchievementProgress(achievement.type)
  const isCompleted = progress >= achievement.requiredProgress
  
  return {
    progress,
    isCompleted
  }
}

function getProgressPercent(achievement) {
  const { progress } = getAchievementStatus(achievement)
  return Math.min(100, Math.round((progress / achievement.requiredProgress) * 100))
}

// 模拟登录连续天数
const loginStreak = ref(3)

onMounted(() => {
  // 为演示目的，模拟一些进度
  if (progressStore.wordsLearned === 0) {
    progressStore.addWordsLearned(15)
    progressStore.addMissionsCompleted(2)
  }
})
</script>

<template>
  <div class="achievement-center">
    <div class="achievement-header">
      <h1>成就中心</h1>
      <p>追踪你的进度，在掌握英语词汇的过程中获得奖励！</p>
    </div>
    
    <div class="user-stats">
      <div class="user-level">
        <div class="level-circle">
          <span class="level-number">{{ progressStore.userLevel }}</span>
        </div>
        <div class="level-text">探险等级</div>
      </div>
      
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-icon">📚</div>
          <div class="stat-value">{{ progressStore.wordsLearned }}</div>
          <div class="stat-label">已学单词</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">🚀</div>
          <div class="stat-value">{{ progressStore.missionsCompleted }}</div>
          <div class="stat-label">完成任务</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">📅</div>
          <div class="stat-value">{{ loginStreak }}</div>
          <div class="stat-label">连续天数</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">✨</div>
          <div class="stat-value">{{ progressStore.totalExperience }}</div>
          <div class="stat-label">总经验值</div>
        </div>
      </div>
    </div>
    
    <div class="achievements-container">
      <h2>成就</h2>
      <div class="achievements-list">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ 'completed': getAchievementStatus(achievement).isCompleted }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-content">
            <h3 class="achievement-name">{{ achievement.name }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            
            <div class="achievement-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${getProgressPercent(achievement)}%` }"
                ></div>
              </div>
              <div class="progress-text">
                {{ getAchievementStatus(achievement).progress }} / {{ achievement.requiredProgress }}
              </div>
            </div>
          </div>
          <div class="achievement-reward">
            <div class="reward-value">+{{ achievement.reward }}</div>
            <div class="reward-label">经验值</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="achievements-coming-soon">
      <h3>更多成就即将推出！</h3>
      <p>继续你的旅程，解锁新的成就和奖励。</p>
    </div>
  </div>
</template>

<style scoped>
.achievement-center {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 60px auto;
}

.achievement-header {
  text-align: center;
  margin-bottom: 1rem;
}

.achievement-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.achievement-header p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  background-color: var(--color-space-medium);
  border-radius: 16px;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.user-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 2rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.level-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--color-star-blue), var(--color-star-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 0 20px rgba(88, 166, 255, 0.3);
}

.level-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.level-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  flex: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.achievements-container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.achievements-container h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background-color: var(--color-space-medium);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.achievement-card.completed {
  border-color: rgba(57, 211, 83, 0.3);
  background-color: rgba(57, 211, 83, 0.05);
}

.achievement-icon {
  font-size: 2.5rem;
  align-self: center;
}

.achievement-content {
  flex: 1;
}

.achievement-name {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.achievement-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.achievement-progress {
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-star-blue), var(--color-star-purple));
  transition: width 0.3s ease;
}

.achievement-card.completed .progress-fill {
  background: linear-gradient(90deg, var(--color-star-teal), #39d353);
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: right;
}

.achievement-reward {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.reward-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-star-yellow);
}

.reward-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.achievements-coming-soon {
  text-align: center;
  padding: 2rem;
  background-color: rgba(88, 166, 255, 0.05);
  border-radius: 12px;
  margin-top: 1rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.achievements-coming-soon h3 {
  color: var(--color-star-blue);
  margin-bottom: 0.5rem;
}

.achievements-coming-soon p {
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .user-stats {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .user-level {
    padding-right: 0;
    border-right: none;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stats-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .achievements-list {
    grid-template-columns: 1fr;
  }
}
</style>