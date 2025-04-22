<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let animationId = null

function createStars(count, canvas) {
  const stars = []
  const { width, height } = canvas
  
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.05 + 0.01
    })
  }
  
  return stars
}

function animate(canvas, stars) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function draw() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    stars.forEach(star => {
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      ctx.fill()
      
      star.y += star.speed
      
      if (star.y > canvas.height) {
        star.y = 0
        star.x = Math.random() * canvas.width
      }
    })
    
    animationId = requestAnimationFrame(() => draw())
  }
  
  draw()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const stars = createStars(200, canvas)
    animate(canvas, stars)
    
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', () => {})
})
</script>

<template>
  <canvas ref="canvasRef" class="stars-canvas"></canvas>
</template>

<style scoped>
.stars-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>