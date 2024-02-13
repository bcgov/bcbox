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
  BucketSearchPermissionsOptions,
  COMSObjectPermission,
  ObjectSearchPermissionsOptions,
  IdentityProvider,
  User,
  UserPermissions
} from '@/types';

export type PermissionStoreState = {
  bucketPermissions: Ref<Array<BucketPermission>>;
  mappedBucketToUserPermissions: Ref<Array<UserPermissions>>;
  mappedObjectToUserPermissions: Ref<Array<UserPermissions>>;
  objectPermissions: Ref<Array<COMSObjectPermission>>;
};

export const usePermissionStore = defineStore('permission', () => {
  // Store
  const appStore = useAppStore();
  const { getProfile } = storeToRefs(useAuthStore());
  const { getConfig } = storeToRefs(useConfigStore());
  const toast = useToast();

  // State
  const state: PermissionStoreState = {
    bucketPermissions: ref([]),
    mappedBucketToUserPermissions: ref([]),
    mappedObjectToUserPermissions: ref([]),
    objectPermissions: ref([])
  };

  // Getters
  const getters = {
    getBucketPermissions: computed(() => state.bucketPermissions.value),
    getMappedBucketToUserPermissions: computed(() => state.mappedBucketToUserPermissions.value),
    getMappedObjectToUserPermissions: computed(() => state.mappedObjectToUserPermissions.value),
    getObjectPermissions: computed(() => state.objectPermissions.value)
  };

  // Actions
  async function addBucketPermission(bucketId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      const newPermission = (await permissionService.bucketAddPermissions(bucketId, [{ userId, permCode }])).data[0];
      // add new permission to store
      state.bucketPermissions.value.push(newPermission);
      // map new permission
      var foundIndex = state.mappedBucketToUserPermissions.value.findIndex((x) => x.userId === userId);
      state.mappedBucketToUserPermissions.value[foundIndex][permCode.toLowerCase()] = true;
    } catch (error: any) {
      toast.error('Adding bucket permission', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function addBucketUser(user: UserPermissions): void {
    try {
      state.mappedBucketToUserPermissions.value.push(user);
    } catch (error: any) {
      toast.error('Adding bucket user', error);
    }
  }

  // TODO: follow same patter as addBucketPermission() above
  async function addObjectPermission(objectId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      await permissionService.objectAddPermissions(objectId, [{ userId, permCode }]);

      const forceToggleReadOn: Array<string> = [Permissions.UPDATE, Permissions.DELETE, Permissions.MANAGE];
      if (forceToggleReadOn.some((x: string) => x === permCode)) {
        await permissionService.objectAddPermissions(objectId, [{ userId, permCode: Permissions.READ }]);
      }
    } catch (error: any) {
      toast.error('Adding object permission', error);
    } finally {
      await fetchObjectPermissions();

      const initialPerms = [...state.mappedObjectToUserPermissions.value];
      await mapObjectToUserPermissions(objectId);
      const afterPerms = [...state.mappedObjectToUserPermissions.value];

      const results = initialPerms.filter(({ userId: id1 }) => !afterPerms.some(({ userId: id2 }) => id2 === id1));
      state.mappedObjectToUserPermissions.value = state.mappedObjectToUserPermissions.value.concat(results);

      appStore.endIndeterminateLoading();
    }
  }

  function addObjectUser(user: UserPermissions): void {
    try {
      state.getMappedObjectToUserPermissions.value.push(user);
    } catch (error: any) {
      toast.error('Adding object user', error);
    }
  }

  async function deleteBucketPermission(bucketId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      const deletedPerm = (await permissionService.bucketDeletePermission(bucketId, { userId, permCode })).data;
      // remove from store
      state.bucketPermissions.value = state.bucketPermissions.value.filter((p) => p.id !== deletedPerm[0].id);
      // un-map
      var userIndex = state.mappedBucketToUserPermissions.value.findIndex((x) => x.userId === userId);
      state.mappedBucketToUserPermissions.value[userIndex][permCode.toLowerCase()] = false;
    } catch (error: any) {
      toast.error('Deleting bucket permission', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteObjectPermission(objectId: string, userId: string, permCode: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      const deletedPerm = (await permissionService.objectDeletePermission(objectId, { userId, permCode })).data;
      // remove from store
      state.objectPermissions.value = state.objectPermissions.value.filter((p) => p.id !== deletedPerm[0].id);
      // un-map
      var userIndex = state.mappedObjectToUserPermissions.value.findIndex((x) => x.userId === userId);
      state.mappedObjectToUserPermissions.value[userIndex][permCode.toLowerCase()] = false;
    } catch (error: any) {
      toast.error('Deleting object permission', error);
    } finally {
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

      // Remove old values matching search parameters
      const matches = (x: BucketPermission) =>
        (!params.bucketId || x.bucketId === params.bucketId) &&
        (!params.userId || x.userId === params.userId) &&
        (!params.permCode || x.permCode === params.permCode);

      const [, difference] = partition(state.bucketPermissions.value, matches);

      // Merge and assign
      state.bucketPermissions.value = difference.concat(newPerms);

      // Pass response back so bucketStore can handle bucketPerms=true correctly
      return response;
    } catch (error: any) {
      toast.error('Fetching bucket permissions', error);
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

      // Remove old values matching search parameters
      const matches = (x: COMSObjectPermission) =>
        (!params.objectId || x.id === params.objectId) &&
        (!params.userId || x.userId === params.userId) &&
        (!params.permCode || x.permCode === params.permCode);

      const [, difference] = partition(state.objectPermissions.value, matches);

      // Merge and assign
      state.objectPermissions.value = difference.concat(newPerms);

      // Pass response back so objectStore can handle bucketPerms=true correctly
      return response;
    } catch (error: any) {
      toast.error('Fetching object permissions', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function isBucketActionAllowed(bucketId: string, userId?: string, permCode?: string): boolean {
    return state.bucketPermissions.value.some(
      (x: BucketPermission) => x.bucketId === bucketId && x.userId === userId && x.permCode === permCode
    );
  }

  function isObjectActionAllowed(objectId: string, userId?: string, permCode?: string, bucketId?: string): boolean {
    const bucketPerm = state.bucketPermissions.value.some(
      (x: BucketPermission) => x.bucketId === bucketId && x.userId === userId && x.permCode === permCode
    );

    const objectPerm = state.objectPermissions.value.some(
      (x: COMSObjectPermission) => x.objectId === objectId && x.userId === userId && x.permCode === permCode
    );

    return bucketPerm || objectPerm;
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
      // get a list of perms for this bucket from state that arent already mapped
      const newBucketPerms = state.bucketPermissions.value.filter(
        (x: BucketPermission) =>
          x.bucketId === bucketId &&
          !state.mappedBucketToUserPermissions.value.some(
            (mapped) => mapped.userId === x.userId && mapped[x.permCode.toLowerCase()]
          )
      );
      // new unique userId's
      const newUserIds = [
        ...new Set(
          newBucketPerms
            .filter((x) => !state.mappedBucketToUserPermissions.value.some((mapped) => (mapped.userId = x.userId)))
            .map((x: BucketPermission) => x.userId)
        )
      ];
      let newUsers: Array<User> = [];
      if (newUserIds.length) {
        // get each user from COMS
        newUsers = (await userService.searchForUsers({ userId: newUserIds })).data;
      }
      const hasPermission = (userId: string, permission: string) => {
        return newBucketPerms.some((perm: BucketPermission) => perm.userId === userId && perm.permCode === permission);
      };
      // map perms
      let donePerms: Array<string> = [];
      newBucketPerms.forEach((perm) => {
        // if user not already mapped add new user object
        if (!state.mappedBucketToUserPermissions.value.some((mapped) => mapped.userId === perm.userId)) {
          const idp = getConfig.value.idpList.find(
            (idp: IdentityProvider) => idp.idp === newUsers.find((u) => u.userId === perm.userId)?.idp
          );
          const fullName = newUsers.find((u) => u.userId === perm.userId).fullName;
          state.mappedBucketToUserPermissions.value.push({
            userId: perm.userId,
            idpName: idp?.name,
            elevatedRights: idp?.elevatedRights,
            fullName: fullName,
            create: hasPermission(perm.userId, Permissions.CREATE),
            read: hasPermission(perm.userId, Permissions.READ),
            update: hasPermission(perm.userId, Permissions.UPDATE),
            delete: hasPermission(perm.userId, Permissions.DELETE),
            manage: hasPermission(perm.userId, Permissions.MANAGE)
          });
          // mark all perms for this user as done
          donePerms.concat(newBucketPerms.filter((np) => np.userId === perm.userId).map((p) => p.id));
        }
        // else user already mapped so just patch the permission
        else if (!donePerms.includes(perm.id)) {
          state.mappedBucketToUserPermissions.value.find((m) => m.userId === perm.userId)[perm.permCode.toLowerCase()] =
            true;
        }
      });
    } catch (error: any) {
      toast.error('Mapping bucket permissions to user permissions', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function mapObjectToUserPermissions(objectId: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      // get a list of perms for this object from state that arent already mapped
      const newObjectPerms = state.objectPermissions.value.filter(
        (x: COMSObjectPermission) =>
          x.objectId === objectId &&
          !state.mappedObjectToUserPermissions.value.some(
            (mapped) => mapped.userId === x.userId && mapped[x.permCode.toLowerCase()]
          )
      );
      // new unique userId's
      const newUserIds = [
        ...new Set(
          newObjectPerms
            .filter((x) => !state.mappedObjectToUserPermissions.value.some((mapped) => (mapped.userId = x.userId)))
            .map((x: COMSObjectPermission) => x.userId)
        )
      ];
      let newUsers: Array<User> = [];
      if (newUserIds.length) {
        // get each user from COMS
        newUsers = (await userService.searchForUsers({ userId: newUserIds })).data;
      }
      const hasPermission = (userId: string, permission: string) => {
        return newObjectPerms.some(
          (perm: COMSObjectPermission) => perm.userId === userId && perm.permCode === permission
        );
      };
      // map perms
      let donePerms: Array<string> = [];
      newObjectPerms.forEach((perm) => {
        // if user not already mapped add new user object
        if (!state.mappedObjectToUserPermissions.value.some((mapped) => mapped.userId === perm.userId)) {
          const idp = getConfig.value.idpList.find(
            (idp: IdentityProvider) => idp.idp === newUsers.find((u) => u.userId === perm.userId)?.idp
          );
          const fullName = newUsers.find((u) => u.userId === perm.userId).fullName;
          state.mappedObjectToUserPermissions.value.push({
            userId: perm.userId,
            idpName: idp?.name,
            elevatedRights: idp?.elevatedRights,
            fullName: fullName,
            create: hasPermission(perm.userId, Permissions.CREATE),
            read: hasPermission(perm.userId, Permissions.READ),
            update: hasPermission(perm.userId, Permissions.UPDATE),
            delete: hasPermission(perm.userId, Permissions.DELETE),
            manage: hasPermission(perm.userId, Permissions.MANAGE)
          });
          // mark all perms for this user as done
          donePerms.concat(newObjectPerms.filter((np) => np.userId === perm.userId).map((p) => p.id));
        }
        // else user already mapped so just patch the permission
        else if (!donePerms.includes(perm.id)) {
          state.mappedObjectToUserPermissions.value.find((m) => m.userId === perm.userId)[perm.permCode.toLowerCase()] =
            true;
        }
      });
    } catch (error: any) {
      toast.error('Mapping bucket permissions to user permissions', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function removeBucketUser(bucketId: string, userId: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      const oldPerms = (
        await permissionService.bucketDeletePermission(bucketId, { userId, permCode: Object.values(Permissions) })
      ).data;
      // remove from store
      state.bucketPermissions.value = state.bucketPermissions.value.filter(
        (p) => !oldPerms.some((old) => old.id === p.id)
      );
      // un-map
      state.mappedBucketToUserPermissions.value = state.mappedBucketToUserPermissions.value.filter(
        (x) => x.userId !== userId
      );
    } catch (error: any) {
      toast.error('Removing bucket user', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function removeObjectUser(objectId: string, userId: string): Promise<void> {
    try {
      appStore.beginIndeterminateLoading();
      const oldPerms = (
        await permissionService.objectDeletePermission(objectId, { userId, permCode: Object.values(Permissions) })
      ).data;
      // remove from store
      state.objectPermissions.value = state.objectPermissions.value.filter(
        (p) => !oldPerms.some((old) => old.id === p.id)
      );
      // un-map
      state.mappedObjectToUserPermissions.value = state.mappedObjectToUserPermissions.value.filter(
        (x) => x.userId !== userId
      );
    } catch (error: any) {
      toast.error('Removing object user', error);
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
    removeObjectUser
  };
});

export default usePermissionStore;
