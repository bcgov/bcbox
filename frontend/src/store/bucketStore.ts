import { ref, isProxy, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

import type { Bucket, UserPermission } from '@/interfaces';
import { bucketService, userService } from '@/services';
import { Permissions } from '@/utils/constants';
import { useConfigStore, useUserStore } from '@/store';

export const useBucketStore = defineStore('bucket', () => {
  const { userId } = storeToRefs(useUserStore());
  const { config } = storeToRefs(useConfigStore());

  // state
  const loading = ref(false);
  const buckets = ref([] as Bucket[]);
  const permissions = ref([] as UserPermission[]);

  // actions
  async function load() {
    try {
      loading.value = true;

      if (userId.value) {
        const permResponse = (await bucketService.searchForPermissions({
          userId: userId.value,
          objectPerms: true
        })).data;
        const uniqueIds = [...new Set(permResponse.map((x: { bucketId: string }) => x.bucketId))];
        const response = await bucketService.searchForBuckets({ bucketId: uniqueIds });
        buckets.value = response.data;
      }
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

  async function getBucketPermissions(bucketId: string) {
    try {
      loading.value = true;

      const searchPerms = (await bucketService.searchForPermissions({ bucketId })).data;

      if (searchPerms[0]) {
        const perms = searchPerms[0].permissions;

        // TODO: Feed a comma separated list instead of searching individual users once COMS accepts that
        // const uniqueIds = [...new Set(perms.map((x: any) => x.userId))].join(',');
        // const uniqueUsers = await userService.searchForUsers({ userId: uniqueIds });

        const uniqueIds = [...new Set(perms.map((x: any) => x.userId))];
        const uniqueUsers: any = [];

        await Promise.all(
          uniqueIds.map(async (x: any) => {
            const userResponse = await userService.searchForUsers({ userId: x });
            uniqueUsers.push(userResponse.data[0]);
          })
        );

        const userPermissions: UserPermission[] = [];
        uniqueUsers.forEach((user: any) => {
          userPermissions.push({
            userId: user.userId,
            elevatedRights: config.value.idpList.find((idp: any) => idp.idp === user.idp)?.elevatedRights ?? false,
            fullName: user.fullName,
            create: perms.some((perm: any) => perm.userId === user.userId && perm.permCode === Permissions.CREATE),
            read: perms.some((perm: any) => perm.userId === user.userId && perm.permCode === Permissions.READ),
            update: perms.some((perm: any) => perm.userId === user.userId && perm.permCode === Permissions.UPDATE),
            delete: perms.some((perm: any) => perm.userId === user.userId && perm.permCode === Permissions.DELETE),
            manage: perms.some((perm: any) => perm.userId === user.userId && perm.permCode === Permissions.MANAGE),
          });
        });

        permissions.value = userPermissions;
      }
    } finally {
      loading.value = false;
    }
  }

  async function addBucketPermission(bucketId: string, userId: string, permCode: string) {
    try {
      loading.value = true;

      await bucketService.addPermissions(bucketId, [{ userId, permCode }]);
    } finally {
      loading.value = false;
    }
  }

  async function deleteBucketPermission(bucketId: string, userId: string, permCode: string) {
    try {
      loading.value = true;

      await bucketService.deletePermission(bucketId, { userId, permCode });
    } finally {
      loading.value = false;
    }
  }

  async function removeBucketUser(bucketId: string, userId: string) {
    try {
      loading.value = true;

      for (const [, value] of Object.entries(Permissions)) {
        await bucketService.deletePermission(bucketId, { userId, permCode: value });
      }

      await getBucketPermissions(bucketId);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    load,
    getBucketInfo,
    getBucketPermissions,
    addBucketPermission,
    deleteBucketPermission,
    removeBucketUser,
    buckets,
    permissions
  };
});
