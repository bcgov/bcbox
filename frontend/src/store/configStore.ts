import { defineStore } from 'pinia';
import { computed, ref, unref } from 'vue';

import { ConfigService } from '@/services';
import { isDebugMode } from './utils';

import type { Ref } from 'vue';

export type ConfigStoreState = {
  config: Ref<any | null>
}

export const useConfigStore = defineStore('config', () => {
  const configService = new ConfigService();

  // State
  const state: ConfigStoreState = {
    config: ref(null),
  };

  // Getters
  const getters = {
    getConfig: computed(() => unref(state.config))
  };

  // Actions
  async function init(): Promise<void> {
    await ConfigService.init();

    state.config.value = configService.getConfig();
  }

  return {
    ...(isDebugMode && state),
    ...getters,
    init
  };
});

export default useConfigStore;
