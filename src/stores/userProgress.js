import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserProgressStore = defineStore('userProgress', () => {
  const username = ref('探险家')
  const experience = ref(0)
  const totalExperience = ref(0) // 总经验值（包括已用于升级的）
  
  const userLevel = computed(() => {
    return Math.floor(experience.value / 100) + 1
  })
  
  const levelProgress = computed(() => {
    return (experience.value % 100)
  })
  
  const wordStatus = ref({})
  const unitProgress = ref({})
  const wordsLearned = ref(0)
  const missionsCompleted = ref(0)
  const loginStatus = ref(false)
  const loginStreak = ref(1)
  const lastLoginDate = ref(null)
  const defaultUsername = '你好！'

  function setUserName(name) {
    username.value = name
    saveProgress()
  }

  function markWordAsSeen(unitId, wordId) {
    if (!wordStatus.value[unitId]) {
      wordStatus.value[unitId] = {}
    }
    
    if (!wordStatus.value[unitId][wordId] || wordStatus.value[unitId][wordId] === 'unseen') {
      wordStatus.value[unitId][wordId] = 'seen'
      saveProgress()
    }
  }

  function markWordForReview(unitId, wordId) {
    if (!wordStatus.value[unitId]) {
      wordStatus.value[unitId] = {}
    }
    
    wordStatus.value[unitId][wordId] = 'review'
    updateWordsLearned()
    saveProgress()
  }

  function markWordAsKnown(unitId, wordId) {
    if (!wordStatus.value[unitId]) {
      wordStatus.value[unitId] = {}
    }
    
    wordStatus.value[unitId][wordId] = 'known'
    updateWordsLearned()
    
    addExperience(5)
    saveProgress()
  }

  function getWordStatus(unitId, wordId) {
    if (!wordStatus.value[unitId] || !wordStatus.value[unitId][wordId]) {
      return 'unseen'
    }
    
    return wordStatus.value[unitId][wordId]
  }

  function getUnitProgress(unitId) {
    return unitProgress.value[unitId] || 0
  }

  function updateUnitProgress(unitId, progress) {
    if (!unitProgress.value[unitId] || progress > unitProgress.value[unitId]) {
      unitProgress.value[unitId] = progress
      
      if (progress >= 100 && unitProgress.value[unitId] < 100) {
        addExperience(100)
        missionsCompleted.value++
      }
      
      saveProgress()
    }
  }

  function addExperience(amount) {
    experience.value += amount
    totalExperience.value += amount
    
    const newLevel = 1 + Math.floor(experience.value / 100)
    
    if (newLevel > userLevel.value) {
      experience.value = experience.value % 100
    }
    
    saveProgress()
  }

  function updateWordsLearned() {
    let count = 0
    
    Object.keys(wordStatus.value).forEach(unitId => {
      Object.keys(wordStatus.value[unitId]).forEach(wordId => {
        const status = wordStatus.value[unitId][wordId]
        if (status === 'known' || status === 'review') {
          count++
        }
      })
    })
    
    wordsLearned.value = count
  }

  function getReviewWords() {
    const reviewWords = []
    
    Object.keys(wordStatus.value).forEach(unitId => {
      Object.keys(wordStatus.value[unitId]).forEach(wordId => {
        if (wordStatus.value[unitId][wordId] === 'review') {
          reviewWords.push(wordId)
        }
      })
    })
    
    return reviewWords
  }

  function addWordsLearned(count) {
    wordsLearned.value += count
    saveProgress()
  }

  function addMissionsCompleted(count) {
    missionsCompleted.value += count
    saveProgress()
  }

  function getAchievementProgress(type) {
    switch (type) {
      case 'words_learned':
        return wordsLearned.value
      case 'missions_completed':
        return missionsCompleted.value
      case 'login_streak':
        return loginStreak.value
      default:
        return 0
    }
  }

  function login() {
    loginStatus.value = true
    recordLogin()
  }

  function logout() {
    console.log('logout');
    loginStatus.value = false
    username.value = defaultUsername
    experience.value = 0
    totalExperience.value = 0
    wordStatus.value = {}
    unitProgress.value = {}
    wordsLearned.value = 0
    missionsCompleted.value = 0
    loginStreak.value = 1
    lastLoginDate.value = null
    saveProgress()
  }

  function recordLogin() {
    const now = new Date()
    
    if (lastLoginDate.value) {
      const lastLogin = new Date(lastLoginDate.value)
      const timeDiff = now.getTime() - lastLogin.getTime()
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
      
      if (daysDiff === 1) {
        loginStreak.value++
      } else if (daysDiff > 1) {
        loginStreak.value = 1
      }
    }
    
    lastLoginDate.value = now
    saveProgress()
  }

  function saveProgress() {
    console.log('保存时的loginStatus', loginStatus.value);
    // ！新配置的字段，要在这里添加
    try {
      const data = {
        loginStatus: loginStatus.value,
        username: username.value,
        experience: experience.value,
        totalExperience: totalExperience.value,
        wordStatus: wordStatus.value,
        unitProgress: unitProgress.value,
        wordsLearned: wordsLearned.value,
        missionsCompleted: missionsCompleted.value,
        loginStreak: loginStreak.value,
        lastLoginDate: lastLoginDate.value
      }
      localStorage.setItem('spaceVoyagerProgress', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  function loadProgress() {
    try {
      // ！新配置的字段，要在这里添加
      const savedProgress = localStorage.getItem('spaceVoyagerProgress')
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        
        // 确保加载loginStatus
        loginStatus.value = parsed.loginStatus || false
        username.value = parsed.username || defaultUsername
        experience.value = parsed.experience || 0
        totalExperience.value = parsed.totalExperience || 0
        wordStatus.value = parsed.wordStatus || {}
        unitProgress.value = parsed.unitProgress || {}
        wordsLearned.value = parsed.wordsLearned || 0
        missionsCompleted.value = parsed.missionsCompleted || 0
        loginStreak.value = parsed.loginStreak || 1
        lastLoginDate.value = parsed.lastLoginDate ? new Date(parsed.lastLoginDate) : null
        
        console.log('加载后的loginStatus', loginStatus.value);
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  // 初始加载数据
  // loadProgress()

  return {
    username,
    experience,
    totalExperience,
    userLevel,
    levelProgress,
    wordStatus,
    unitProgress,
    wordsLearned,
    missionsCompleted,
    loginStreak,
    lastLoginDate,
    loginStatus,
    login,
    logout,
    setUserName,
    markWordAsSeen,
    markWordForReview,
    markWordAsKnown,
    getWordStatus,
    getUnitProgress,
    updateUnitProgress,
    addExperience,
    updateWordsLearned,
    getReviewWords,
    addWordsLearned,
    addMissionsCompleted,
    getAchievementProgress,
    recordLogin,
    saveProgress,
    loadProgress,
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'spaceVoyagerProgress',
        storage: localStorage,
      },
    ],
  },
})