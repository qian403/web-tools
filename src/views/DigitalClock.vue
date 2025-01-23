<!-- Clock.vue -->
<template>
  <div class="page-container">
    <div class="back-button" @click="goBack">回到首頁</div>
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
export default {
  name: 'DigitalClock',
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
    },
    goBack() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background-color: #4299e1;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #3182ce;
}

.page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #2d3748;
}

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

.back-button {
  position: fixed;
  top: min(20px, 3vh);
  left: min(20px, 3vw);
  padding: min(10px, 1.5vh) min(20px, 3vw);
  font-size: min(16px, 2.5vh);
}
</style>