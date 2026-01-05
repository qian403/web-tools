<!-- Clock.vue -->
<template>
  <div class="page-container">
    <BackToHome />
    <main class="clock-container" role="main" aria-label="數位時鐘">
      <h1 class="sr-only">數位時鐘</h1>
      <p class="tool-description">全螢幕數位時鐘，即時顯示日期、星期與時間，適合簡報、會議或桌面展示使用。</p>
      <div class="datetime">
        <div class="date" aria-label="日期">{{ currentDate }}</div>
        <div class="weekday" aria-label="星期">{{ weekday }}</div>
        <time class="time" aria-live="polite" aria-label="目前時間">{{ time }}</time>
      </div>
    </main>
  </div>
</template>

<script>
import BackToHome from '@/components/BackToHome.vue'

export default {
  name: 'DigitalClock',
  components: {
    BackToHome
  },
  data() {
    return {
      time: '',
      currentDate: '',
      weekday: ''
    }
  },
  mounted() {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.time = now.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      this.currentDate = now.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/')
      this.weekday = '星期' + '日一二三四五六'.charAt(now.getDay())
    }
  }
}
</script>

<style scoped>
.page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #2d3748;
}

.clock-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.time {
  font-size: min(20vw, 30vh);
  font-weight: bold;
  line-height: 1;
}

.date,
.weekday {
  font-size: min(5vw, 4vh);
  margin-bottom: min(3vw, 2vh);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.tool-description {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  color: #a0aec0;
  font-size: 0.9rem;
  text-align: center;
  max-width: 90%;
  line-height: 1.5;
}
</style>