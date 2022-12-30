import { ref } from 'vue';
import { defineStore } from 'pinia';
import { userService } from '@/services';

export const useUserStore = defineStore('user', () => {
  const idps = ref([] as Object[]);
  const loading = ref(false);

  // TODO: Implement stub function
  function addBucket(values: { bucketId: string, accessKeyId: string, bucketName: string, bucket: string }) {
    return values;
  }

  async function listIdps() {
    try {
      loading.value = true;
      const res = await userService.listIdps();
      idps.value = res.data;
    } catch (error) {
      console.error(`listIdps error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // TODO: Will 404. TODO DELETE
  async function testBad() {
    try {
      loading.value = true;
      await userService.testBad();
    } catch (error) {
      console.error(`bad error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return { addBucket, idps, loading, listIdps, testBad };
});
