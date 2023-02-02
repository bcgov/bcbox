import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store';
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
      path: '/detail/objects/:objId',
      name: RouteNames.ObjectFileDetails,
      component: () => import('../views/ObjectFileDetailsView.vue'),
      meta: { requiresAuth: true },
      props: true
    },
    // {
    //   path: '/create',
    //   children: [
    //     {
    //       path: 'bucket',
    //       name: RouteNames.CreateBucket,
    //       component: () => import('../views/CreateBucketView.vue'),
    //       meta: { requiresAuth: true },
    //     },
    //   ],
    // },
    // {
    //   path: '/detail',
    //   children: [{}],
    // },
    {
      path: '/developer',
      name: RouteNames.Developer,
      component: () => import('../views/DeveloperView.vue'),
      meta: { requiresAuth: true, breadcrumb: 'Developer' },
    },
    {
      path: '/list',
      children: [
        {
          path: 'buckets',
          name: RouteNames.ListBuckets,
          component: () => import('../views/ListBucketsView.vue'),
          meta: { requiresAuth: true, breadcrumb: 'Buckets' },
        },
        {
          path: 'objects',
          name: RouteNames.ListObjects,
          component: () => import('../views/ListObjectsView.vue'),
          meta: { requiresAuth: true, breadcrumb: '__listObjectsDynamic' },
        },
        {
          path: 'detail/object',
          name: RouteNames.ObjectFileDetails,
          component: () => import('../views/ObjectFileDetailsView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/logout',
      name: RouteNames.Logout,
      redirect: () => {
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

router.beforeEach((to) => {
  // Removed for now
  // const navStore = useNavStore();
  // navStore.navigate(to);

  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();

    const unsubscribe = authStore.$onAction(({ name, after, onError }) => {
      if (name === 'init') {
        after(() => {
          // console.log('auth guard - keycloak is ready.');
          if (!authStore.getKeycloak.authenticated) {
            authStore.login();
            unsubscribe();
          }
        });
        onError((err) => {
          console.error(`Error in route gaurd waiting for Keycloak ${err}`); // eslint-disable-line no-console
          unsubscribe();
          throw new Error(`Failed to initialize Kecloak: ${(err as Error).message}`);
        });
      }
    });
  }
});

export default router;
