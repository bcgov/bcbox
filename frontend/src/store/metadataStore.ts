import { defineStore } from 'pinia';
import { computed, ref, unref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { isDebugMode, partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Metadata } from '@/types';
import type { FetchMetadataOptions } from '@/types';

export type MetadataStoreState = {
  metadata: Ref<Array<Metadata>>
}

export const useMetadataStore = defineStore('metadata', () => {
  const appStore = useAppStore();
  const toast = useToast();

  // State
  const state: MetadataStoreState = {
    metadata: ref([])
  };

  // Getters
  const getters = {
    getMetadata: computed(() => unref(state.metadata))
  };

  // Actions
  async function fetchMetadata(params: FetchMetadataOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await objectService.getMetadata(null, { ...params })).data;

      // Remove old values matching search parameters
      const matches = (x: Metadata) => (
        (!params.objId ||
          (Array.isArray(params.objId) && params.objId.some((y: string) => x.objectId === y)) ||
          (!Array.isArray(params.objId) && params.objId === x.objectId))
      );

      const [match, difference] = partition(unref(state.metadata), matches);

      // Merge and assign
      state.metadata.value = difference.concat(response);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching metadata', detail: error, life: 3000 });
      throw error;
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  const getMetadataByObjectId = (objectId: string) =>
    state.metadata.value.find((x: Metadata) => x.objectId === objectId);
  const getValue = (objectId: string, key: string) =>
    getMetadataByObjectId(objectId)?.metadata.find(x => x.key === key)?.value;

  return {
    // State
    ...(isDebugMode && state),

    // Getters
    ...getters,

    // Actions
    getMetadataByObjectId,
    fetchMetadata,
    getValue
  };
});

export default useMetadataStore;
