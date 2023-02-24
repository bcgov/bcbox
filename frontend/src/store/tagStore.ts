import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { objectService } from '@/services';

import type { Ref } from 'vue';
import type { Tagging } from '@/types';

export const useTagStore = defineStore('tag', () => {
  // State
  const tagging: Ref<Array<Tagging>> = ref([]);

  // Getters
  const getTagging = computed(() => tagging.value);

  // Actions
  async function fetchTagging(params: object = {}) {
    try {
      tagging.value = (await objectService.getObjectTagging({ ...params })).data;
    }
    catch (error) {
      console.error(`fetchTagging error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
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
