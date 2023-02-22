import { computed, ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

import { bucketService } from '@/services';
import { useAppStore, usePermissionStore, useUserStore } from '@/store';

import type { Ref } from 'vue';
import type { Bucket, BucketPermission } from '@/interfaces';

export const useBucketStore = defineStore('bucket', () => {
  // Store
  const { getBucketPermissions } = storeToRefs(usePermissionStore());
  const { getConfig } = useConfigStore();
  const { currentUser } = storeToRefs(useUserStore());

  // State
  const buckets: Ref<Array<Bucket>> = ref([]);

  // Computed Getters
  const getBuckets = computed(() => buckets.value);

  // Getters
  const getBucketById = (bucketId: string) => buckets.value.find((x) => x.bucketId === bucketId);

  // Actions
  async function fetchBuckets() {
    try {
      useAppStore().beginLoading();

      if (currentUser.value) {
        const bucketPerms = getBucketPermissions.value.filter((x: BucketPermission) =>
          x.userId === currentUser.value?.userId
        );
        const uniqueIds = [...new Set(bucketPerms.map((x: { bucketId: string }) => x.bucketId))];
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

  return {
    // Computed Getters
    getBuckets,

    // Getters
    getBucketById,

    // Actions
    fetchBuckets
  };
});

export default useBucketStore;
