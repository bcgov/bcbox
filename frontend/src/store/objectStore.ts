import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, useAuthStore, usePermissionStore } from '@/store';
import { partition } from '@/utils/utils';

import type { AxiosRequestConfig } from 'axios';
import type { Ref } from 'vue';
import type { COMSObject, ObjectSearchPermissionsOptions } from '@/types';

export type ObjectStoreState = {
  objects: Ref<Array<COMSObject>>;
  selectedObjects: Ref<Array<COMSObject>>; // All selected table row items
}

export const useObjectStore = defineStore('object', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const { getUserId } = storeToRefs(useAuthStore());

  // State
  const state: ObjectStoreState = {
    objects: ref([]),
    selectedObjects: ref([]),
  };

  // Getters
  const getters = {
    getObjects: computed(() => state.objects.value),
    getSelectedObjects: computed(() => state.selectedObjects.value)
  };

  // Actions
  async function createObject(
    object: any,
    headers: {
      metadata?: Array<{ key: string; value: string }>,
    },
    params: {
      bucketId?: string,
      tagset?: Array<{ key: string; value: string }>
    },
    axiosOptions?: AxiosRequestConfig) {
    try {
      appStore.beginIndeterminateLoading();

      // Ensure x-amz-meta- prefix exists
      if (headers.metadata) {
        for (const meta of headers.metadata) {
          if (!meta.key.startsWith('x-amz-meta-')) {
            meta.key = `x-amz-meta-${meta.key}`;
          }
        }
      }

      await objectService.createObject(object, headers, params, axiosOptions);
    }
    catch (error: any) {
      if (error.response.status === 409) {
        toast.error('Creating object', 'File already exists');
      }
      else {
        toast.error('Creating object', error);
      }
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteObjects(objectIds: Array<string>, versionId?: string) {
    const bucketId = findObjectById(objectIds[0])?.bucketId;

    try {
      appStore.beginIndeterminateLoading();
      await Promise.all(
        objectIds.map(async (id) => {
          await objectService.deleteObject(id, versionId);
        })
      );
    }
    catch (error: any) {
      toast.error('Deleting object', error);
    }
    finally {
      fetchObjects({ bucketId: bucketId, userId: getUserId.value, bucketPerms: true });
      appStore.endIndeterminateLoading();
    }
  }

  async function downloadObject(objectId: string, versionId?: string) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.getObject(objectId, versionId);
    }
    catch (error: any) {
      toast.error('Downloading object', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchObjects(params: ObjectSearchPermissionsOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      // Get a unique list of object IDs the user has access to
      const permResponse = await permissionStore.fetchObjectPermissions(params);

      if (permResponse) {
        const uniqueIds: Array<string> = [
          ...new Set<string>(permResponse
            .map((x: { objectId: string }) => x.objectId)
            // Resolve API returning all objects with bucketPerms=true even when requesting single objectId
            .filter((objectId: string) => !params.objectId || objectId === params.objectId))
        ];

        let response = Array<COMSObject>();
        if (uniqueIds.length) {
          response = (await objectService.searchObjects({
            bucketId: params.bucketId ? [params.bucketId] : undefined,
            objectId: uniqueIds,

            // Added to allow deletion of objects before versioning implementation
            // TODO: Verify if needed after versioning implemented
            deleteMarker: false,
            latest: true
          })).data;

          // Remove old values matching search parameters
          const matches = (x: COMSObject) => (
            (!params.objectId || x.id === params.objectId) &&
            (!params.bucketId || x.bucketId === params.bucketId)
          );

          const [, difference] = partition(state.objects.value, matches);

          // Merge and assign
          state.objects.value = difference.concat(response);
        }
        else {
          state.objects.value = response;
        }
      }
    }
    catch (error: any) {
      toast.error('Fetching objects', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  function findObjectById(objectId: string) {
    return state.objects.value.find((x) => x.id === objectId);
  }

  async function headObject(objectId: string) {
    try {
      appStore.beginIndeterminateLoading();

      // Return full response as data will always be No Content
      return (await objectService.headObject(objectId));
    }
    catch (error: any) {
      toast.error('Fetching head', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  function setSelectedObjects(selected: Array<COMSObject>) {
    state.selectedObjects.value = selected;
  }

  async function togglePublic(objectId: string, isPublic: boolean) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.togglePublic(objectId, isPublic);
    }
    catch (error: any) {
      toast.error('Changing public state', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function updateObject(object: any, objectId: string, axiosOptions?: AxiosRequestConfig) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.updateObject(objectId, object, axiosOptions);
    }
    catch (error: any) {
      toast.error('Updating object', error);
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
    createObject,
    deleteObjects,
    downloadObject,
    fetchObjects,
    findObjectById,
    headObject,
    setSelectedObjects,
    togglePublic,
    updateObject
  };
}, { persist: true });

export default useObjectStore;
