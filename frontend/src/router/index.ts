import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/myObjects/:bucketId',
      name: 'myObjects',
      component: () => import('../views/MyObjectsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/addBucket',
      name: 'addBucket',
      component: () => import('../views/AddBucketView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/developer',
      name: 'developer',
      component: () => import('../views/DeveloperView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/logout',
      name: 'logout',
      redirect: (to) => {
        return { path: '/' };
      },
    },
  ],
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  console.log(authStore.getAuthenticated);
  if (!authStore.getAuthenticated) {
    if (to.meta.requiresAuth) {
      return {
        path: '/',
        // save the location we were at to come back later
        query: { redirect: to.fullPath },
      };
    }
  }
});

export default router;
