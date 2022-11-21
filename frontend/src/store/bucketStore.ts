import { ref, isProxy, toRaw } from 'vue';
import { defineStore } from 'pinia';
import { bucketService } from '@/services';
import type { Bucket } from '@/interfaces';

export const useBucketStore = defineStore('bucket', () => {
  // state
  const loading = ref(false);
  const buckets = ref([] as Bucket[]);

  // actions
  async function load() {
    try {
      loading.value = true;
      const response = await bucketService.searchForBuckets();
      buckets.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  function getBucketInfo(bucketId: string) {
    let bucket = buckets.value.find((x) => x.bucketId === bucketId);
    if (isProxy(bucket)) {
      bucket = toRaw(bucket);
    }

    // TODO: Get unique list of users with management positions on the bucket

    return bucket;
  }

  return { loading, load, getBucketInfo, buckets };
});
