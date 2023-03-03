import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, usePermissionStore, useUserStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { COMSObject, ObjectSearchPermissionsOptions } from '@/types';

export type ObjectStoreState = {
  objects: Ref<Array<COMSObject>>;
  selectedObjects: Ref<Array<COMSObject>>; // All selected table row items
}

export const useObjectStore = defineStore('objectStore', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const { getCurrentUser } = storeToRefs(useUserStore());

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
  async function createObject(object: any, bucketId?: string) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.createObject(object, bucketId);
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error creating object', detail: error, life: 3000 });
      throw error;
    } finally {
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
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error deleting object', detail: error, life: 3000 });
      throw error;
    } finally {
      fetchObjects();
      appStore.endIndeterminateLoading();
    }
  }

  async function downloadObject(objectId: string, versionId?: string) {
    await objectService.getObject(objectId, versionId);
  }

  async function fetchObjects(params: ObjectSearchPermissionsOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      if (getCurrentUser.value) {
        // Get a unique list of object IDs the user has access to
        const permResponse = await permissionStore.fetchObjectPermissions(params);
        const uniqueIds: string[] = [...new Set<string>(permResponse.map((x: { objectId: string }) => x.objectId))];

        let response = Array<COMSObject>();
        if (uniqueIds.length) {
          response = (await objectService.searchObjects({
            bucketId: params.bucketId ? [params.bucketId] : undefined,
            objId: uniqueIds
          })).data;

          // Remove old values matching search parameters
          const matches = (x: COMSObject) => (
            (!params.objId || x.id === params.objId) &&
            (!params.bucketId || x.bucketId === params.bucketId)
          );

          const [match, difference] = partition(state.objects.value, matches);

          // Merge and assign
          state.objects.value = difference.concat(response);
        }
        else {
          state.objects.value = response;
        }
      }
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error downloading object', detail: error, life: 3000 });
      throw error;
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  const getObjectById = (objectId: string) => state.objects.value.find((x) => x.id === objectId);

  function setSelectedObjects(selected: Array<COMSObject>) {
    state.selectedObjects.value = selected;
  }

  async function togglePublic(objectId: string, isPublic: boolean) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.togglePublic(objectId, isPublic);
    } catch (error) {
      console.error(`Toggle public: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
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
    getObjectById,
    setSelectedObjects,
    togglePublic
  };
}, { persist: true });

export default useObjectStore;
