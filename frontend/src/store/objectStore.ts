import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, usePermissionStore, useUserStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject } from '@/interfaces';
import type { ObjectPermissionsOptions } from '@/types';

export const useObjectStore = defineStore('objectStore', () => {
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const toast = useToast();
  const { getConfig } = useConfigStore();
  const { currentUser } = storeToRefs(useUserStore());

  // State
  const objects: Ref<Array<COMSObject>> = ref([]);
  //const selectedObject: Ref<COMSObject | null> = ref(null);
  //const selectedObjectPermissions: Ref<Array<UserPermissions>> = ref([]);
  const selectedObjects: Ref<Array<COMSObject>> = ref([]); // All selected table row items

  // Computed Getters
  const getObjects = computed(() => objects.value);
  const getSelectedObjects = computed(() => selectedObjects.value);

  // Getters
  const getObjectById = (objectId: string) => objects.value.find((x) => x.id === objectId);

  // Actions
  async function createObject(object: any, bucketId?: string) {
    try {
      appStore.beginLoading();
      await objectService.createObject(object, bucketId);
    } catch (error) {
      console.error(`Error uploading: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      appStore.endLoading();
    }
  }

  async function deleteObjects(objectIds: Array<string>) {
    try {
      appStore.beginLoading();
      await Promise.all(
        objectIds.map(async (id) => {
          await objectService.deleteObject(id);
        })
      );
    } catch (error) {
      console.error(`Error deleting ${objectIds}: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      fetchObjects();
      appStore.endLoading();
    }
  }

  async function downloadObject(objectId: string, versionId?: string) {
    await objectService.getObject(objectId, versionId);
  }

  async function fetchObjects(params: ObjectPermissionsOptions = {}) {
    try {
      appStore.beginLoading();

      if (currentUser.value) {
        const permResponse = await permissionStore.fetchObjectPermissions(params);

        const uniqueIds = [...new Set(permResponse.map((x: { id: string }) => x.id))];
        let response = Array<COMSObject>();
        if (uniqueIds.length) {
          response = (await objectService.listObjects({ ...params, objId: uniqueIds })).data;
        }
        objects.value = response;
      }
    } catch (error) {
      console.error(`Error obtaining object list: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      appStore.endLoading();
    }
  }

  function setSelectedObjects(selected: Array<COMSObject>) {
    selectedObjects.value = selected;
  }

  return {
    // Computed Getters
    getObjects,
    getSelectedObjects,

    // Getters
    getObjectById,

    // Actions
    createObject,
    deleteObjects,
    downloadObject,
    fetchObjects,
    setSelectedObjects
  };
});

export default useObjectStore;
