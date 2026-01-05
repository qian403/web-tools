<template>
  <a href="#main-content" class="skip-link">跳到主要內容</a>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      cachedViews: ['HomePage', 'DigitalClock', 'BaseConverter']
    }
  }
}
</script>

<style>
#app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #2d3748;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: #2d3748;
}

/* Skip Link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  background: #4299e1;
  color: white;
  padding: 12px 24px;
  border-radius: 0 0 8px 8px;
  text-decoration: none;
  font-weight: bold;
  z-index: 9999;
  transition: top 0.3s ease;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* 頁面切換動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑動動畫 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease-out;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>