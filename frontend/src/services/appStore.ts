import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import type { Ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const loadingCalls: Ref<number> = ref(0);

  // Getters
  const getLoading = computed(() => loadingCalls.value > 0);

  // Actions
  function beginLoading() {
    ++loadingCalls.value;
  }

  function endLoading() {
    --loadingCalls.value;
  }

  return {
    // State
    getLoading,

    // Actions
    beginLoading,
    endLoading
  };
});
