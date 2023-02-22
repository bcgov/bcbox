import { computed, ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';

import { objectService } from '@/services';
import { useAppStore, useConfigStore, usePermissionStore, useUserStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject, COMSObjectPermission } from '@/interfaces';

export const useObjectStore = defineStore('objectStore', () => {
  const appStore = useAppStore();
  const toast = useToast();
  const { getConfig } = useConfigStore();
  const { getObjectPermissions } = storeToRefs(usePermissionStore());
  const { currentUser } = storeToRefs(useUserStore());

  // State
  const objects: Ref<Array<COMSObject>> = ref([]);
  //const selectedObject: Ref<COMSObject | null> = ref(null);
  //const selectedObjectPermissions: Ref<Array<UserPermissions>> = ref([]);
  //const multiSelectedObjects: Ref<Array<COMSObject>> = ref([]); // All selected table row items

  // Computed Getters
  const getObjects = computed(() => objects.value);

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

  async function fetchObjects(params: any = {}) {
    try {
      appStore.beginLoading();

      if (currentUser.value) {
        const objectPerms = getObjectPermissions.value.filter((x: COMSObjectPermission) =>
          x.userId === currentUser.value?.userId
        );

        const uniqueIds = [...new Set(objectPerms.map((x: { objectId: string }) => x.objectId))];

        if (uniqueIds.length) {
          objects.value = (await objectService.listObjects({ objId: uniqueIds, ...params })).data;
        }
      }
    } catch (error) {
      console.error(`Error obtaining object list: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      appStore.endLoading();
    }
  }

  return {
    // Computed Getters
    getObjects,

    // Getters
    getObjectById,

    // Actions
    createObject,
    deleteObjects,
    fetchObjects,
  };
});

export default useObjectStore;
