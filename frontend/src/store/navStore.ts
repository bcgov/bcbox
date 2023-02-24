import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { RouteLocationNormalized } from 'vue-router';

export const useNavStore = defineStore('nav', () => {
  // State
  const home = ref({
    label: 'Home',
    to: '/',
  });
  const items = ref([] as any[]);

  // Actions
  function navigate(navLink: RouteLocationNormalized) {
    // Get the path without any hash info
    const fullPath = navLink.fullPath.split('#')[0];

    // Check for existing path
    const item = items.value.findIndex((x: any) => x.to === fullPath);

    if (navLink.path === '/') {
      // Clear if going to Home
      items.value = [];
    }
    else if (item >= 0) {
      // Navigating back to existing item, clear any items after
      items.value.splice(item + 1);
    }
    else if (navLink.meta?.breadcrumb) {
      // Add new nav item
      items.value.push({ label: navLink.meta.breadcrumb, to: fullPath });
    }
  }

  function replace(oldLabel: string, newLabel: string) {
    const item = items.value.find((x: any) => x.label === oldLabel);
    if (item) item.label = newLabel;
  }

  return {
    // State
    home,
    items,

    // Actions
    navigate,
    replace
  };
});

export default useNavStore;
