import { defineStore } from 'pinia';
import { computed, ref, unref } from 'vue';
import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Metadata } from '@/types';
import type { FetchMetadataOptions } from '@/types';

export const useMetadataStore = defineStore('metadata', () => {
  const appStore = useAppStore();
  const toast = useToast();

  // State
  const metadata: Ref<Array<Metadata>> = ref([]);

  // Getters
  const getMetadata = computed(() => metadata.value);

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

      const [match, difference] = partition(unref(metadata), matches);

      // Merge and assign
      metadata.value = difference.concat(response);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching metadata', detail: error, life: 3000 });
      throw error;
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  const getMetadataByObjectId = (objectId: string) => metadata.value.find((x: Metadata) => x.objectId === objectId);
  const getValue = (objectId: string, key: string) =>
    getMetadataByObjectId(objectId)?.metadata.find(x => x.key === key)?.value;

  return {
    // Getters
    getMetadata,

    // Actions
    getMetadataByObjectId,
    fetchMetadata,
    getValue
  };
});

export default useMetadataStore;
