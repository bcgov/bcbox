import { ref, isProxy, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { COMSObject, Metadata } from '@/interfaces';
import { objectService } from '@/services';
import { useUserStore } from '@/store';

export const useObjectStore = defineStore('objectStore', () => {
  const { currentUser } = storeToRefs(useUserStore());

  // state
  const loading = ref(false);
  const objectList = ref([] as COMSObject[]);
  const selectedObject = ref({});
  const multiSelectedObjects = ref([] as COMSObject[]); // all selected table row items

  // actions
  function getObjectInfo(objectId: string) {
    let object = objectList.value.find((x) => x.id === objectId);
    if (isProxy(object)) {
      object = toRaw(object);
    }

    // TODO: Get unique list of users with management positions on the bucket

    return object;
  }

  async function createObject(object: any, bucketId?: string) {
    try {
      loading.value = true;
      await objectService.createObject(object, bucketId);
    } catch (error) {
      console.error(`Error uploading: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteObjectList(objectIds: Array<string>) {
    try {
      loading.value = true;
      await Promise.all(
        objectIds.map(async (id) => {
          await objectService.deleteObject(id);
        })
      );
    } catch (error) {
      console.error(`Error deleting ${objectIds}: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      loading.value = false;

      // Refresh the table after
      listObjects();
    }
  }

  async function listObjects(params: any = {}) {
    try {
      loading.value = true;

      objectList.value = [];

      // Checks for a users object permissions within the bucket
      // Obtains a unique set of object IDs, searches for the objects and their associated metadata
      if (currentUser.value) {
        const permResponse = (await objectService.searchForPermissions({
          userId: currentUser.value.userId,
          bucketId: params.bucketId ?? undefined
        })).data;

        const uniqueIds = [...new Set(permResponse.map((x: { objectId: string }) => x.objectId))];
        const objects = (await objectService.listObjects({ objId: uniqueIds, ...params })).data;
        const metadataResponse = (await objectService.getMetadata(null, { objId: uniqueIds })).data;

        objects.map(async (obj: any) => {
          const metadata = metadataResponse.find((x: Metadata) => x.objectId === obj.id);
          // TODO: Tags

          if (metadata) {
            obj.metadata = metadata;
            obj.name = metadata.metadata.find((x: { key: string }) => x.key === 'name')?.value;
          }
        });

        objectList.value = objects;
      }
    } catch (error) {
      console.error(`Error obtaining object list: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function getObject(objectId: string, versionId?: string) {
    await objectService.getObject(objectId, versionId);
  }

  // async function readObject(objectId: string) {
  //   const response = await objectService.readObject(objectId);
  //   selectedObject.value = response.data;
  // }

  return {
    loading,
    multiSelectedObjects,
    objectList,
    selectedObject,
    createObject,
    deleteObjectList,
    getObjectInfo,
    getObject,
    listObjects
  };
});
