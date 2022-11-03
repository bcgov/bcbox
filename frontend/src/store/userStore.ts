import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const buckets = ref([] as Object[]);

  function addBucket(bucket: Object) {
    buckets.value.push(bucket);
  }

  function removeBucket(bucket: Object) {
    const index = buckets.value.indexOf(bucket);
    if (index > -1) {
      buckets.value.splice(index, 1);
    }
  }

  return { buckets, addBucket, removeBucket };
});
