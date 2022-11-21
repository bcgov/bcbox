import { ref } from 'vue';
import { defineStore } from 'pinia';
import { userService } from '@/services';

export const useUserStore = defineStore('user', () => {
  const buckets = ref([] as Object[]);
  const idps = ref([] as Object[]);
  const loading = ref(false);

  function addBucket(bucket: Object) {
    buckets.value.push(bucket);
  }

  function removeBucket(bucket: Object) {
    const index = buckets.value.indexOf(bucket);
    if (index > -1) {
      buckets.value.splice(index, 1);
    }
  }

  async function listIdps() {
    try {
      loading.value = true;
      const res = await userService.listIdps();
      idps.value = res.data;
    } catch (error) {
      console.error(`listIdps error: ${error}`);
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Will 404. TODO DELETE
  async function testBad() {
    try {
      loading.value = true;
      await userService.testBad();
    } catch (error) {
      console.error(`bad error: ${error}`);
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return { buckets, idps, loading, addBucket, removeBucket, listIdps, testBad };
});
