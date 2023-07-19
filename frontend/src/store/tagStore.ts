import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { GetObjectTaggingOptions, Tag, Tagging } from '@/types';

export type TagStoreState = {
  tagging: Ref<Array<Tagging>>
  tagSearchResults: Ref<Array<Tagging>>
}

export const useTagStore = defineStore('tag', () => {
  const appStore = useAppStore();
  const toast = useToast();

  // State
  const state: TagStoreState = {
    tagging: ref([]),
    tagSearchResults: ref([])
  };

  // Getters
  const getters = {
    getTagging: computed(() => state.tagging.value),
    getTagSearchResults: computed(() => state.tagSearchResults.value)
  };

  // Actions
  async function deleteTagging(
    objectId: string,
    tagging: Array<Tag>,
    versionId?: string,
  ) {
    try {
      appStore.beginIndeterminateLoading();

      await objectService.deleteTagging(objectId, tagging, versionId);
      await fetchTagging({ objectId: objectId });
    }
    catch (error: any) {
      toast.error('Deleting tags', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchTagging(params: GetObjectTaggingOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await objectService.getObjectTagging(params)).data;

      // Remove old values matching search parameters
      const matches = (x: Tagging) => (
        (!params.objectId ||
          (Array.isArray(params.objectId) && params.objectId.some((y: string) => x.objectId === y)) ||
          (!Array.isArray(params.objectId) && params.objectId === x.objectId))
      );

      const [, difference] = partition(state.tagging.value, matches);

      // Merge and assign
      state.tagging.value = difference.concat(response);
    }
    catch (error: any) {
      toast.error('Fetching tags', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  const findTaggingByObjectId = (objectId: string) => state.tagging.value.find((x: Tagging) => x.objectId === objectId);

  async function replaceTagging(
    objectId: string,
    tagging: Array<Tag>,
    versionId?: string,
  ) {
    try {
      appStore.beginIndeterminateLoading();

      await objectService.replaceTagging(objectId, tagging, versionId);
      await fetchTagging({ objectId: objectId });
    }
    catch (error: any) {
      toast.error('Updating tags', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function searchTagging(
    tagset: Array<Tag> = [],
  ) {
    try {
      state.tagSearchResults.value = [];
      // await new Promise((resolve) => setTimeout(resolve, 4000));
      const response = (await objectService.searchTagging(tagset)).data;
      state.tagSearchResults.value = response;
    }
    catch (error: any) {
      toast.error('Searching tags', error);
    }
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    deleteTagging,
    fetchTagging,
    findTaggingByObjectId,
    replaceTagging,
    searchTagging
  };
}, { persist: true });

export default useTagStore;
