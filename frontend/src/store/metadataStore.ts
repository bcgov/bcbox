import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';
import { error } from '@/services/toastService';

import type { Ref } from 'vue';
import type { GetMetadataOptions, Metadata } from '@/types';

export type MetadataStoreState = {
  metadata: Ref<Array<Metadata>>
}

export const useMetadataStore = defineStore('metadata', () => {
  const appStore = useAppStore();

  // State
  const state: MetadataStoreState = {
    metadata: ref([])
  };

  // Getters
  const getters = {
    getMetadata: computed(() => state.metadata.value)
  };

  // Actions
  async function fetchMetadata(params: GetMetadataOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await objectService.getMetadata(null, params)).data;

      // Remove old values matching search parameters
      const matches = (x: Metadata) => (
        (!params.objectId ||
          (Array.isArray(params.objectId) && params.objectId.some((y: string) => x.objectId === y)) ||
          (!Array.isArray(params.objectId) && params.objectId === x.objectId))
      );

      const [, difference] = partition(state.metadata.value, matches);

      // Merge and assign
      state.metadata.value = difference.concat(response);
    }
    catch (e: any) {
      error('Fetching metadata', e);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  function findMetadataByObjectId(objectId: string) {
    return state.metadata.value.find((x: Metadata) => x.objectId === objectId);
  }

  function findValue(objectId: string, key: string) {
    return findMetadataByObjectId(objectId)?.metadata.find(x => x.key === key)?.value;
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    fetchMetadata,
    findMetadataByObjectId,
    findValue
  };
}, { persist: true });

export default useMetadataStore;
