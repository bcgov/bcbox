import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, usePermissionStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { COMSObject, ObjectSearchPermissionsOptions } from '@/types';
import type { AxiosRequestConfig } from 'axios';

export type ObjectStoreState = {
  objects: Ref<Array<COMSObject>>;
  selectedObjects: Ref<Array<COMSObject>>; // All selected table row items
}

export const useObjectStore = defineStore('object', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();

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
  async function createObject(object: any, bucketId?: string, axiosOptions?: AxiosRequestConfig) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.createObject(object, bucketId, axiosOptions);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error creating object', detail: error, life: 3000 });
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteObjects(objectIds: Array<string>) {
    try {
      appStore.beginIndeterminateLoading();
      await Promise.all(
        objectIds.map(async (id) => {
          await objectService.deleteObject(id);
        })
      );
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error deleting object', detail: error, life: 3000 });
    }
    finally {
      fetchObjects();
      appStore.endIndeterminateLoading();
    }
  }

  async function downloadObject(objectId: string, versionId?: string) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.getObject(objectId, versionId);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error downloading object', detail: error, life: 3000 });
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
        const uniqueIds: string[] = [...new Set<string>(permResponse.map((x: { objectId: string }) => x.objectId))];

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
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching objects', detail: error, life: 3000 });
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
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching head', detail: error, life: 3000 });
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
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error changing public state', detail: error, life: 3000 });
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
    togglePublic
  };
}, { persist: true });

export default useObjectStore;
