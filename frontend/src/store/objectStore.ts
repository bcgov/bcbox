import { ref } from 'vue';
import { defineStore } from 'pinia';
import { objectService } from '@/services';

export const useObjectStore = defineStore('objectStore', () => {
  // state
  const loading = ref(false);
  const objectList = ref([] as Object[]);
  const selectedObject = ref({});

  // actions
  async function createObject(object: any, bucketId?: string) {
    try {
      loading.value = true;
      const response = await objectService.createObject(object, bucketId);
      if (response) {
        await listObjects({ bucketId: bucketId });
      }
    } catch (error) {
      console.error(`Error uploading: ${error}`);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function listObjects(params = {}) {
    objectList.value = [];
    const response = await objectService.listObjects(params);
    objectList.value = response.data;
  }

  async function getObject(objectId: string) {
    await objectService.getObject(objectId);
  }

  async function readObject(objectId: string) {
    const response = await objectService.readObject(objectId);
    selectedObject.value = response.data;
  }

  return { loading, objectList, selectedObject, createObject, listObjects, getObject };
});
