import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { permissionService, userService } from '@/services';
import { useAppStore, useAuthStore, useConfigStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type {
  BucketPermission,
  BucketIdpPermission,
  BucketSearchPermissionsOptions,
  COMSObjectPermission,
  COMSObjectIdpPermission,
  ObjectSearchPermissionsOptions,
  IdentityProvider,
  Permission,
  User,
  UserPermissions
  // IdpPermissions
} from '@/types';

export type PermissionStoreState = {
  // user permissions
  bucketPermissions: Ref<Array<BucketPermission>>;
  mappedBucketToUserPermissions: Ref<Array<UserPermissions>>;
  mappedObjectToUserPermissions: Ref<Array<UserPermissions>>;
  objectPermissions: Ref<Array<COMSObjectPermission>>;
  // IDP permissions
  bucketIdpPermissions: Ref<any>;
  objectIdpPermissions: Ref<any>;
  // general permissions
  permissions: Ref<Array<Permission>>;
};

export const usePermissionStore = defineStore('permission', () => {
  // Store
  const appStore = useAppStore();
  const { getProfile } = storeToRefs(useAuthStore());
  const { getConfig } = storeToRefs(useConfigStore());
  const toast = useToast();

  // State
  const state: PermissionStoreState = {
    // user permissions
    bucketPermissions: ref([]),
    mappedBucketToUserPermissions: ref([]),
    mappedObjectToUserPermissions: ref([]),
    objectPermissions: ref([]),
    // IDP permissions
    bucketIdpPermissions: ref([]),
    objectIdpPermissions: ref([]),
    // general permissions
    permissions: ref([])
  };

  // Getters
  const getters = {
    // User permissions getters
    getObjectPermissions: computed(() => state.objectPermissions.value),
    getBucketPermissions: computed(() => state.bucketPermissions.value),
    getMappedBucketToUserPermissions: computed(() => state.mappedBucketToUserPermissions.value),
    getMappedObjectToUserPermissions: computed(() => state.mappedObjectToUserPermissions.value),
    getMappedObjectAndBucketToUserPermissions: computed(() => {
      const op = state.mappedObjectToUserPermissions.value.map((o) => {
        return { ...o, resource: 'object' };
      });
      const bp = state.mappedBucketToUserPermissions.value.map((b) => {
        return { ...b, resource: 'bucket' };
      });
      return op.concat(bp);
    }),
    // IDP permissions getters
    getObjectIdpPermissions: computed(() => state.objectIdpPermissions.value),
    getObjectInternal: computed(() => (objectId: string) => {
      return (
        state.objectIdpPermissions.value.filter(
          (p: any) => p.objectId === objectId && p.idp === 'idir' && p.permCode === 'READ'
        ).length > 0
      );
    }),
    getBucketIdpPermissions: computed(() => state.bucketIdpPermissions.value),
    // is object/bucket 'internal' (READ perm for all IDI users)
    getBucketInternal: computed(() => (bucketId: string) => {
      return (
        state.bucketIdpPermissions.value.filter(
          (p: any) => p.bucketId === bucketId && p.idp === 'idir' && p.permCode === 'READ'
        ).length > 0
      );
    }),
    getInternal: computed(() => (object: any) => {
      const objPerm =
        state.objectIdpPermissions.value.filter(
          (p: any) => p.objectId === object.id && p.idp === 'idir' && p.permCode === 'READ'
        ).length > 0;
      const bucketPerm =
        state.bucketIdpPermissions.value.filter(
          (p: any) => p.bucketId === object.bucketId && p.idp === 'idir' && p.permCode === 'READ'
        ).length > 0;
      return objPerm || bucketPerm;
    }),
    // General permissions getters
    getPermissions: computed(() => state.permissions.value)
  };

  // Actions
  async function addBucketPermission(bucketId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      // note: permission changes always cascade to subfolders for which current user has MANAGE permission
      await permissionService.bucketAddPermissions(bucketId, [{ userId, permCode }], { recursive: true });
    } catch (error: any) {
      toast.error('Adding bucket permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchBucketPermissions({ bucketId: bucketId });
      await mapBucketToUserPermissions(bucketId);
      appStore.endIndeterminateLoading();
    }
  }

  function addBucketUser(user: UserPermissions): void {
    try {
      getters.getMappedBucketToUserPermissions.value.push(user);
    } catch (error: any) {
      toast.error('Adding bucket user', error.response?.data.detail ?? error, { life: 0 });
    }
  }

  async function addObjectPermission(objectId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.objectAddPermissions(objectId, [{ userId, permCode }]);
    } catch (error: any) {
      toast.error('Adding object permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchObjectPermissions({ objectId: objectId });
      await mapObjectToUserPermissions(objectId);
      appStore.endIndeterminateLoading();
    }
  }

  async function addBucketIdpPermission(bucketId: string, idp: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      // note: permission changes always cascade to subfolders for which current user has MANAGE permission
      await permissionService.bucketAddIdpPermissions(bucketId, [{ idp, permCode }], { recursive: true });
    } catch (error: any) {
      toast.error('Adding bucket IDP permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchBucketIdpPermissions({ bucketId: bucketId });
      // await mapBucketToIdpPermissions(bucketId);
      appStore.endIndeterminateLoading();
    }
  }

  async function addObjectIdpPermission(objectId: string, idp: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.objectAddIdpPermissions(objectId, [{ idp, permCode }]);
    } catch (error: any) {
      toast.error('Adding object IDP permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchObjectIdpPermissions({ objectId: objectId });
      // await mapObjectToIdpPermissions(objectId);
      appStore.endIndeterminateLoading();
    }
  }

  function addObjectUser(user: UserPermissions): void {
    try {
      getters.getMappedObjectToUserPermissions.value.push(user);
    } catch (error: any) {
      toast.error('Adding object user', error.response?.data.detail ?? error, { life: 0 });
    }
  }

  async function deleteBucketPermission(bucketId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      // note: permission changes always cascade to subfolders for which current user has MANAGE permission
      await permissionService.bucketDeletePermission(bucketId, { userId, permCode, recursive: true });
    } catch (error: any) {
      toast.error('Deleting bucket permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchBucketPermissions({ bucketId: bucketId });
      await mapBucketToUserPermissions(bucketId);
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteObjectPermission(objectId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.objectDeletePermission(objectId, { userId, permCode });
    } catch (error: any) {
      toast.error('Deleting object permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchObjectPermissions({ objectId: objectId });
      await mapObjectToUserPermissions(objectId);
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteBucketIdpPermission(bucketId: string, idp: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      // note: permission changes always cascade to subfolders for which current user has MANAGE permission
      await permissionService.bucketDeleteIdpPermission(bucketId, { idp, permCode, recursive: true });
    } catch (error: any) {
      toast.error('Deleting bucket IDP permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchBucketIdpPermissions({ bucketId: bucketId });
      // await mapBucketToIdpPermissions(bucketId);
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteObjectIdpPermission(objectId: string, idp: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.objectDeleteIdpPermission(objectId, { idp, permCode });
    } catch (error: any) {
      toast.error('Deleting object IDP permission', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchObjectIdpPermissions({ objectId: objectId }); //
      // await mapObjectToIdpPermissions(objectId);
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchBucketPermissions(
    params: BucketSearchPermissionsOptions = {}
  ): Promise<Array<BucketPermission> | void> {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await permissionService.bucketSearchPermissions(params)).data;
      const newPerms: Array<BucketPermission> = response.flatMap((x: any) => x.permissions);

      // patch bucketPermissions state with latest perms from COMS
      const matches = (x: BucketPermission) =>
        (!params.bucketId || x.bucketId === params.bucketId || params.bucketId.includes(x.bucketId)) &&
        (!params.userId || x.userId === params.userId) &&
        (!params.permCode || x.permCode === params.permCode);
      const [, difference] = partition(state.bucketPermissions.value, matches);
      state.bucketPermissions.value = difference.concat(newPerms);

      // Pass response back so bucketStore can handle bucketPerms=true correctly
      return response;
    } catch (error: any) {
      toast.error('Fetching bucket permissions', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchObjectPermissions(
    params: ObjectSearchPermissionsOptions = {}
  ): Promise<Array<COMSObjectPermission> | undefined> {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await permissionService.objectSearchPermissions(params)).data;

      const newPerms: Array<COMSObjectPermission> = response.flatMap((x: any) => x.permissions);

      // patch objectPermissions state with latest perms from COMS
      const matches = (x: COMSObjectPermission) =>
        (!params.objectId || x.objectId === params.objectId || params.objectId.includes(x.objectId)) &&
        (!params.userId || x.userId === params.userId) &&
        (!params.permCode || x.permCode === params.permCode);
      const [, difference] = partition(state.objectPermissions.value, matches);
      state.objectPermissions.value = difference.concat(newPerms);

      // Pass response back so objectStore can handle bucketPerms=true correctly
      return response;
    } catch (error: any) {
      toast.error('Fetching object permissions', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function isBucketActionAllowed(bucketId: string, userId?: string, permCode?: string): boolean {
    // check user permissions
    const userPerm = state.bucketPermissions.value.some(
      (x: BucketPermission) => x.bucketId === bucketId && x.userId === userId && x.permCode === permCode
    );
    // check idp permissions
    const idp = getProfile.value?.identity_provider;
    const idpPerm = state.bucketIdpPermissions.value.some(
      (x: BucketIdpPermission) => x.bucketId === bucketId && x.idp === idp && x.permCode === permCode
    );

    return userPerm || idpPerm;
  }

  function isObjectActionAllowed(objectId: string, userId?: string, permCode?: string, bucketId?: string): boolean {
    // check user permissions
    const bucketUserPerm = state.bucketPermissions.value.some(
      (x: BucketPermission) => x.bucketId === bucketId && x.userId === userId && x.permCode === permCode
    );
    const objectUserPerm = state.objectPermissions.value.some(
      (x: COMSObjectPermission) => x.objectId === objectId && x.userId === userId && x.permCode === permCode
    );
    // check idp permissions
    const idp = getProfile.value?.identity_provider;
    const bucketIdpPerm = state.bucketIdpPermissions.value.some(
      (x: BucketIdpPermission) => x.bucketId === bucketId && x.idp === idp && x.permCode === permCode
    );
    const objectIdpPerm = state.objectIdpPermissions.value.some(
      (x: COMSObjectIdpPermission) => x.objectId === objectId && x.idp === idp && x.permCode === permCode
    );

    return bucketUserPerm || objectUserPerm || bucketIdpPerm || objectIdpPerm;
  }

  function isUserElevatedRights(): boolean {
    const idp = getConfig.value.idpList.find(
      (provider: IdentityProvider) => provider.idp === getProfile.value?.identity_provider
    );

    return !!idp?.elevatedRights;
  }

  async function mapBucketToUserPermissions(bucketId: string): Promise<void> {
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
        const configuredIdp = getConfig.value.idpList.find((idp: IdentityProvider) => idp.idp === user.idp);
        // If IDP is not specified in our IDP list config, assume it's BC Services Card
        const idp = configuredIdp?.name || 'BCSC';
        const idpElevated = configuredIdp?.elevatedRights || false;

        userPermissions.push({
          userId: user.userId,
          idp: idp,
          elevatedRights: idpElevated,
          fullName: user.fullName,
          create: hasPermission(user.userId, Permissions.CREATE),
          read: hasPermission(user.userId, Permissions.READ),
          update: hasPermission(user.userId, Permissions.UPDATE),
          delete: hasPermission(user.userId, Permissions.DELETE),
          manage: hasPermission(user.userId, Permissions.MANAGE)
        });
      });

      state.mappedBucketToUserPermissions.value = userPermissions;
    } catch (error: any) {
      toast.error('Mapping bucket permissions to user permissions', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function mapObjectToUserPermissions(objectId: string): Promise<void> {
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
        const configuredIdp = getConfig.value.idpList.find((idp: IdentityProvider) => idp.idp === user.idp);
        // If IDP is not specified in our IDP list config, assume it's BC Services Card
        const idp = configuredIdp?.name || 'BCSC';
        const idpElevated = configuredIdp?.elevatedRights || false;

        userPermissions.push({
          userId: user.userId,
          idp: idp,
          elevatedRights: idpElevated,
          fullName: user.fullName,
          create: hasPermission(user.userId, Permissions.CREATE),
          read: hasPermission(user.userId, Permissions.READ),
          update: hasPermission(user.userId, Permissions.UPDATE),
          delete: hasPermission(user.userId, Permissions.DELETE),
          manage: hasPermission(user.userId, Permissions.MANAGE)
        });
      });

      state.mappedObjectToUserPermissions.value = userPermissions;
    } catch (error: any) {
      toast.error('Mapping bucket permissions to user permissions', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchBucketIdpPermissions(params: any = {}): Promise<Array<any> | undefined> {
    try {
      appStore.beginIndeterminateLoading();

      const response = (await permissionService.bucketSearchIdpPermissions(params)).data;
      const newPerms: Array<any> = response.flatMap((x: any) => x.permissions);
      // patch bucketIdpPermissions state with latest perms from COMS
      const matches = (x: any) =>
        (!params.bucketId || x.bucketId === params.bucketId || params.bucketId.includes(x.bucketId)) &&
        (!params.idp || x.idp === params.idp) &&
        (!params.permCode || x.permCode === params.permCode);
      const [, difference] = partition(state.bucketIdpPermissions.value, matches);
      state.bucketIdpPermissions.value = difference.concat(newPerms);
      // Pass response back so bucketStore can handle bucketPerms=true correctly
      return response;
    } catch (error: any) {
      toast.error('Fetching bucket IDP permissions', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchObjectIdpPermissions(params: any = {}): Promise<Array<any> | undefined> {
    try {
      appStore.beginIndeterminateLoading();
      const response = (await permissionService.objectSearchIdpPermissions(params)).data;
      const newPerms: Array<any> = response.flatMap((x: any) => x.permissions);
      // patch objectIdpPermissions state with latest perms from COMS
      const matches = (x: any) =>
        (!params.objectId || x.objectId === params.objectId || params.objectId.includes(x.objectId)) &&
        (!params.idp || x.idp === params.idp) &&
        (!params.permCode || x.permCode === params.permCode);
      const [, difference] = partition(state.objectIdpPermissions.value, matches);
      state.objectIdpPermissions.value = difference.concat(newPerms);
      // Pass response back so objectStore can handle bucketPerms=true correctly
      return response;
    } catch (error: any) {
      toast.error('Fetching object permissions', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function removeBucketUser(bucketId: string, userId: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      for (const value of Object.values(Permissions)) {
        // note: permission changes always cascade to subfolders for which current user has MANAGE permission
        await permissionService.bucketDeletePermission(bucketId, { userId, permCode: value, recursive: true });
      }
    } catch (error: any) {
      toast.error('Removing bucket user', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchBucketPermissions({ bucketId: bucketId });
      await removeBucketUserMap(bucketId, userId);
      appStore.endIndeterminateLoading();
    }
  }

  async function removeBucketUserMap(bucketId: string, userId: string): Promise<void> {
    state.mappedBucketToUserPermissions.value = [
      ...state.mappedBucketToUserPermissions.value.filter(({ userId: id }) => id !== userId)
    ];
  }

  async function removeObjectUser(objectId: string, userId: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();

      for (const value of Object.values(Permissions)) {
        await permissionService.objectDeletePermission(objectId, {
          userId,
          permCode: value
        });
      }
    } catch (error: any) {
      toast.error('Removing object user', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      await fetchObjectPermissions({ objectId: objectId });
      await removeObjectUserMap(objectId, userId);
      appStore.endIndeterminateLoading();
    }
  }

  async function removeObjectUserMap(objectId: string, userId: string): Promise<void> {
    state.mappedObjectToUserPermissions.value = [
      ...state.mappedObjectToUserPermissions.value.filter(({ userId: id }) => id !== userId)
    ];
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
    isBucketActionAllowed,
    isObjectActionAllowed,
    isUserElevatedRights,
    mapBucketToUserPermissions,
    mapObjectToUserPermissions,
    removeBucketUser,
    removeObjectUser,
    addBucketIdpPermission,
    addObjectIdpPermission,
    fetchObjectIdpPermissions,
    fetchBucketIdpPermissions,
    deleteBucketIdpPermission,
    deleteObjectIdpPermission
  };
});

export default usePermissionStore;
