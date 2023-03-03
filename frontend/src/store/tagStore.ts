import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { isDebugMode, partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { GetObjectTaggingOptions, Tagging } from '@/types';

export type TagStoreState = {
  tagging: Ref<Array<Tagging>>
}

export const useTagStore = defineStore('tag', () => {
  const appStore = useAppStore();
  const toast = useToast();

  // State
  const state: TagStoreState = {
    tagging: ref([])
  };

  // Getters
  const getters = {
    getTagging: computed(() => state.tagging.value)
  };

  // Actions
  async function fetchTagging(params: GetObjectTaggingOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await objectService.getObjectTagging(params)).data;

      // Remove old values matching search parameters
      const matches = (x: Tagging) => (
        (!params.objId ||
          (Array.isArray(params.objId) && params.objId.some((y: string) => x.objectId === y)) ||
          (!Array.isArray(params.objId) && params.objId === x.objectId))
      );

      const [match, difference] = partition(state.tagging.value, matches);

      // Merge and assign
      state.tagging.value = difference.concat(response);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching tags', detail: error, life: 3000 });
      throw error;
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  const getTaggingByObjectId = (objectId: string) => state.tagging.value.find((x: Tagging) => x.objectId === objectId);

  return {
    // State
    ...(isDebugMode && state),

    // Getters
    ...getters,

    // Actions
    fetchTagging,
    getTaggingByObjectId,
  };
});

export default useTagStore;
