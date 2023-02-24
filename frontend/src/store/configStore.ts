import { defineStore } from 'pinia';
import { ref } from 'vue';

import { ConfigService } from '@/services';
import { generateGetters, isDebugMode } from './utils';

import type { Ref } from 'vue';
import type { IGetterIndex, IStateIndex } from '@/types';

export type ConfigStateStore = {
  config: Ref<any | null>
} & IStateIndex

export const useConfigStore = defineStore('config', () => {
  const configService = new ConfigService();

  // State
  const state: ConfigStateStore = {
    config: ref(null),
  };

  // Getters
  const getters: IGetterIndex = generateGetters(state);

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
