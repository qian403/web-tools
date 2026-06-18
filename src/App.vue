<template>
  <a href="#main-content" class="skip-link">跳到主要內容</a>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
  <footer class="site-footer">
    <a href="https://github.com/qian403/web-tools" target="_blank" rel="noopener noreferrer">
      qian403/web-tools
    </a>
    <span>© 2026 Web Tools</span>
  </footer>
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
  display: flex;
  flex-direction: column;
}

/* ponytail: 各頁根容器自帶 min-height:100vh，會把 footer 擠出視窗。
   讓路由內容改用 flex 撐滿、清掉它的 100vh，footer 才會貼在內容底部 */
#app > :not(.site-footer) {
  flex: 1 0 auto;
  min-height: 0;
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

/* Footer */
.site-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px 16px;
  padding: 20px 16px;
  color: #a0aec0;
  font-size: 14px;
}

.site-footer a {
  color: #4299e1;
  text-decoration: none;
}

.site-footer a:hover {
  text-decoration: underline;
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