import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { bucketService } from '@/services';
import { useAppStore, useAuthStore, usePermissionStore } from '@/store';
import { getBucketPath, partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Bucket, BucketSearchPermissionsOptions } from '@/types';

export type BucketStoreState = {
  buckets: Ref<Array<Bucket>>;
};

export const useBucketStore = defineStore('bucket', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // State
  const state: BucketStoreState = {
    buckets: ref([])
  };

  // Getters
  const getters = {
    getBucket: computed(() => (id: string) => state.buckets.value.find((bucket) => bucket.bucketId === id)),
    getBucketByFullPath: computed(
      () => (fullPath: string) => state.buckets.value.find((bucket) => getBucketPath(bucket) === fullPath)
    ),
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

  async function deleteBucket(bucketId: string, recursive: boolean) {
    try {
      appStore.beginIndeterminateLoading();
      await bucketService.deleteBucket(bucketId, recursive);
      toast.success('', 'Folder deleted');
    } catch (error: any) {
      toast.error('Unable to delete folder', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchBucket(bucketId: string) {
    try {
      appStore.beginIndeterminateLoading();
      return bucketService.fetchBucket(bucketId).then((response) => response.data);
      // return {};
    } catch (error: any) {
      toast.error('Getting bucket', error);
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
      toast.error('Fetching buckets', error.response?.data.detail ?? error, { life: 0 });
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

  async function togglePublic(bucketId: string, isPublic: boolean) {
    try {
      appStore.beginIndeterminateLoading();
      await bucketService.togglePublic(bucketId, isPublic);
      await fetchBuckets({ userId: authStore.getUserId, objectPerms: true });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function syncBucket(bucketId: string, recursive: boolean) {
    try {
      appStore.beginIndeterminateLoading();
      return await bucketService.syncBucket(bucketId, recursive);
    } catch (error: any) {
      throw new Error('Unable to Sync folder');
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function syncBucketStatus(bucketId: string) {
    try {
      appStore.beginIndeterminateLoading();
      const response = await bucketService.syncBucketStatus({ bucketId });
      return response.data;
    } catch (error: any) {
      toast.error('Unable to get sync status', error.response?.data.detail ?? error, { life: 0 });
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
    fetchBucket,
    // fetchPublicBucket,
    fetchBuckets,
    syncBucket,
    syncBucketStatus,
    togglePublic,
    updateBucket
  };
});

export default useBucketStore;
