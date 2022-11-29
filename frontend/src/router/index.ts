import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { RouteNames } from '@/utils/constants';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: RouteNames.Home,
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/create',
      children: [
        {
          path: 'bucket',
          name: RouteNames.CreateBucket,
          component: () => import('../views/CreateBucketView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    // {
    //   path: '/detail',
    //   children: [{}],
    // },
    {
      path: '/developer',
      name: RouteNames.Developer,
      component: () => import('../views/DeveloperView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/list',
      children: [
        {
          path: 'buckets',
          name: RouteNames.ListBuckets,
          component: () => import('../views/ListBucketsView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'objects',
          name: RouteNames.ListObjects,
          component: () => import('../views/ListObjectsView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/logout',
      name: RouteNames.Logout,
      redirect: (to) => {
        return { path: '/' };
      },
    },
    // {
    //   path: '/permission',
    //   children: [{}],
    // },
    // {
    //   path: '/update',
    //   children: [{}],
    // },
  ],
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();

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
