import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { permissionService, userService } from '@/services';
import { useAppStore, useConfigStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type {
  BucketPermission,
  BucketSearchPermissionsOptions,
  COMSObjectPermission,
  ObjectSearchPermissionsOptions,
  IdentityProvider,
  Permission,
  User,
  UserPermissions,
} from '@/types';

export type PermissionStoreState = {
  bucketPermissions: Ref<Array<BucketPermission>>;
  mappedBucketToUserPermissions: Ref<Array<UserPermissions>>;
  mappedObjectToUserPermissions: Ref<Array<UserPermissions>>;
  objectPermissions: Ref<Array<COMSObjectPermission>>;
  permissions: Ref<Array<Permission>>;
}

export const usePermissionStore = defineStore('permission', () => {
  // Store
  const appStore = useAppStore();
  const { getConfig } = storeToRefs(useConfigStore());
  const toast = useToast();

  // State
  const state: PermissionStoreState = {
    bucketPermissions: ref([]),
    mappedBucketToUserPermissions: ref([]),
    mappedObjectToUserPermissions: ref([]),
    objectPermissions: ref([]),
    permissions: ref([])
  };

  // Getters
  const getters = {
    getBucketPermissions: computed(() => state.bucketPermissions.value),
    getMappedBucketToUserPermissions: computed(() => state.mappedBucketToUserPermissions.value),
    getMappedObjectToUserPermissions: computed(() => state.mappedObjectToUserPermissions.value),
    getObjectPermissions: computed(() => state.objectPermissions.value),
    getPermissions: computed(() => state.permissions.value)
  };

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
      getters.getMappedBucketToUserPermissions.value.push(user);
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
      getters.getMappedObjectToUserPermissions.value.push(user);
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

  async function fetchBucketPermissions(params: BucketSearchPermissionsOptions = {}) {
    try {
      const response = (await permissionService.bucketSearchPermissions(params)).data;
      const newPerms: Array<BucketPermission> = response.flatMap((x: any) => x.permissions);

      // Remove old values matching search parameters
      const matches = (x: BucketPermission) => (
        (!params.bucketId || x.bucketId === params.bucketId) &&
        (!params.userId || x.userId === params.userId) &&
        (!params.permCode || x.permCode === params.permCode)
      );

      const [match, difference] = partition(state.bucketPermissions.value, matches);

      // Merge and assign
      state.bucketPermissions.value = difference.concat(newPerms);

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

  async function fetchObjectPermissions(params: ObjectSearchPermissionsOptions = {}) {
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

      const [match, difference] = partition(state.objectPermissions.value, matches);

      // Merge and assign
      state.objectPermissions.value = difference.concat(newPerms);

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

  const getIsBucketActionAllowed = (bucketId: string, userId?: string, permCode?: string) => {
    return state.bucketPermissions.value.some((x: BucketPermission) =>
      x.bucketId === bucketId && x.userId === userId && x.permCode === permCode);
  };

  const getIsObjectActionAllowed = (objectId: string, userId?: string, permCode?: string, bucketId?: string) => {
    const bucketPerm = state.bucketPermissions.value.some((x: BucketPermission) =>
      x.bucketId === bucketId && x.userId === userId && x.permCode === permCode);
    const objectPerm = state.objectPermissions.value.some((x: COMSObjectPermission) =>
      x.objectId === objectId && x.userId === userId && x.permCode === permCode);

    return bucketPerm || objectPerm;
  };

  async function mapBucketToUserPermissions(bucketId: string) {
    try {
      appStore.beginIndeterminateLoading();
      const bucketPerms = state.bucketPermissions.value.filter((x: BucketPermission) => x.bucketId === bucketId);
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

      state.mappedBucketToUserPermissions.value = userPermissions;
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
      const objectPerms = state.objectPermissions.value.filter((x: COMSObjectPermission) => x.objectId === objectId);
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

      state.mappedObjectToUserPermissions.value = userPermissions;
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
      for (const value of Object.values(Permissions)) {
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

      for (const value of Object.values(Permissions)) {
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
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    addBucketPermission,
    addBucketUser,
    addObjectPermission,
    addObjectUser,
    deleteBucketPermission,
    deleteObjectPermission,
    fetchBucketPermissions,
    fetchObjectPermissions,
    getIsBucketActionAllowed,
    getIsObjectActionAllowed,
    mapBucketToUserPermissions,
    mapObjectToUserPermissions,
    removeBucketUser,
    removeObjectUser,
  };
}, { persist: true });

export default usePermissionStore;
