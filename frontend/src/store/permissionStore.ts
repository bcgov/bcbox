import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, unref } from 'vue';
import { useToast } from '@/lib/primevue';
import { permissionService, userService } from '@/services';
import { useAppStore, useConfigStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';

import type {
  BucketPermission,
  BucketPermissionsOptions,
  COMSObjectPermission,
  COMSObjectPermissionsOptions,
  IdentityProvider,
  Permission,
  User,
  UserPermissions,
} from '@/types';

export const usePermissionStore = defineStore('permission', () => {
  // Store
  const appStore = useAppStore();
  const { getConfig } = storeToRefs(useConfigStore());
  const toast = useToast();

  // State
  const bucketPermissions: Ref<Array<BucketPermission>> = ref([]);
  const mappedBucketToUserPermissions: Ref<Array<UserPermissions>> = ref([]);
  const mappedObjectToUserPermissions: Ref<Array<UserPermissions>> = ref([]);
  const objectPermissions: Ref<Array<COMSObjectPermission>> = ref([]);
  const permissions: Ref<Array<Permission>> = ref([]);

  // Getters
  const getBucketPermissions = computed(() => bucketPermissions.value);
  const getObjectPermissions = computed(() => objectPermissions.value);
  const getPermissions = computed(() => permissions.value);
  const getMappedBucketToUserPermissions = computed(() => mappedBucketToUserPermissions.value);
  const getMappedObjectToUserPermissions = computed(() => mappedObjectToUserPermissions.value);

  // Actions
  async function addBucketPermission(bucketId: string, userId: string, permCode: string) {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.bucketAddPermissions(bucketId, [{ userId, permCode }]);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error adding bucket permission', detail: error, life: 3000 });
    }
    finally {
      await fetchBucketPermissions();
      await mapBucketToUserPermissions(bucketId);
      appStore.endIndeterminateLoading();
    }
  }

  function addBucketUser(user: UserPermissions) {
    try {
      getMappedBucketToUserPermissions.value.push(user);
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error adding bucket user', detail: error, life: 3000 });
    }
  }

  async function addObjectPermission(objectId: string, userId: string, permCode: string) {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.objectAddPermissions(objectId, [{ userId, permCode }]);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error adding object permission', detail: error, life: 3000 });
    }
    finally {
      await fetchObjectPermissions();
      await mapObjectToUserPermissions(objectId);
      appStore.endIndeterminateLoading();
    }
  }

  function addObjectUser(user: UserPermissions) {
    try {
      getMappedObjectToUserPermissions.value.push(user);
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error adding object user', detail: error, life: 3000 });
    }
  }

  async function deleteBucketPermission(bucketId: string, userId: string, permCode: string) {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.bucketDeletePermission(bucketId, { userId, permCode });
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error deleting bucket permission', detail: error, life: 3000 });
    }
    finally {
      await fetchBucketPermissions();
      await mapBucketToUserPermissions(bucketId);
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteObjectPermission(objectId: string, userId: string, permCode: string) {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.objectDeletePermission(objectId, { userId, permCode });
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error deleting object permission', detail: error, life: 3000 });
    }
    finally {
      await fetchObjectPermissions();
      await mapObjectToUserPermissions(objectId);
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchBucketPermissions(params: BucketPermissionsOptions = {}) {
    try {
      const response = (await permissionService.bucketSearchPermissions(params)).data;
      const newPerms: Array<BucketPermission> = response.flatMap((x: any) => x.permissions);

      // Remove old values matching search parameters
      const matches = (x: BucketPermission) => (
        (!params.bucketId || x.bucketId === params.bucketId) &&
        (!params.userId || x.userId === params.userId) &&
        (!params.permCode || x.permCode === params.permCode)
      );

      const [match, difference] = partition(unref(bucketPermissions), matches);

      // Merge and assign
      bucketPermissions.value = difference.concat(newPerms);

      // Pass response back so bucketStore can handle bucketPerms=true correctly
      return response;
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching bucket permissions', detail: error, life: 3000 });
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchObjectPermissions(params: COMSObjectPermissionsOptions = {}) {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await permissionService.objectSearchPermissions(params)).data;

      const newPerms: Array<COMSObjectPermission> = response.flatMap((x: any) => x.permissions);

      // Remove old values matching search parameters
      const matches = (x: COMSObjectPermission) => (
        (!params.objId || x.id === params.objId) &&
        (!params.userId || x.userId === params.userId) &&
        (!params.permCode || x.permCode === params.permCode)
      );

      const [match, difference] = partition(unref(objectPermissions), matches);

      // Merge and assign
      objectPermissions.value = difference.concat(newPerms);

      // Pass response back so objectStore can handle objectPerms=true correctly
      return response;
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching object permissions', detail: error, life: 3000 });
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  const getBucketActionAllowed = (bucketId: string, userId?: string, permCode?: string) => {
    return bucketPermissions.value.some((x: BucketPermission) =>
      x.bucketId === bucketId && x.userId === userId && x.permCode === permCode);
  };

  const getObjectActionAllowed = (objectId: string, userId?: string, permCode?: string, bucketId?: string) => {
    const bucketPerm = bucketPermissions.value.some((x: BucketPermission) =>
      x.bucketId === bucketId && x.userId === userId && x.permCode === permCode);
    const objectPerm = objectPermissions.value.some((x: COMSObjectPermission) =>
      x.objectId === objectId && x.userId === userId && x.permCode === permCode);
    //console.log(`${objectId} ${userId} ${permCode} ${bucketId}`);

    //console.log(`${bucketPerm} ${objectPerm}`);
    return bucketPerm || objectPerm;
  };

  async function mapBucketToUserPermissions(bucketId: string) {
    try {
      appStore.beginIndeterminateLoading();
      const bucketPerms = bucketPermissions.value.filter((x: BucketPermission) => x.bucketId === bucketId);
      const uniqueIds = [...new Set(bucketPerms.map((x: BucketPermission) => x.userId))];
      const uniqueUsers: Array<User> = (await userService.searchForUsers({ userId: uniqueIds })).data;

      const hasPermission = (userId: string, permission: string) => {
        return bucketPerms.some((perm: BucketPermission) => perm.userId === userId && perm.permCode === permission);
      };

      const userPermissions: UserPermissions[] = [];
      uniqueUsers.forEach((user: User) => {
        const idp = getConfig.value.idpList.find((idp: IdentityProvider) => idp.idp === user.idp);

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

      mappedBucketToUserPermissions.value = userPermissions;
    }
    catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error mapping bucket permissions to user permissions',
        detail: error,
        life: 3000
      });
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function mapObjectToUserPermissions(objectId: string) {
    try {
      appStore.beginIndeterminateLoading();
      const objectPerms = objectPermissions.value.filter((x: COMSObjectPermission) => x.objectId === objectId);
      const uniqueIds = [...new Set(objectPerms.map((x: COMSObjectPermission) => x.userId))];
      const uniqueUsers: Array<User> = (await userService.searchForUsers({ userId: uniqueIds })).data;

      const hasPermission = (userId: string, permission: string) => {
        return objectPerms.some((perm: COMSObjectPermission) => perm.userId === userId && perm.permCode === permission);
      };

      const userPermissions: UserPermissions[] = [];
      uniqueUsers.forEach((user: User) => {
        const idp = getConfig.value.idpList.find((idp: IdentityProvider) => idp.idp === user.idp);

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

      mappedObjectToUserPermissions.value = userPermissions;
    }
    catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error mapping object permissions to user permissions',
        detail: error,
        life: 3000
      });
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function removeBucketUser(bucketId: string, userId: string) {
    try {
      appStore.beginIndeterminateLoading();
      for (const [, value] of Object.entries(Permissions)) {
        await permissionService.bucketDeletePermission(bucketId, { userId, permCode: value });
      }
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error removing bucket user', detail: error, life: 3000 });
    } finally {
      await fetchBucketPermissions();
      await mapBucketToUserPermissions(bucketId);
      appStore.endIndeterminateLoading();
    }
  }

  async function removeObjectUser(objectId: string, userId: string) {
    try {
      appStore.beginIndeterminateLoading();

      for (const [, value] of Object.entries(Permissions)) {
        await permissionService.objectDeletePermission(objectId, {
          userId,
          permCode: value,
        });
      }
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error removing object user', detail: error, life: 3000 });
    }
    finally {
      await fetchObjectPermissions();
      await mapObjectToUserPermissions(objectId);
      appStore.endIndeterminateLoading();
    }
  }


  return {
    // Getters
    getBucketPermissions,
    getObjectPermissions,
    getPermissions,
    getMappedBucketToUserPermissions,
    getMappedObjectToUserPermissions,

    // Actions
    addBucketPermission,
    addBucketUser,
    addObjectPermission,
    addObjectUser,
    deleteBucketPermission,
    deleteObjectPermission,
    fetchBucketPermissions,
    fetchObjectPermissions,
    getBucketActionAllowed,
    getObjectActionAllowed,
    mapBucketToUserPermissions,
    mapObjectToUserPermissions,
    removeBucketUser,
    removeObjectUser,
  };
});

export default usePermissionStore;
