import { ref, isProxy, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

import type { Bucket, IdentityProvider, Permission, User, UserPermissions } from '@/interfaces';
import { bucketService, permissionService, userService } from '@/services';
import { Permissions } from '@/utils/constants';
import { useConfigStore, useUserStore } from '@/store';

export const useBucketStore = defineStore('bucket', () => {
  const { currentUser } = storeToRefs(useUserStore());
  const { config } = storeToRefs(useConfigStore());

  // state
  const loading = ref(false);
  const buckets = ref([] as Bucket[]);
  const permissions = ref([] as UserPermissions[]);

  // actions
  async function load() {
    try {
      loading.value = true;

      if (currentUser.value) {
        const permResponse = (await permissionService.bucketSearchPermissions({
          userId: currentUser.value.userId,
          objectPerms: true
        })).data;
        const uniqueIds = [...new Set(permResponse.map((x: { bucketId: string }) => x.bucketId))];
        let response = [] as Bucket[];
        if (uniqueIds.length) {
          response = (await bucketService.searchForBuckets({ bucketId: uniqueIds })).data;
        }
        buckets.value = response;
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

      const searchPerms = (await permissionService.bucketSearchPermissions({ bucketId })).data;

      if (searchPerms[0]) {
        const perms = searchPerms[0].permissions;

        // TODO: Feed a comma separated list instead of searching individual users once COMS accepts that
        // const uniqueIds = [...new Set(perms.map((x: any) => x.userId))].join(',');
        // const uniqueUsers = await userService.searchForUsers({ userId: uniqueIds });

        const uniqueIds = [...new Set(perms.map((x: Permission) => x.userId))];
        const uniqueUsers: User[] = [];

        await Promise.all(
          uniqueIds.map(async (x: any) => {
            const userResponse = await userService.searchForUsers({ userId: x });
            uniqueUsers.push(userResponse.data[0]);
          })
        );

        const hasPermission = (userId: string, permission: string) => {
          return perms.some((perm: any) => perm.userId === userId && perm.permCode === permission);
        };

        const userPermissions: UserPermissions[] = [];
        uniqueUsers.forEach((user: User) => {
          userPermissions.push({
            userId: user.userId,
            elevatedRights: config.value.idpList.find((idp: IdentityProvider) => idp.idp === user.idp)?.elevatedRights,
            fullName: user.fullName,
            create: hasPermission(user.userId, Permissions.CREATE),
            read: hasPermission(user.userId, Permissions.READ),
            update: hasPermission(user.userId, Permissions.UPDATE),
            delete: hasPermission(user.userId, Permissions.DELETE),
            manage: hasPermission(user.userId, Permissions.MANAGE),
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

      await permissionService.bucketAddPermissions(bucketId, [{ userId, permCode }]);
    } finally {
      loading.value = false;
    }
  }

  async function deleteBucketPermission(bucketId: string, userId: string, permCode: string) {
    try {
      loading.value = true;

      await permissionService.bucketDeletePermission(bucketId, { userId, permCode });
    } finally {
      loading.value = false;
    }
  }

  async function removeBucketUser(bucketId: string, userId: string) {
    try {
      loading.value = true;

      for (const [, value] of Object.entries(Permissions)) {
        await permissionService.bucketDeletePermission(bucketId, { userId, permCode: value });
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
