import { ref, isProxy, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

import { bucketService, permissionService, userService } from '@/services';
import { Permissions } from '@/utils/constants';
import { useConfigStore, useUserStore } from '@/store';

import type { Ref } from 'vue';
import type { Bucket, IdentityProvider, Permission, User, UserPermissions } from '@/interfaces';

export const useBucketStore = defineStore('bucket', () => {
  const { config } = storeToRefs(useConfigStore());
  const { currentUser } = storeToRefs(useUserStore());

  // state
  const loading: Ref<boolean> = ref(false);
  const buckets: Ref<Array<Bucket>> = ref([]);
  const permissions: Ref<Array<UserPermissions>> = ref([]);
  const selectedBucketPermissionsForUser: Ref<Array<Permission>> = ref([]);

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
        let response = Array<Bucket>();
        if (uniqueIds.length) {
          response = (await bucketService.searchForBuckets({ bucketId: uniqueIds })).data;
          response.forEach((x: Bucket) => {
            x.userPermissions = permResponse.find((p: any) => p.bucketId === x.bucketId)?.permissions;
          });
        }
        buckets.value = response;
      }
    } finally {
      loading.value = false;
    }
  }

  async function getBucketInfo(bucketId: string) {
    if (!buckets.value.length) {
      await load();
    }
    let bucket = buckets.value.find((x) => x.bucketId === bucketId);
    if (isProxy(bucket)) {
      bucket = toRaw(bucket);
    }

    // TODO: Get unique list of users with management positions on the bucket

    return bucket;
  }

  // Get the set of permissions for a bucket
  async function getBucketPermissions(bucketId: string) {
    try {
      loading.value = true;

      const searchPerms = (await permissionService.bucketSearchPermissions({ bucketId })).data;

      if (searchPerms[0]) {
        const perms = searchPerms[0].permissions;

        const uniqueIds = [...new Set(perms.map((x: Permission) => x.userId))];
        const uniqueUsers: Array<User> = (await userService.searchForUsers({ userId: uniqueIds })).data;

        const hasPermission = (userId: string, permission: string) => {
          return perms.some((perm: any) => perm.userId === userId && perm.permCode === permission);
        };

        const userPermissions: UserPermissions[] = [];
        uniqueUsers.forEach((user: User) => {
          const idp = config.value.idpList.find((idp: IdentityProvider) => idp.idp === user.idp);

          userPermissions.push({
            userId: user.userId,
            idpName: idp?.name,
            elevatedRights: idp?.elevatedRights,
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

  // Get a user's bucket permissions
  async function getBucketPermissionsForUser(bucketId: string) {
    try {
      loading.value = true;

      if (currentUser.value) {
        const bucketPerms =
          (await permissionService.bucketSearchPermissions({ bucketId, userId: currentUser.value.userId })).data;
        if (bucketPerms && bucketPerms[0] && bucketPerms[0].permissions) {
          selectedBucketPermissionsForUser.value = bucketPerms[0].permissions;
        }
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
    getBucketPermissionsForUser,
    addBucketPermission,
    deleteBucketPermission,
    removeBucketUser,
    buckets,
    permissions,
    selectedBucketPermissionsForUser
  };
});
