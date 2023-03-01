import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, unref } from 'vue';
import { useToast } from '@/lib/primevue';
import { bucketService } from '@/services';
import { useAppStore, usePermissionStore, useUserStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Bucket, BucketPermissionsOptions } from '@/types';

export const useBucketStore = defineStore('bucket', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const { currentUser } = storeToRefs(useUserStore());

  // State
  const buckets: Ref<Array<Bucket>> = ref([]);

  // Getters
  const getBuckets = computed(() => buckets.value);

  // Actions
  async function fetchBuckets(params: BucketPermissionsOptions) {
    try {
      appStore.beginIndeterminateLoading();

      if (currentUser.value) {
        // Get a unique list of bucket IDs the user has access to
        const permResponse = await permissionStore.fetchBucketPermissions(params);
        const uniqueIds = [...new Set(permResponse.map((x: { bucketId: string }) => x.bucketId))];

        let response = Array<Bucket>();
        if (uniqueIds.length) {
          response = (await bucketService.searchForBuckets({ bucketId: uniqueIds })).data;

          // Remove old values matching search parameters
          const matches = (x: Bucket) => (
            (!params.bucketId || x.bucketId === params.bucketId)
          );

          const [match, difference] = partition(unref(buckets), matches);

          // Merge and assign
          buckets.value = difference.concat(response);
        }
        else {
          buckets.value = response;
        }
      }
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching buckets', detail: error, life: 3000 });
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  const getBucketById = (bucketId: string) => buckets.value.find((x) => x.bucketId === bucketId);

  return {
    // Getters
    getBuckets,

    // Actions
    fetchBuckets,
    getBucketById,
  };
});

export default useBucketStore;
