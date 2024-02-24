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
  metadata: Ref<Array<Metadata>>;
  tagging: Ref<Array<Tagging>>;
  versions: Ref<Array<Version>>;
};

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
    getVersion: computed(() => (id: string) => state.versions.value.find((v) => v.id === id)),
    getVersions: computed(() => state.versions.value),
    getVersionsByObjectId: computed(
      () => (objectId: string) => state.versions.value.filter((x: Version) => x.objectId === objectId)
    ),
    getLatestVersionIdByObjectId: computed(
      () => (objectId: string) => state.versions.value.find((x: Version) => x.objectId === objectId && x.isLatest)?.id
    ),
    getMetadata: computed(() => state.metadata.value),
    getMetadataByVersionId: computed(
      () => (versionId: string) => state.metadata.value.find((x: Metadata) => x.versionId === versionId)
    ),
    getTagging: computed(() => state.tagging.value),
    getTaggingByVersionId: computed(
      () => (versionId: string) => state.tagging.value.find((x: Tagging) => x.versionId === versionId)
    )
  };

  // Actions
  async function fetchMetadata(params: GetVersionMetadataOptions) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await versionService.getMetadata(null, params)).data;

      // Remove old values matching search parameters
      const matches = (x: Metadata) => !params.versionId || params.versionId === x.versionId;

      const [, difference] = partition(state.metadata.value, matches);

      // Merge and assign
      state.metadata.value = difference.concat(response);
    } catch (error: any) {
      toast.error('Fetching metadata', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchTagging(params: GetVersionTaggingOptions) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await versionService.getObjectTagging(params)).data;

      // Remove old values matching search parameters
      const matches = (x: Tagging) => !params.versionId || params.versionId === x.versionId;

      const [, difference] = partition(state.tagging.value, matches);

      // Merge and assign
      state.tagging.value = difference.concat(response);
      // NOTE: seems to be adding duplicates
    } catch (error: any) {
      toast.error('Fetching tags', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchVersions(params: GetVersionOptions) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await objectService.listObjectVersion(params.objectId)).data;

      // Remove old values matching search parameters
      const matches = (x: Version) => !params.objectId || x.objectId === params.objectId;

      const [, difference] = partition(state.versions.value, matches);

      // Merge and assign
      state.versions.value = difference.concat(response);
    } catch (error: any) {
      toast.error('Fetching versions', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function findMetadataValue(versionId: string, key: string) {
    return getters.getMetadataByVersionId.value(versionId)?.metadata.find((x) => x.key === key)?.value;
  }

  function findS3VersionByObjectId(objectId: string) {
    return state.versions.value.filter((x: Version) => x.objectId === objectId)[0]?.s3VersionId;
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
    findMetadataValue,
    findS3VersionByObjectId
  };
});

export default useVersionStore;
