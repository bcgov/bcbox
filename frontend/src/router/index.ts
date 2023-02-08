import { createRouter, createWebHistory } from 'vue-router';

import { AuthService } from '@/services';
import { RouteNames } from '@/utils/constants';

import type { RouteRecordRaw } from 'vue-router';

let isFirstTransition = true;

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: RouteNames.Home,
    component: () => import('../views/HomeView.vue'),
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
  {
    path: '/detail',
    children: [
      {
        path: 'objects',
        name: RouteNames.ObjectFileDetails,
        component: () => import('../views/ObjectFileDetailsView.vue'),
        meta: { requiresAuth: true },
      }
    ]
  },
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
  { // TODO: This path may not be needed at all
    path: '/logout',
    name: RouteNames.Logout,
    redirect: { name: RouteNames.Home }
  },
  // {
  //   path: '/permission',
  //   children: [{}],
  // },
  // {
  //   path: '/update',
  //   children: [{}],
  // },
];

export default function getRouter() {
  const authService = new AuthService();
  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  router.beforeEach(async (to, _from, next) => {
    // Removed for now
    // const navStore = useNavStore();
    // navStore.navigate(to);

    if (to.query && isFirstTransition) {
      // Login Callback Handler
      if (['code', 'state', 'session_state'].every(attr => Object.keys(to.query).includes(attr))) {
        await authService.loginCallback();
      }

      // Backend Redirection Artifact
      if (['code', 'r', 'state', 'session_state'].some(attr => Object.keys(to.query).includes(attr))) {
        router.replace({
          path: (to.query.r) ? to.query.r.toString() : to.path,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
          query: (({ code, r, state, session_state, ...q }) => q)(to.query)
        });
      }
    }

    if (to.meta.requiresAuth) {
      const user = authService.getUser();
      if (!user) await authService.login();
    }

    next();
  });

  router.afterEach(() => {
    isFirstTransition = false;
  });

  return router;
}

