import { ref, isProxy, toRaw } from 'vue';
import { defineStore } from 'pinia';
import type { COMSObject } from '@/interfaces';
import { objectService } from '@/services';

export const useObjectStore = defineStore('objectStore', () => {
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
      // refresh the table after
      listObjects();
      loading.value = false;
    }
  }

  async function listObjects(params = {}) {
    objectList.value = [];
    const objects = (await objectService.listObjects(params)).data;

    await Promise.all(
      objects.map(async (obj: any) => {
        const metadataResponse = await objectService.getMetadata(null, { objId: obj.id });
        // TODO: Tags

        // Populate object
        if (metadataResponse.data[0]) {
          obj.metadata = metadataResponse.data[0];
          obj.name = obj.metadata.metadata.find((x: any) => x.key === 'name')?.value;
        }
      })
    );

    objectList.value = objects;
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
