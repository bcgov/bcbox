import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { GetMetadataOptions, Metadata, MetadataPair } from '@/types';

export type MetadataStoreState = {
  metadata: Ref<Array<Metadata>>;
  metadataSearchResults: Ref<Array<Metadata>>;
};

export const useMetadataStore = defineStore('metadata', () => {
  const appStore = useAppStore();
  const toast = useToast();

  // State
  const state: MetadataStoreState = {
    metadata: ref([]),
    metadataSearchResults: ref([])
  };

  // Getters
  const getters = {
    getMetadata: computed(() => state.metadata.value),
    getMetadataByObjectId: computed(
      () => (objectId: string) => state.metadata.value.find((x: Metadata) => x.objectId === objectId)
    ),
    getMetadataSearchResults: computed(() => state.metadataSearchResults.value)
  };

  // Actions
  async function fetchMetadata(params: GetMetadataOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await objectService.getMetadata(null, params)).data;

      // Remove old values matching search parameters
      const matches = (x: Metadata) =>
        !params.objectId ||
        (Array.isArray(params.objectId) && params.objectId.some((y: string) => x.objectId === y)) ||
        (!Array.isArray(params.objectId) && params.objectId === x.objectId);

      const [, difference] = partition(state.metadata.value, matches);

      // Merge and assign
      state.metadata.value = difference.concat(response);
    } catch (error: any) {
      toast.error('Fetching metadata', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function findValue(objectId: string, key: string) {
    return getters.getMetadataByObjectId.value(objectId)?.metadata.find((x) => x.key === key)?.value;
  }

  async function replaceMetadata(
    objectId: string,
    metadata: Array<{ key: string; value: string }>,
    versionId?: string
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
    } catch (error: any) {
      toast.error('Updating metadata', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function searchMetadata(metadataSet: Array<MetadataPair> = [], bucketId?: string) {
    try {
      state.metadataSearchResults.value = [];
      const response = (await objectService.searchMetadata({ metadata: metadataSet }, bucketId)).data;
      state.metadataSearchResults.value = response;
    } catch (error: any) {
      toast.error('Searching metadata', error.response?.data.detail ?? error, { life: 0 });
    }
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    fetchMetadata,
    findValue,
    searchMetadata,
    replaceMetadata
  };
});

export default useMetadataStore;
