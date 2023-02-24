import { computed, ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

import { bucketService } from '@/services';
import { useAppStore, usePermissionStore, useUserStore } from '@/store';

import type { Ref } from 'vue';
import type { Bucket } from '@/interfaces';
import type { BucketPermissionsOptions } from '@/types';

export const useBucketStore = defineStore('bucket', () => {
  // Store
  const permissionStore = usePermissionStore();
  const { currentUser } = storeToRefs(useUserStore());

  // State
  const buckets: Ref<Array<Bucket>> = ref([]);

  // Getters
  const getBuckets = computed(() => buckets.value);

  // Actions
  async function fetchBuckets(params: BucketPermissionsOptions) {
    try {
      useAppStore().beginLoading();

      if (currentUser.value) {
        const permResponse = await permissionStore.fetchBucketPermissions(params);

        const uniqueIds = [...new Set(permResponse.map((x: { bucketId: string }) => x.bucketId))];
        let response = Array<Bucket>();
        if (uniqueIds.length) {
          response = (await bucketService.searchForBuckets({ bucketId: uniqueIds })).data;
        }
        buckets.value = response;
      }
    } finally {
      useAppStore().endLoading();
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
