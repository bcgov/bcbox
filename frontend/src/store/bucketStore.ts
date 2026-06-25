import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { bucketService } from '@/services';
import { useAppStore, useAuthStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { getBucketPath } from '@/utils/utils';

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
    getBuckets: computed(() => state.buckets.value),
    isTopBucket: computed(() => (bucketId: string) => {
      const allBuckets = state.buckets.value;
      const bucket = allBuckets.find((b) => b.bucketId === bucketId);
      return bucket
        ? allBuckets.filter((b) => b.bucket === bucket.bucket).every((b) => bucket.key.length <= b.key.length)
        : false;
    })
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
      const response = (await bucketService.fetchBucket(bucketId)).data;
      const matches = (x: Bucket) => x.bucketId === response.bucketId;
      const remainingBuckets = state.buckets.value.filter((x) => !matches(x));
      state.buckets.value = remainingBuckets.concat([response]);
      return response;
    } catch (error: any) {
      toast.error('Getting bucket', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  /**
   * function does the following in order:
   * - fetches bucket permissions
   * - adds bucket permissions to the permission store
   * - pass bucketId's (from list of permissions) to searchBuckets()
   * - add buckets to store (skipping existing matches)
   * @param params search parameters
   * @returns an array of matching buckets found
   */
  async function fetchBuckets(params?: BucketSearchPermissionsOptions) {
    try {
      appStore.beginIndeterminateLoading();

      // Get a unique list of bucket IDs the user has access to
      // based on user permissions..
      const userPermResponse = await permissionStore.fetchBucketPermissions({ ...params, idp: undefined });
      //  and check IDP permissions (if current user's idp is provided in params)
      const IdpPermResponse = params?.idp
        ? await permissionStore.fetchBucketIdpPermissions({ ...params, userId: undefined })
        : undefined;

      // if permissions found
      if (userPermResponse || IdpPermResponse) {
        const uniqueIds: Array<string> = [
          ...new Set<string>(
            userPermResponse
              ?.map((x: { bucketId: string }) => x.bucketId)
              .concat(IdpPermResponse?.map((x: { bucketId: string }) => x.bucketId) || [])
          )
        ];

        let response = Array<Bucket>();
        if (uniqueIds.length) {
          response = (await bucketService.searchBuckets({ bucketId: uniqueIds })).data;

          // merge new buckets into state, skipping any existing matches based on bucketId
          const matches = (x: Bucket) => !params?.bucketId || params.bucketId.includes(x.bucketId);
          const remaining = state.buckets.value.filter((x) => !matches(x));

          state.buckets.value = remaining.concat(response);
        }
        return response;
      } else return [];
    } catch (error: any) {
      toast.error('Fetching buckets', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function refreshBucketList() {
    // fetch buckets with current user's READ permission (enforced by COMS privacy mode)
    const buckets = await fetchBuckets({
      userId: authStore.getUserId,
      objectPerms: true
    });

    // get all subfolders of each bucket based on current user's IDP,
    // so they show up in the folder tree
    if (buckets && buckets.length > 0 && usePermissionStore().isUserElevatedRights()) {
      const uniqueBuckets = buckets.filter(
        (b, i, arr) => arr.findIndex((item) => item.bucket === b.bucket && item.endpoint === b.endpoint) === i
      );
      uniqueBuckets.forEach(async (bucket) => {
        const allFolders = (
          await bucketService.searchBuckets({
            endpoint: bucket.endpoint,
            bucket: bucket.bucket
          })
        ).data;
        await fetchBuckets({
          bucketId: allFolders.slice(0, 1000).map((b: any) => b.bucketId),
          userId: authStore.getUserId,
          idp: (authStore.getProfile as any)?.identity_provider,
          permCode: Permissions.READ,
          objectPerms: true
        });
      });
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
    refreshBucketList,
    syncBucket,
    syncBucketStatus,
    togglePublic,
    updateBucket
  };
});

export default useBucketStore;
