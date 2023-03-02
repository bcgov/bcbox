import { defineStore } from 'pinia';
import { ref } from 'vue';

import { isDebugMode } from '@/utils/utils';

import type { Ref } from 'vue';

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
    ...(isDebugMode && state),

    // Getters
    ...getters,

    // Actions
  };
});

export default useVersionStore;
