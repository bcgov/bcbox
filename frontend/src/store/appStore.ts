import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Ref } from 'vue';

export type AppStoreState = {
  loadingCalls: Ref<number>
  loadingInterval: Ref<ReturnType<typeof setTimeout> | undefined>
  loadingMode: Ref<'determinate' | 'indeterminate'>
  loadingValue: Ref<number>,
  uploadingCalls: Ref<number>
}

export const useAppStore = defineStore('app', () => {
  // State
  const state: AppStoreState = {
    loadingCalls: ref(0),
    loadingInterval: ref(undefined),
    loadingMode: ref('indeterminate'),
    loadingValue: ref(0),
    uploadingCalls: ref(0)
  };

  // Getters
  const getters = {
    getIsLoading: computed(() => state.loadingCalls.value > 0),
    getIsUploading: computed(() => state.uploadingCalls.value > 0),
    getLoadingCalls: computed(() => state.loadingCalls.value),
    getLoadingMode: computed(() => state.loadingMode.value),
    getLoadingValue: computed(() => state.loadingValue.value)
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
      clearInterval(state.loadingInterval.value);
      state.loadingInterval.value = undefined;
      --state.loadingCalls.value;
    }, 300);
  }

  function endIndeterminateLoading() {
    setTimeout(() => {
      --state.loadingCalls.value;
    }, 300);
  }

  function beginUploading() {
    ++state.uploadingCalls.value;
  }

  function clearUploads() {
    state.uploadingCalls.value = 0;
  }

  function endUploading() {
    if (--state.uploadingCalls.value < 0) {
      state.loadingCalls.value = 0; // Safeguard negatives
    }
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    beginDeterminateLoading,
    beginIndeterminateLoading,
    endDeterminateLoading,
    endIndeterminateLoading,
    beginUploading,
    clearUploads,
    endUploading
  };
});

export default useAppStore;
