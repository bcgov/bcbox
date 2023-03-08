import { defineStore } from 'pinia';
// import { ref } from 'vue';

// import type { Ref } from 'vue';

export type VersionStoreState = {
}

export const useVersionStore = defineStore('version', () => {
  // State
  const state: VersionStoreState = {
  };

  // Getters
  const getters = {
  };

  // Actions

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
  };
}, { persist: true });

export default useVersionStore;
