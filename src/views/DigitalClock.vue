<!-- Clock.vue -->
<template>
  <div class="page-container">
    <BackToHome />
    <div class="clock-container">
      <div class="datetime">
        <div class="date">{{ currentDate }}</div>
        <div class="weekday">{{ weekday }}</div>
        <div class="time">{{ time }}</div>
      </div>
    </div>
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
</style>