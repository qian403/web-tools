import { createRouter, createWebHistory } from 'vue-router'
import HomeComponent from '../components/home.vue'
import DigitalClock from '@/views/DigitalClock.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router