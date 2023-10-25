import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ConfigService } from '@/services';

import type { Ref } from 'vue';

export type ConfigStoreState = {
  config: Ref<any | null>;
};

export const useConfigStore = defineStore('config', () => {
  const configService = new ConfigService();

  // State
  const state: ConfigStoreState = {
    config: ref(null)
  };

  // Getters
  const getters = {
    getConfig: computed(() => state.config.value)
  };

  // Actions
  async function init(): Promise<void> {
    await ConfigService.init();

    state.config.value = configService.getConfig();
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    init
  };
});

export default useConfigStore;
