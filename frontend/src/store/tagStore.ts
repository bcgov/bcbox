import { defineStore } from 'pinia';
import { computed, ref, unref } from 'vue';
import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { FetchTaggingOptions, Tagging } from '@/types';

export const useTagStore = defineStore('tag', () => {
  const appStore = useAppStore();
  const toast = useToast();

  // State
  const tagging: Ref<Array<Tagging>> = ref([]);

  // Getters
  const getTagging = computed(() => tagging.value);

  // Actions
  async function fetchTagging(params: FetchTaggingOptions = {}) {
    try {
      appStore.beginLoading();

      const response = (await objectService.getObjectTagging({ ...params })).data;

      // Remove old values matching search parameters
      const matches = (x: Tagging) => (
        (!params.objId ||
          (Array.isArray(params.objId) && params.objId.some((y: string) => x.objectId === y)) ||
          (!Array.isArray(params.objId) && params.objId === x.objectId))
      );

      const [match, difference] = partition(unref(tagging), matches);

      // Merge and assign
      tagging.value = difference.concat(response);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching tags', detail: error, life: 3000 });
      throw error;
    }
    finally {
      appStore.endLoading();
    }
  }

  const getTaggingByObjectId = (objectId: string) => tagging.value.find((x: Tagging) => x.objectId === objectId);

  return {
    // Getters
    getTagging,

    // Actions
    fetchTagging,
    getTaggingByObjectId,
  };
});
