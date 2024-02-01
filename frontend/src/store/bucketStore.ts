import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { bucketService } from '@/services';
import { useAppStore, usePermissionStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Bucket, BucketSearchPermissionsOptions } from '@/types';

export type BucketStoreState = {
  buckets: Ref<Array<Bucket>>;
};

export const useBucketStore = defineStore('bucket', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();

  // State
  const state: BucketStoreState = {
    buckets: ref([])
  };

  // Getters
  const getters = {
    getBuckets: computed(() => state.buckets.value)
  };

  // Actions
  async function createBucket(bucket: Bucket) {
    try {
      appStore.beginIndeterminateLoading();

      return (await bucketService.createBucket(bucket)).data;
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function createBucketChild(parentBucketId: string, subKey: string, bucketName: string) {
    try {
      appStore.beginIndeterminateLoading();
      return await bucketService.createBucketChild(parentBucketId, subKey, bucketName);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteBucket(bucketId: string) {
    try {
      appStore.beginIndeterminateLoading();

      await bucketService.deleteBucket(bucketId);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }
  /**
   * function does the following in order:
   * - fetches bucket permissions
   *   (fetchBucketPermissions() also add bucket permissions to the permission store)
   * - pass bucketId's of buckets with a permission to searchBuckets()
   * - add buckets to store (skipping existing matches)
   * @param params search parameters
   * @returns an array of matching buckets found
   */
  async function fetchBuckets(params?: BucketSearchPermissionsOptions) {
    try {
      appStore.beginIndeterminateLoading();

      // Get a unique list of bucket IDs the user has access to
      const permResponse = await permissionStore.fetchBucketPermissions(params);
      // if permissions found
      if (permResponse) {
        const uniqueIds: Array<string> = [
          ...new Set<string>(permResponse.map((x: { bucketId: string }) => x.bucketId))
        ];

        let response = Array<Bucket>();
        response = (await bucketService.searchBuckets({ bucketId: uniqueIds })).data;

        // Remove old values matching search parameters
        const matches = (x: Bucket) => !params?.bucketId || x.bucketId === params.bucketId;

        const [, difference] = partition(state.buckets.value, matches);

        // Merge and assign
        state.buckets.value = difference.concat(response);
        return response;
      } else return [];
    } catch (error: any) {
      toast.error('Fetching buckets', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function findBucketById(bucketId: string) {
    return state.buckets.value.find((x) => x.bucketId === bucketId);
  }

  async function updateBucket(bucketId: string, bucket: Bucket) {
    try {
      appStore.beginIndeterminateLoading();

      return (await bucketService.updateBucket(bucketId, bucket)).data;
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function syncBucket(bucketId: string) {
    try {
      appStore.beginIndeterminateLoading();

      await bucketService.syncBucket(bucketId);
      toast.success('', 'Sync is in queue and will begin soon');
    } catch (error: any) {
      toast.error('Unable to sync', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    createBucket,
    createBucketChild,
    deleteBucket,
    fetchBuckets,
    findBucketById,
    syncBucket,
    updateBucket
  };
});

export default useBucketStore;
