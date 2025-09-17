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
function createProps(route: { query: any; params: any }): object {
  return { ...route.query, ...route.params };
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: RouteNames.HOME,
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/detail',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'objects',
        name: RouteNames.DETAIL_OBJECTS,
        component: () => import('@/views/detail/DetailObjectsView.vue'),
        props: createProps,
        meta: { title: 'Object Details' }
      }
    ]
  },
  {
    path: '/developer',
    name: RouteNames.DEVELOPER,
    component: () => import('@/views/DeveloperView.vue'),
    meta: { requiresAuth: true, breadcrumb: 'Developer', title: 'Developer' }
  },
  {
    path: '/list',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'buckets',
        name: RouteNames.LIST_BUCKETS,
        component: () => import('@/views/list/ListBucketsView.vue'),
        meta: { requiresAuth: true, breadcrumb: 'Buckets', title: 'My files' },
        props: createProps
      },
      {
        path: 'objects',
        name: RouteNames.LIST_OBJECTS,
        component: () => import('@/views/list/ListObjectsView.vue'),
        meta: { breadcrumb: '__listObjectsDynamic', title: 'My Objects' },
        props: createProps
      },
      {
        path: 'deleted',
        name: RouteNames.LIST_OBJECTS_DELETED,
        component: () => import('@/views/list/ListDeletedObjectsView.vue'),
        meta: { requiresAuth: true, breadcrumb: '__listDeletedObjectsDynamic', title: 'My Deleted Objects' },
        props: createProps
      },
      {
        path: 'public',
        component: () => import('@/views/GenericView.vue'),
        children: [
          {
            path: 'objects',
            name: RouteNames.LIST_OBJECTS_PUBLIC,
            component: () => import('@/views/list/ListPublicObjectsView.vue'),
            meta: { requiresAuth: false, breadcrumb: '__listPublicObjectsDynamic', title: 'My Public Objects' },
            props: createProps
          }
        ]
      }
    ]
  },
  {
    path: '/invite/:token',
    name: RouteNames.INVITE,
    component: () => import('@/views/invite/InviteView.vue'),
    meta: { requiresAuth: true, breadcrumb: 'Invite', title: 'Invite' },
    props: createProps
  },
  {
    path: '/oidc',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'callback',
        name: RouteNames.CALLBACK,
        component: () => import('@/views/oidc/OidcCallbackView.vue'),
        meta: { title: 'Authenticating...' }
      },
      {
        path: 'login',
        name: RouteNames.LOGIN,
        component: () => import('@/views/oidc/OidcLoginView.vue'),
        meta: { title: 'Logging in...' },
        beforeEnter: () => {
          const entrypoint = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          window.sessionStorage.setItem(StorageKey.AUTH, entrypoint);
        }
      },
      {
        path: 'logout',
        name: RouteNames.LOGOUT,
        component: () => import('@/views/oidc/OidcLogoutView.vue'),
        meta: { title: 'Logging out...' }
      }
    ]
  },
  {
    path: '/forbidden',
    name: RouteNames.FORBIDDEN,
    component: () => import('@/views/Forbidden.vue'),
    meta: { title: 'Forbidden' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Not Found' }
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

  router.beforeEach(async (to) => {
    appStore.beginDeterminateLoading();
    // navStore.navigate(to); // Removed for now

    // Uploading navigation guard
    if (appStore.getIsUploading) {
      if (
        !confirm(
          'Navigation may cancel upload(s) in progress. ' + 'Please confirm you want to navigate from current page.'
        )
      ) {
        return false;
      }
    }

    // Backend Redirection Handler
    if (to.query?.r) {
      router.replace({
        path: to.query.r ? to.query.r.toString() : to.path,
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
  });

  router.afterEach((to) => {
    // Update document title
    document.title = to.meta.title ? `BCBox - ${to.meta.title}` : 'BCBox';

    appStore.endDeterminateLoading();
  });

  return router;
}
