import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

export type NavStoreState = {
  home: Ref<Object>;
  items: Ref<Array<any>>;
  focusedElement: Ref<any>;
};

export const useNavStore = defineStore('nav', () => {
  // State
  const state: NavStoreState = {
    home: ref({
      label: 'Home',
      to: '/'
    }),
    items: ref([]),
    focusedElement: ref(null)
  };

  // Getters
  const getters = {};

  // Actions
  function navigate(navLink: RouteLocationNormalized) {
    // Get the path without any hash info
    const fullPath = navLink.fullPath.split('#')[0];

    // Check for existing path
    const item = state.items.value.findIndex((x: any) => x.to === fullPath);

    if (navLink.path === '/') {
      // Clear if going to Home
      state.items.value = [];
    } else if (item >= 0) {
      // Navigating back to existing item, clear any items after
      state.items.value.splice(item + 1);
    } else if (navLink.meta?.breadcrumb) {
      // Add new nav item
      state.items.value.push({ label: navLink.meta.breadcrumb, to: fullPath });
    }
  }

  function replace(oldLabel: string, newLabel: string) {
    const item = state.items.value.find((x: any) => x.label === oldLabel);
    if (item) item.label = newLabel;
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    navigate,
    replace
  };
});

export default useNavStore;
