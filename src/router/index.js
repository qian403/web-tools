import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

import DigitalClock from '@/views/DigitalClock.vue'
import PasswordGenerator from '@/views/password-generator.vue'
import TextRevealer from '@/views/TextRevealer.vue'
import DiceGame from '@/views/DiceGame.vue'
import BaseConverter from '@/views/BaseConverter.vue'
import SystemInfo from '@/views/SystemInfo.vue'
import QrCodeGenerator from '@/views/QrCodeGenerator.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router