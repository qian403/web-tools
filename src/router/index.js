import { createRouter, createWebHistory } from 'vue-router'
import HomeComponent from '../components/home.vue'


import DigitalClock from '@/views/DigitalClock.vue'
import PasswordGenerator from '@/views/password-generator.vue'
import TextRevealer from '@/views/TextRevealer.vue'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeComponent
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
  }
    
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router