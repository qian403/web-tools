import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 設定 NProgress
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  speed: 300
})

// 路由懶加載 - 只在需要時才載入元件
const Home = () => import('@/views/Home.vue')
const DigitalClock = () => import('@/views/DigitalClock.vue')
const PasswordGenerator = () => import('@/views/password-generator.vue')
const TextRevealer = () => import('@/views/TextRevealer.vue')
const DiceGame = () => import('@/views/DiceGame.vue')
const BaseConverter = () => import('@/views/BaseConverter.vue')
const SystemInfo = () => import('@/views/SystemInfo.vue')
const QrCodeGenerator = () => import('@/views/QrCodeGenerator.vue')
const ChineseConverter = () => import('@/views/ChineseConverter.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '線上工具箱 | Web Tools',
      description: '免費線上工具箱，提供 QR Code 產生器、密碼產生器、進位轉換、繁簡轉換等實用小工具。'
    }
  },
  {
    path: '/clock',
    name: 'Clock',
    component: DigitalClock,
    meta: {
      title: '數位時鐘 | Web Tools',
      description: '簡潔的線上數位時鐘，即時顯示目前時間。'
    }
  },
  {
    path: '/password-generator',
    name: 'passwordGenerator',
    component: PasswordGenerator,
    meta: {
      title: '密碼產生器 | Web Tools',
      description: '免費線上密碼產生器，可自訂長度、大小寫、數字及特殊符號，產生安全隨機密碼。'
    }
  },
  {
    path: '/text-revealer',
    name: 'TextRevealer',
    component: TextRevealer,
    meta: {
      title: '文字顯示器 | Web Tools',
      description: '文字逐字顯示效果工具，可用於簡報或展示。'
    }
  },
  {
    path: '/dice-game',
    name: 'DiceGame',
    component: DiceGame,
    meta: {
      title: '骰子遊戲 | Web Tools',
      description: '線上擲骰子遊戲，模擬真實骰子隨機結果。'
    }
  },
  {
    path: '/base-converter',
    name: 'BaseConverter',
    component: BaseConverter,
    meta: {
      title: '進位轉換器 | Web Tools',
      description: '免費線上進位轉換工具，支援二進位、八進位、十進位、十六進位互轉。'
    }
  },
  {
    path: '/system-info',
    name: 'SystemInfo',
    component: SystemInfo,
    meta: {
      title: '系統資訊 | Web Tools',
      description: '查看您的瀏覽器、作業系統及裝置相關資訊。'
    }
  },
  {
    path: '/qr-code',
    name: 'QrCodeGenerator',
    component: QrCodeGenerator,
    meta: {
      title: 'QR Code 產生器 | Web Tools',
      description: '免費線上 QR Code 產生器，可自訂顏色、尺寸，支援下載 PNG 及 SVG 格式。'
    }
  },
  {
    path: '/chinese-converter',
    name: 'ChineseConverter',
    component: ChineseConverter,
    meta: {
      title: '繁簡轉換 | Web Tools',
      description: '免費線上繁體簡體中文轉換工具，支援台灣繁體與中國簡體互轉。'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404 找不到頁面 | Web Tools',
      description: '您要找的頁面不存在。'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// 路由開始時顯示進度條
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

// 動態更新頁面標題和描述
router.afterEach((to) => {
  NProgress.done()
  
  const { title, description } = to.meta
  
  document.title = title || '線上工具箱 | Web Tools'
  
  let descTag = document.querySelector('meta[name="description"]')
  if (descTag) {
    descTag.setAttribute('content', description || '')
  }
  
  // Open Graph
  let ogTitle = document.querySelector('meta[property="og:title"]')
  let ogDesc = document.querySelector('meta[property="og:description"]')
  if (ogTitle) ogTitle.setAttribute('content', title || '')
  if (ogDesc) ogDesc.setAttribute('content', description || '')
  
  // Twitter
  let twTitle = document.querySelector('meta[name="twitter:title"]')
  let twDesc = document.querySelector('meta[name="twitter:description"]')
  if (twTitle) twTitle.setAttribute('content', title || '')
  if (twDesc) twDesc.setAttribute('content', description || '')
})

export default router