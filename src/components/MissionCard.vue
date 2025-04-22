<script setup lang="js">
const props = defineProps({
  mission: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select'])

function handleSelect() {
  emit('select')
}

function getDifficultyStars() {
  return '⭐'.repeat(props.mission.difficulty)
}
</script>

<template>
  <div class="mission-card" @click="handleSelect">
    <div class="mission-card__content">
      <div class="mission-card__header">
        <div class="mission-card__icon">{{ mission.icon }}</div>
        <div class="mission-card__difficulty">
          <span class="mission-card__difficulty-stars">{{ getDifficultyStars() }}</span>
        </div>
      </div>
      <h3 class="mission-card__title">{{ mission.name }}</h3>
      <p class="mission-card__description">{{ mission.description }}</p>
    </div>
    <button class="mission-card__button">开始任务</button>
    <div class="mission-card__glow"></div>
  </div>
</template>

<style scoped>
.mission-card {
  background-color: rgba(22, 27, 34, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  height: 100%;
}

.mission-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mission-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mission-card__icon {
  font-size: 2.5rem;
}

.mission-card__title {
  font-size: 1.4rem;
  margin: 0;
}

.mission-card__description {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin: 0;
  flex: 1;
}

.mission-card__difficulty {
  font-size: 0.9rem;
}

.mission-card__button {
  background: linear-gradient(45deg, var(--color-star-blue), var(--color-star-purple));
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.mission-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(88, 166, 255, 0.3);
}

.mission-card:hover .mission-card__button {
  box-shadow: 0 0 15px rgba(88, 166, 255, 0.5);
  transform: translateY(-2px);
}

.mission-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(88, 166, 255, 0.3);
}

.mission-card:hover .mission-card__glow {
  opacity: 0.8;
}
</style>