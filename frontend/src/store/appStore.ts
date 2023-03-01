import { defineStore } from 'pinia';
import { computed, ref, unref } from 'vue';

import { isDebugMode } from './utils';

import type { Ref } from 'vue';

export type AppStoreState = {
  loadingCalls: Ref<number>
  loadingInterval: Ref<ReturnType<typeof setTimeout> | undefined>
  loadingMode: Ref<'determinate' | 'indeterminate'>
  loadingValue: Ref<number>
}

export const useAppStore = defineStore('app', () => {
  // State
  const state: AppStoreState = {
    loadingCalls: ref(0),
    loadingInterval: ref(undefined),
    loadingMode: ref('indeterminate'),
    loadingValue: ref(0)
  };

  // Getters
  const getters = {
    getIsLoading: computed(() => unref(state.loadingCalls) > 0),
    getLoadingCalls: computed(() => unref(state.loadingCalls)),
    getLoadingMode: computed(() => unref(state.loadingMode)),
    getLoadingValue: computed(() => unref(state.loadingValue)),
  };

  // Actions
  function beginDeterminateLoading() {
    state.loadingValue.value = 0;
    ++state.loadingCalls.value;
    state.loadingMode.value = 'determinate';
    state.loadingInterval.value = setInterval(() => {
      let newValue = state.loadingValue.value + Math.floor(Math.random() * 10) + 1;
      if (newValue >= 100) newValue = 100;
      state.loadingValue.value = newValue;
    }, 1000);
  }

  function beginIndeterminateLoading() {
    ++state.loadingCalls.value;
    state.loadingMode.value = 'indeterminate';
  }

  function endDeterminateLoading() {
    state.loadingValue.value = 100;
    setTimeout(() => {
      clearInterval(unref(state.loadingInterval));
      state.loadingInterval.value = undefined;
      --state.loadingCalls.value;
    }, 300);
  }

  function endIndeterminateLoading() {
    setTimeout(() => {
      --state.loadingCalls.value;
    }, 300);
  }

  return {
    ...(isDebugMode && state),
    ...getters,
    beginDeterminateLoading,
    beginIndeterminateLoading,
    endDeterminateLoading,
    endIndeterminateLoading
  };
});

export default useAppStore;
