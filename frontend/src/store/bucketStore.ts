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
    getBucket: computed(() => (id: string) => state.buckets.value.find((bucket) => bucket.bucketId === id)),
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

  async function deleteBucket(bucketId: string, recursive: boolean){
    try {
      appStore.beginIndeterminateLoading();
      await bucketService.deleteBucket(bucketId, recursive );
      toast.success('', 'Folder deleted');
    } catch (error: any) {
      toast.error('Unable to delete folder', error);
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
        if (uniqueIds.length) {
          response = (await bucketService.searchBuckets({ bucketId: uniqueIds })).data;
        }

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

  async function updateBucket(bucketId: string, bucket: Bucket) {
    try {
      appStore.beginIndeterminateLoading();

      return (await bucketService.updateBucket(bucketId, bucket)).data;
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function syncBucket(bucketId: string, recursive: boolean) {
    try {
      appStore.beginIndeterminateLoading();

      await bucketService.syncBucket(bucketId, recursive );
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
    syncBucket,
    updateBucket
  };
});

export default useBucketStore;
