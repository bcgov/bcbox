import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { RouteRecordRaw } from 'vue-router';

let isFirstTransition = true;

/**
 * @function createProps
 * Parses the route query and params to generate vue props
 * @param {object} route The route object
 * @returns {object} a Vue props object
 */
function createProps(route: { query: any; params: any; }): object {
  return { ...route.query, ...route.params };
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: RouteNames.HOME,
    component: () => import('../views/HomeView.vue'),
    props: createProps
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
        name: RouteNames.DETAILOBJECTS,
        component: () => import('../views/DetailObjectsView.vue'),
        meta: { requiresAuth: true },
        props: createProps
      }
    ]
  },
  {
    path: '/developer',
    name: RouteNames.DEVELOPER,
    component: () => import('../views/DeveloperView.vue'),
    meta: { requiresAuth: true, breadcrumb: 'Developer' },
    props: createProps
  },
  {
    path: '/list',
    children: [
      {
        path: 'buckets',
        name: RouteNames.LISTBUCKETS,
        component: () => import('../views/ListBucketsView.vue'),
        meta: { requiresAuth: true, breadcrumb: 'Buckets' }
      },
      {
        path: 'objects',
        name: RouteNames.LISTOBJECTS,
        component: () => import('../views/ListObjectsView.vue'),
        meta: { requiresAuth: true, breadcrumb: '__listObjectsDynamic' }
      },
      {
        path: 'detail/object',
        name: RouteNames.DETAILOBJECTS,
        component: () => import('../views/DetailObjectsView.vue'),
        meta: { requiresAuth: true }
      },
    ],
    props: createProps
  },
  {
    path: '/oidc',
    children: [
      {
        path: 'callback',
        name: RouteNames.CALLBACK,
        component: () => import('../views/CallbackView.vue'),
        beforeEnter: async () => {
          const authStore = useAuthStore();
          await authStore.loginCallback();
        }
      },
      {
        path: 'logout',
        name: RouteNames.LOGOUT,
        redirect: { name: RouteNames.HOME }
      },
    ]
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
  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();
    // Removed for now
    // const { navigate } = useNavStore();
    // navigate(to);

    if (!to.path.includes('/oidc') && to.query && isFirstTransition) {
      // Backend Redirection Artifact
      if (to.query?.r) {
        router.replace({
          path: (to.query.r) ? to.query.r.toString() : to.path,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
          query: (({ r, ...q }) => q)(to.query)
        });
      }
    }

    if (to.meta.requiresAuth && !authStore.getIsAuthenticated) {
      await authStore.login();
    }

    next();
  });

  router.afterEach(() => {
    isFirstTransition = false;
  });

  return router;
}

