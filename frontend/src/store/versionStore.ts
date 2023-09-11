import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService, versionService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type {
  GetVersionOptions,
  GetVersionMetadataOptions,
  GetVersionTaggingOptions,
  Metadata,
  Tagging,
  Version
} from '@/types';

export type VersionStoreState = {
  metadata: Ref<Array<Metadata>>,
  tagging: Ref<Array<Tagging>>,
  versions: Ref<Array<Version>>
}

export const useVersionStore = defineStore('version', () => {
  const appStore = useAppStore();
  const toast = useToast();

  // State
  const state: VersionStoreState = {
    metadata: ref([]),
    tagging: ref([]),
    versions: ref([])
  };

  // Getters
  const getters = {
    getMetadata: computed(() => state.metadata.value),
    getTagging: computed(() => state.tagging.value),
    getVersions: computed(() => state.versions.value)
  };

  // Actions
  async function fetchMetadata(params: GetVersionMetadataOptions) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await versionService.getMetadata(null, params)).data;

      // Remove old values matching search parameters
      const matches = (x: Metadata) => (
        (!params.versionId || params.versionId === x.versionId)
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

  async function fetchTagging(params: GetVersionTaggingOptions) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await versionService.getObjectTagging(params)).data;

      // Remove old values matching search parameters
      const matches = (x: Tagging) => (
        (!params.versionId || params.versionId === x.versionId)
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

  async function fetchVersions(params: GetVersionOptions) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await objectService.listObjectVersion(params.objectId)).data;

      // Remove old values matching search parameters
      const matches = (x: Version) => (
        (!params.objectId || x.objectId === params.objectId)
      );

      const [, difference] = partition(state.versions.value, matches);

      // Merge and assign
      state.versions.value = difference.concat(response);
    }
    catch (error: any) {
      toast.error('Fetching versions', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  function findLatestVersionIdByObjectId(objectId: string) {
    return state.versions.value.filter((x: Version) => x.objectId === objectId)
      .sort((a: Version, b: Version) => Date.parse(b.createdAt as string) - Date.parse(a.createdAt as string))[0]?.id;
  }

  function findMetadataByVersionId(versionId: string) {
    return state.metadata.value.find((x: Metadata) => x.versionId === versionId);
  }

  function findMetadataValue(versionId: string, key: string) {
    return findMetadataByVersionId(versionId)?.metadata.find(x => x.key === key)?.value;
  }

  function findTaggingByVersionId(versionId: string) {
    return state.tagging.value.find((x: Tagging) => x.versionId === versionId);
  }

  function findVersionById(versionId: string) {
    return state.versions.value.find((x: Version) => x.id === versionId);
  }

  function findVersionsByObjectId(objectId: string) {
    return state.versions.value.filter((x: Version) => x.objectId === objectId);
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    fetchMetadata,
    fetchTagging,
    fetchVersions,
    findLatestVersionIdByObjectId,
    findMetadataByVersionId,
    findMetadataValue,
    findTaggingByVersionId,
    findVersionById,
    findVersionsByObjectId,
  };
});

export default useVersionStore;
