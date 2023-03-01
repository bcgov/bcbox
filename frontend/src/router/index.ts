import { createRouter, createWebHistory } from 'vue-router';

import { useAppStore, useAuthStore } from '@/store';
import { RouteNames, StorageKey } from '@/utils/constants';

import type { RouteRecordRaw } from 'vue-router';

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
        component: () => import('../views/OidcCallbackView.vue'),
      },
      {
        path: 'login',
        name: RouteNames.LOGIN,
        component: () => import('../views/OidcLoginView.vue'),
        beforeEnter: () => {
          const entrypoint = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          window.sessionStorage.setItem(StorageKey.AUTH, entrypoint);
        }
      },
      {
        path: 'logout',
        name: RouteNames.LOGOUT,
        component: () => import('../views/OidcLogoutView.vue')
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
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  router.beforeEach(async (to, _from, next) => {
    // Removed for now
    // const { navigate } = useNavStore();
    // navigate(to);
    appStore.beginDeterminateLoading();

    // Backend Redirection Handler
    if (to.query?.r) {
      router.replace({
        path: (to.query.r) ? to.query.r.toString() : to.path,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        query: (({ r, ...q }) => q)(to.query)
      });
    }

    if (to.meta.requiresAuth && !authStore.getIsAuthenticated) {
      router.replace({ name: RouteNames.LOGIN });
    }

    next();
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}

