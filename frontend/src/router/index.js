import { createRouter, createWebHistory } from 'vue-router'
import TestRadioPage from '../TestRadioPage.vue'
import Home from '../components/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/test-radio',
    name: 'TestRadio',
    component: TestRadioPage
  },
  // Redirection pour les routes inconnues vers la page d'accueil
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
