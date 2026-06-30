import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'cases', name: 'Cases', component: () => import('@/views/cases/Index.vue') },
      { path: 'cases/new', name: 'CaseNew', component: () => import('@/views/cases/Form.vue') },
      { path: 'cases/:id', name: 'CaseEdit', component: () => import('@/views/cases/Form.vue') },
      { path: 'articles', name: 'Articles', component: () => import('@/views/articles/Index.vue') },
      { path: 'articles/new', name: 'ArticleNew', component: () => import('@/views/articles/Form.vue') },
      { path: 'articles/:id', name: 'ArticleEdit', component: () => import('@/views/articles/Form.vue') },
      { path: 'images', name: 'Images', component: () => import('@/views/images/Index.vue') },
      { path: 'orders', name: 'Orders', component: () => import('@/views/orders/Index.vue') },
      { path: 'clients', name: 'Clients', component: () => import('@/views/clients/Index.vue') },
      { path: 'hotels', name: 'Hotels', component: () => import('@/views/hotels/Index.vue') },
      { path: 'props', name: 'Props', component: () => import('@/views/props/Index.vue') },
      { path: 'contracts', name: 'Contracts', component: () => import('@/views/contracts/Index.vue') },
    ]
  }
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) next('/login')
  else next()
})

export default router
