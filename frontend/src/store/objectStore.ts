import { ref } from 'vue';
import { defineStore } from 'pinia';
import { objectService } from '@/services';

export const useObjectStore = defineStore('objectStore', () => {
  // state
  const objectList = ref([] as Object[]);
  const selectedObject = ref({});

  // actions
  async function listObjects() {
    const response = await objectService.listObjects();
    objectList.value = response.data;
  }

  async function getObject(objectId: string) {
    await objectService.getObject(objectId);
  }

  async function readObject(objectId: string) {
    const response = await objectService.readObject(objectId);
    selectedObject.value = response.data;
  }

  return { objectList, selectedObject, listObjects, getObject };
});
