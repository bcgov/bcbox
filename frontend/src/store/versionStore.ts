import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService, versionService } from '@/services';
import { useAppStore } from '@/store';

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

      if (params.objectId) {
        state.metadata.value = [];
        const versions = getters.getVersionsByObjectId.value(params.objectId);
        state.metadata.value = (
          await versionService.getMetadata(null, { versionId: versions.map(({ id }) => id) })
        ).data;
      } else {
        state.metadata.value = (await versionService.getMetadata(null, params)).data;
      }
    } catch (error: any) {
      toast.error('Fetching metadata', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchTagging(params: GetVersionTaggingOptions) {
    try {
      appStore.beginIndeterminateLoading();
      if (params.objectId) {
        const versions = getters.getVersionsByObjectId.value(params.objectId);
        state.tagging.value = (await versionService.getObjectTagging({ versionId: versions.map(({ id }) => id) })).data;
      } else {
        state.tagging.value = (await versionService.getObjectTagging(params)).data;
      }
    } catch (error: any) {
      toast.error('Fetching tags', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchVersions(params: GetVersionOptions) {
    try {
      appStore.beginIndeterminateLoading();
      state.versions.value = (await objectService.listObjectVersion(params.objectId)).data;
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
