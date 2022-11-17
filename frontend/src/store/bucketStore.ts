import { ref, isProxy, toRaw } from 'vue';
import { defineStore } from 'pinia';
import { bucketService } from '@/services';

export const useBucketStore = defineStore('bucket', () => {
  // state
  const buckets = ref([] as Object[]);

  // actions
  async function load() {
    const response = await bucketService.searchForBuckets();
    buckets.value = response.data;
  }

  async function getBucketInfo(bucketId: any) {
    let bucket = buckets.value.find((x: any) => x.bucketId === bucketId);
    if (isProxy(bucket)) {
      bucket = toRaw(bucket);
    }

    // TODO: Get unique list of users with management positions on the bucket

    return bucket;
  }

  return { load, getBucketInfo, buckets };
});
