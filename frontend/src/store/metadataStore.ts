import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { GetMetadataOptions, Metadata } from '@/types';

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
    catch (error: any) {
      toast.error('Fetching metadata', error);
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

  async function replaceMetadata(
    objectId: string,
    metadata: Array<{ key: string; value: string }>,
    versionId?: string,
  ) {
    try {
      appStore.beginIndeterminateLoading();
      // Ensure x-amz-meta- prefix exists
      if (metadata) {
        for (const meta of metadata) {
          if (!meta.key.startsWith('x-amz-meta-')) {
            meta.key = `x-amz-meta-${meta.key}`;
          }
        }
      }

      await objectService.replaceMetadata(objectId, metadata, versionId);
      await fetchMetadata({ objectId: objectId });
    }
    catch (error: any) {
      toast.error('Updating metadata', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    fetchMetadata,
    findMetadataByObjectId,
    findValue,
    replaceMetadata
  };
}, { persist: true });

export default useMetadataStore;
