import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { routesMeta } from '@/config/routes'

NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  speed: 300
})

// 路由懶加載
const Home = () => import('@/views/Home.vue')
const DigitalClock = () => import('@/views/DigitalClock.vue')
const PasswordGenerator = () => import('@/views/password-generator.vue')
const TextRevealer = () => import('@/views/TextRevealer.vue')
const DiceGame = () => import('@/views/DiceGame.vue')
const BaseConverter = () => import('@/views/BaseConverter.vue')
const SystemInfo = () => import('@/views/SystemInfo.vue')
const QrCodeGenerator = () => import('@/views/QrCodeGenerator.vue')
const ChineseConverter = () => import('@/views/ChineseConverter.vue')
const WordCounter = () => import('@/views/WordCounter.vue')

const componentMap = {
  Home,
  Clock: DigitalClock,
  passwordGenerator: PasswordGenerator,
  TextRevealer,
  DiceGame,
  BaseConverter,
  SystemInfo,
  QrCodeGenerator,
  ChineseConverter,
  WordCounter
}

// 從設定檔產生路由
const routes = routesMeta.map(route => ({
  path: route.path,
  name: route.name,
  component: componentMap[route.name],
  meta: {
    title: route.title,
    description: route.description,
    keywords: route.keywords
  }
}))

// 404 頁面
routes.push({
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/NotFound.vue'),
  meta: {
    title: '404 找不到頁面 | Web Tools',
    description: '您要找的頁面不存在。',
    keywords: ''
  }
})

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

router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach((to) => {
  NProgress.done()
  
  const { title, description, keywords } = to.meta
  
  document.title = title || '線上工具箱 | Web Tools'
  
  const updateMeta = (selector, attr, value) => {
    const el = document.querySelector(selector)
    if (el) el.setAttribute(attr, value || '')
  }
  
  updateMeta('meta[name="description"]', 'content', description)
  updateMeta('meta[name="keywords"]', 'content', keywords)
  updateMeta('meta[property="og:title"]', 'content', title)
  updateMeta('meta[property="og:description"]', 'content', description)
  updateMeta('meta[name="twitter:title"]', 'content', title)
  updateMeta('meta[name="twitter:description"]', 'content', description)
})

export default router
