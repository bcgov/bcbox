import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, unref } from 'vue';
import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, usePermissionStore, useUserStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { COMSObject, COMSObjectPermissionsOptions, ListObjectsOptions } from '@/types';

export const useObjectStore = defineStore('objectStore', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const toast = useToast();
  const { getConfig } = useConfigStore();
  const { currentUser } = storeToRefs(useUserStore());

  // State
  const objects: Ref<Array<COMSObject>> = ref([]);
  const selectedObjects: Ref<Array<COMSObject>> = ref([]); // All selected table row items

  // Getters
  const getObjects = computed(() => objects.value);
  const getSelectedObjects = computed(() => selectedObjects.value);

  // Actions
  async function createObject(object: any, bucketId?: string) {
    try {
      appStore.beginLoading();
      await objectService.createObject(object, bucketId);
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error creating object', detail: error, life: 3000 });
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
      toast.add({ severity: 'error', summary: 'Error deleting object', detail: error, life: 3000 });
      throw error;
    } finally {
      fetchObjects();
      appStore.endLoading();
    }
  }

  async function downloadObject(objectId: string, versionId?: string) {
    await objectService.getObject(objectId, versionId);
  }

  async function fetchObjects(params: COMSObjectPermissionsOptions = {}) {
    try {
      appStore.beginLoading();

      if (currentUser.value) {
        // Get a unique list of object IDs the user has access to
        const permResponse = await permissionStore.fetchObjectPermissions(params);
        const uniqueIds: string[] = [...new Set<string>(permResponse.map((x: { objectId: string }) => x.objectId))];

        let response = Array<COMSObject>();
        if (uniqueIds.length) {
          response = (await objectService.listObjects({ ...params as ListObjectsOptions, objId: uniqueIds })).data;

          // Remove old values matching search parameters
          const matches = (x: COMSObject) => (
            (!params.objId || x.id === params.objId) &&
            (!params.bucketId || x.bucketId === params.bucketId)
          );

          const [match, difference] = partition(unref(objects), matches);

          // Merge and assign
          objects.value = difference.concat(response);
        }
        else {
          objects.value = response;
        }
      }
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error downloading object', detail: error, life: 3000 });
      throw error;
    }
    finally {
      appStore.endLoading();
    }
  }

  const getObjectById = (objectId: string) => objects.value.find((x) => x.id === objectId);

  function setSelectedObjects(selected: Array<COMSObject>) {
    selectedObjects.value = selected;
  }

  return {
    // Getters
    getObjects,
    getSelectedObjects,

    // Actions
    createObject,
    deleteObjects,
    downloadObject,
    fetchObjects,
    getObjectById,
    setSelectedObjects
  };
});

export default useObjectStore;
