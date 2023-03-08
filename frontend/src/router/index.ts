import { createRouter, createWebHistory } from 'vue-router';

import { AuthService } from '@/services';
import { useAppStore } from '@/store';
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
    component: () => import('../views/HomeView.vue')
  },
  // TODO: Determine if we want modals to have disrete vue-router paths on presentation
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
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'objects',
        name: RouteNames.DETAIL_OBJECTS,
        component: () => import('@/views/detail/DetailObjectsView.vue'),
        meta: { requiresAuth: true },
        props: createProps
      }
    ]
  },
  {
    path: '/developer',
    name: RouteNames.DEVELOPER,
    component: () => import('@/views/DeveloperView.vue'),
    meta: { requiresAuth: true, breadcrumb: 'Developer' }
  },
  {
    path: '/list',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'buckets',
        name: RouteNames.LIST_BUCKETS,
        component: () => import('@/views/list/ListBucketsView.vue'),
        meta: { requiresAuth: true, breadcrumb: 'Buckets' },
        props: createProps
      },
      {
        path: 'objects',
        name: RouteNames.LIST_OBJECTS,
        component: () => import('@/views/list/ListObjectsView.vue'),
        meta: { requiresAuth: true, breadcrumb: '__listObjectsDynamic' },
        props: createProps
      }
    ]
  },
  {
    path: '/oidc',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'callback',
        name: RouteNames.CALLBACK,
        component: () => import('@/views/oidc/OidcCallbackView.vue'),
      },
      {
        path: 'login',
        name: RouteNames.LOGIN,
        component: () => import('@/views/oidc/OidcLoginView.vue'),
        beforeEnter: () => {
          const entrypoint = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          window.sessionStorage.setItem(StorageKey.AUTH, entrypoint);
        }
      },
      {
        path: 'logout',
        name: RouteNames.LOGOUT,
        component: () => import('@/views/oidc/OidcLogoutView.vue')
      },
    ]
  },
  // TODO: Determine if we want modals to have disrete vue-router paths on presentation
  // {
  //   path: '/permission',
  //   children: [{}],
  // },
  // {
  //   path: '/update',
  //   children: [{}],
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  }
];

export default function getRouter() {
  const appStore = useAppStore();
  // const navStore = useNavStore(); // Removed for now
  const authService = new AuthService();
  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  router.beforeEach(async (to, _from, next) => {
    appStore.beginDeterminateLoading();
    // navStore.navigate(to); // Removed for now

    // Backend Redirection Handler
    if (to.query?.r) {
      router.replace({
        path: (to.query.r) ? to.query.r.toString() : to.path,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        query: (({ r, ...q }) => q)(to.query)
      });
    }

    // Authentication Guard
    if (to.meta.requiresAuth) {
      const user = await authService.getUser();
      if (!user || user.expired) {
        router.replace({ name: RouteNames.LOGIN });
      }
    }

    next();
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}
