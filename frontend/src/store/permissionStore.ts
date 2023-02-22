import { computed, ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { permissionService, userService } from '@/services';
import { useAppStore, useConfigStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type {
  BucketPermission,
  COMSObjectPermission,
  IdentityProvider,
  Permission,
  User,
  UserPermissions
} from '@/interfaces';

export const usePermissionStore = defineStore('permission', () => {
  // Store
  const appStore = useAppStore();
  const { config } = storeToRefs(useConfigStore());
  const toast = useToast();

  // State
  const bucketPermissions: Ref<Array<BucketPermission>> = ref([]);
  const mappedBucketToUserPermissions: Ref<Array<UserPermissions>> = ref([]);
  const mappedObjectToUserPermissions: Ref<Array<UserPermissions>> = ref([]);
  const objectPermissions: Ref<Array<COMSObjectPermission>> = ref([]);
  const permissions: Ref<Array<Permission>> = ref([]);

  // Computed Getters
  const getBucketPermissions = computed(() => bucketPermissions.value);
  const getObjectPermissions = computed(() => objectPermissions.value);
  const getPermissions = computed(() => permissions.value);
  const getMappedBucketToUserPermissions = computed(() => mappedBucketToUserPermissions.value);
  const getMappedObjectToUserPermissions = computed(() => mappedObjectToUserPermissions.value);

  // Getters
  const getBucketActionAllowed = (bucketId: string, userId?: string, permCode?: string) => {
    return bucketPermissions.value.some((x: BucketPermission) =>
      x.bucketId === bucketId && x.userId === userId && x.permCode === permCode);
  };

  const getObjectActionAllowed = (objectId: string, bucketId?: string, userId?: string, permCode?: string) => {
    const bucketPerm = bucketPermissions.value.some((x: BucketPermission) =>
      x.bucketId === bucketId && x.userId === userId && x.permCode === permCode);
    const objectPerm = objectPermissions.value.some((x: COMSObjectPermission) =>
      x.objectId === objectId && x.userId === userId && x.permCode === permCode);

    return bucketPerm || objectPerm;
  };

  // Actions
  async function addBucketPermission(bucketId: string, userId: string, permCode: string) {
    try {
      appStore.beginLoading();
      await permissionService.bucketAddPermissions(bucketId, [{ userId, permCode }]);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error adding bucket permission', detail: error, life: 3000 });
    }
    finally {
      await fetchBucketPermissions();
      await mapBucketToUserPermissions(bucketId);
      appStore.endLoading();
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
      appStore.beginLoading();
      await permissionService.objectAddPermissions(objectId, [{ userId, permCode }]);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error adding object permission', detail: error, life: 3000 });
    }
    finally {
      await fetchObjectPermissions();
      await mapObjectToUserPermissions(objectId);
      appStore.endLoading();
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
      appStore.beginLoading();
      await permissionService.bucketDeletePermission(bucketId, { userId, permCode });
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error deleting bucket permission', detail: error, life: 3000 });
    }
    finally {
      await fetchBucketPermissions();
      await mapBucketToUserPermissions(bucketId);
      appStore.endLoading();
    }
  }

  async function deleteObjectPermission(objectId: string, userId: string, permCode: string) {
    try {
      appStore.beginLoading();
      await permissionService.objectDeletePermission(objectId, { userId, permCode });
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error deleting object permission', detail: error, life: 3000 });
    }
    finally {
      await fetchObjectPermissions();
      await mapObjectToUserPermissions(objectId);
      appStore.endLoading();
    }
  }

  async function fetchBucketPermissions(params: object = {}) {
    try {
      appStore.beginLoading();
      const response = (await permissionService.bucketSearchPermissions({ ...params })).data;

      console.log(response);
      let perms = Array<BucketPermission>();
      response.forEach((x: any) => {
        perms = perms.concat(x.permissions);
      });
      bucketPermissions.value = perms;
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching bucket permissions', detail: error, life: 3000 });
    }
    finally {
      appStore.endLoading();
    }
  }

  async function fetchObjectPermissions(params: object = {}) {
    try {
      appStore.beginLoading();
      const response = (await permissionService.objectSearchPermissions({ ...params, bucketPerms: true })).data;

      let perms = Array<COMSObjectPermission>();
      response.forEach((x: any) => {
        perms = perms.concat(x.permissions);
      });
      objectPermissions.value = perms;
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching object permissions', detail: error, life: 3000 });
    }
    finally {
      appStore.endLoading();
    }
  }

  async function mapBucketToUserPermissions(bucketId: string) {
    try {
      appStore.beginLoading();
      const bucketPerms = bucketPermissions.value.filter((x: BucketPermission) => x.bucketId === bucketId);
      const uniqueIds = [...new Set(bucketPerms.map((x: BucketPermission) => x.userId))];
      const uniqueUsers: Array<User> = (await userService.searchForUsers({ userId: uniqueIds })).data;

      const hasPermission = (userId: string, permission: string) => {
        return bucketPerms.some((perm: BucketPermission) => perm.userId === userId && perm.permCode === permission);
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
      appStore.endLoading();
    }
  }

  async function mapObjectToUserPermissions(objectId: string) {
    try {
      appStore.beginLoading();
      const objectPerms = objectPermissions.value.filter((x: COMSObjectPermission) => x.objectId === objectId);
      const uniqueIds = [...new Set(objectPerms.map((x: COMSObjectPermission) => x.userId))];
      const uniqueUsers: Array<User> = (await userService.searchForUsers({ userId: uniqueIds })).data;

      const hasPermission = (userId: string, permission: string) => {
        return objectPerms.some((perm: COMSObjectPermission) => perm.userId === userId && perm.permCode === permission);
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
      appStore.endLoading();
    }
  }

  async function removeBucketUser(bucketId: string, userId: string) {
    try {
      appStore.beginLoading();
      for (const [, value] of Object.entries(Permissions)) {
        await permissionService.bucketDeletePermission(bucketId, { userId, permCode: value });
      }
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error removing bucket user', detail: error, life: 3000 });
    } finally {
      await fetchBucketPermissions();
      await mapBucketToUserPermissions(bucketId);
      appStore.endLoading();
    }
  }

  async function removeObjectUser(objectId: string, userId: string) {
    try {
      appStore.beginLoading();

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
      appStore.endLoading();
    }
  }


  return {
    // Computed Getters
    getBucketPermissions,
    getObjectPermissions,
    getPermissions,
    getMappedBucketToUserPermissions,
    getMappedObjectToUserPermissions,

    // Getters
    getBucketActionAllowed,
    getObjectActionAllowed,

    // Actions
    addBucketPermission,
    addBucketUser,
    addObjectPermission,
    addObjectUser,
    deleteBucketPermission,
    deleteObjectPermission,
    fetchBucketPermissions,
    fetchObjectPermissions,
    mapBucketToUserPermissions,
    mapObjectToUserPermissions,
    removeBucketUser,
    removeObjectUser,
  };
});
