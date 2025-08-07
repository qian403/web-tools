import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

import DigitalClock from '@/views/DigitalClock.vue'
import PasswordGenerator from '@/views/password-generator.vue'
import TextRevealer from '@/views/TextRevealer.vue'
import DiceGame from '@/views/DiceGame.vue'

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
  }
    
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router