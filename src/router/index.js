import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

import DigitalClock from '@/views/DigitalClock.vue'
import PasswordGenerator from '@/views/password-generator.vue'
import TextRevealer from '@/views/TextRevealer.vue'
import DiceGame from '@/views/DiceGame.vue'
import BaseConverter from '@/views/BaseConverter.vue'
import SystemInfo from '@/views/SystemInfo.vue'
import QrCodeGenerator from '@/views/QrCodeGenerator.vue'
import ChineseConverter from '@/views/ChineseConverter.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/clock',
    name: 'Clock',
    component: DigitalClock
  },
  {
    path: '/password-generator',
    name: 'passwordGenerator',
    component: PasswordGenerator
  },
  {
    path: '/text-revealer',
    name: 'TextRevealer',
    component: TextRevealer
  },
  {
    path: '/dice-game',
    name: 'DiceGame',
    component: DiceGame
  },
  {
    path: '/base-converter',
    name: 'BaseConverter',
    component: BaseConverter
  },
  {
    path: '/system-info',
    name: 'SystemInfo',
    component: SystemInfo
  },
  {
    path: '/qr-code',
    name: 'QrCodeGenerator',
    component: QrCodeGenerator
  },
  {
    path: '/chinese-converter',
    name: 'ChineseConverter',
    component: ChineseConverter
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 動態更新頁面標題
const titleMap = {
  Home: '線上工具箱 | Web Tools',
  Clock: '數位時鐘 | Web Tools',
  passwordGenerator: '密碼產生器 | Web Tools',
  TextRevealer: '文字顯示器 | Web Tools',
  DiceGame: '骰子遊戲 | Web Tools',
  BaseConverter: '進位轉換器 | Web Tools',
  SystemInfo: '系統資訊 | Web Tools',
  QrCodeGenerator: 'QR Code 產生器 | Web Tools',
  ChineseConverter: '繁簡轉換 | Web Tools'
}

router.afterEach((to) => {
  document.title = titleMap[to.name] || '線上工具箱 | Web Tools'
})

export default router