import { ref, isProxy, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';

import { objectService, permissionService, userService } from '@/services';
import { useBucketStore, useConfigStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type {
  COMSObject, IdentityProvider, Metadata, Permission, Tagging, Tag, User, UserPermissions
} from '@/interfaces';

export const useObjectStore = defineStore('objectStore', () => {
  const { selectedBucketPermissionsForUser } = storeToRefs(useBucketStore());
  const { config } = storeToRefs(useConfigStore());
  const { currentUser } = storeToRefs(useUserStore());
  const toast = useToast();

  // State
  const loading: Ref<boolean> = ref(false);
  const objectList: Ref<Array<COMSObject>> = ref([]);
  const selectedObject: Ref<COMSObject | null> = ref(null);
  const selectedObjectPermissions: Ref<Array<UserPermissions>> = ref([]);
  const multiSelectedObjects: Ref<Array<COMSObject>> = ref([]); // All selected table row items

  // Actions
  function getObjectInfo(objectId: string) {
    let object = objectList.value.find((x) => x.id === objectId);
    if (isProxy(object)) {
      object = toRaw(object);
    }

    // TODO: Get unique list of users with management positions on the bucket

    return object;
  }

  async function createObject(object: any, bucketId?: string) {
    try {
      loading.value = true;
      await objectService.createObject(object, bucketId);
    } catch (error) {
      console.error(`Error uploading: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteObjectList(objectIds: Array<string>) {
    try {
      loading.value = true;
      await Promise.all(
        objectIds.map(async (id) => {
          await objectService.deleteObject(id);
        })
      );
    } catch (error) {
      console.error(`Error deleting ${objectIds}: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      loading.value = false;

      // Refresh the table after
      listObjects();
    }
  }

  async function listObjects(params: any = {}) {
    try {
      loading.value = true;

      objectList.value = [];

      // Checks for a users object permissions within the bucket
      // Obtains a unique set of object IDs, searches for the objects and their associated metadata
      if (currentUser.value) {
        const permResponse = (await permissionService.objectSearchPermissions({
          userId: currentUser.value.userId,
          bucketId: params.bucketId ?? undefined,
          bucketPerms: true,
          permCode: [Permissions.READ, Permissions.UPDATE, Permissions.DELETE, Permissions.MANAGE]
        })).data;

        const uniqueIds = [...new Set(permResponse.map((x: { objectId: string }) => x.objectId))];

        let objects = null;
        if (uniqueIds.length) {
          objects = (await objectService.listObjects({ objId: uniqueIds, ...params })).data;
          const metadataResponse = (await objectService.getMetadata(null, { objId: uniqueIds })).data;
          const taggingResponse = (await objectService.getObjectTagging({ objId: uniqueIds })).data;

          objects.forEach(async (obj: any) => {
            const metadata = metadataResponse.find((x: Metadata) => x.objectId === obj.id);

            if (metadata) {
              obj.metadata = metadata;
              obj.metadata.metadata.sort(
                (metadata1: any, metadata2: any) =>
                  metadata1.key < metadata2.key ? -1 : metadata1.key > metadata2.key ? 1 : 0
              );
              obj.name = metadata.metadata.find((x: { key: string }) => x.key === 'name')?.value;
            }

            if (taggingResponse) {
              obj.tag = taggingResponse.find((x: Tagging) => x.objectId === obj.id);
              obj.tag.tagset.sort(
                (tag1: Tag, tag2: Tag) => tag1.key < tag2.key ? -1 : tag1.key > tag2.key ? 1 : 0
              );
            }

            // Add the permissions to each object list item
            obj.permissions = permResponse
              .find((p: { objectId: string, permission: UserPermissions }) => p.objectId === obj.id).permissions;
          });
        }
        objectList.value = objects;
      }
    } catch (error) {
      console.error(`Error obtaining object list: ${error}`); // eslint-disable-line no-console
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function getObject(objectId: string, versionId?: string) {
    await objectService.getObject(objectId, versionId);
  }

  async function getObjectPermissions(objectId: string) {
    try {
      loading.value = true;

      const objPerms = (
        await permissionService.objectGetPermissions(objectId)
      ).data;

      if (objPerms.length) {
        // Get the user records for the unique user IDs in the perms
        const uniqueIds = [...new Set(objPerms.map((x: any) => x.userId))].join(',');
        const uniqueUsers = (await userService.searchForUsers({ userId: uniqueIds })).data;

        const hasPermission = (userId: string, permission: string) => {
          return objPerms.some((perm: any) => perm.userId === userId && perm.permCode === permission);
        };

        const userPermissions: UserPermissions[] = [];
        uniqueUsers.forEach((user: User) => {
          const idp = config.value.idpList.find((idp: IdentityProvider) => idp.idp === user.idp);

          userPermissions.push({
            userId: user.userId,
            fullName: user.fullName,
            idpName: idp?.name,
            read: hasPermission(user.userId, Permissions.READ),
            update: hasPermission(user.userId, Permissions.UPDATE),
            delete: hasPermission(user.userId, Permissions.DELETE),
            manage: hasPermission(user.userId, Permissions.MANAGE),
          });
        });

        selectedObjectPermissions.value = userPermissions;
      } else {
        selectedObjectPermissions.value = [];
      }
    }
    finally {
      loading.value = false;
    }
  }

  async function addObjectPermission(bucketId: string, userId: string, permCode: string) {
    try {
      loading.value = true;
      await objectService.addPermissions(bucketId, [{ userId, permCode }]);
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error updating permission', detail: error, life: 3000 });
    }
    finally {
      await getObjectPermissions(bucketId);
      loading.value = false;
    }
  }

  async function deleteObjectPermission(bucketId: string, userId: string, permCode: string) {
    try {
      loading.value = true;
      await objectService.deletePermission(bucketId, { userId, permCode });
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error updating permission', detail: error, life: 3000 });
    }
    finally {
      await getObjectPermissions(bucketId);
      loading.value = false;
    }
  }

  async function removeObjectUser(bucketId: string, userId: string) {
    try {
      loading.value = true;

      for (const [, value] of Object.entries(Permissions)) {
        await objectService.deletePermission(bucketId, {
          userId,
          permCode: value,
        });
      }
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error updating permission', detail: error, life: 3000 });
    }
    finally {
      await getObjectPermissions(bucketId);
      loading.value = false;
    }
  }

  // Permission guards for the buttons
  function isActionAllowed(objectPermissions: Permission[], perm: string, userId?: string) {
    // If you have the specified permission on the bucket
    // OR if you have the specified permission on the object
    return (
      selectedBucketPermissionsForUser.value.some((bp) => bp.permCode === perm)
      ||
      objectPermissions.some((op) => op.permCode === perm && op.userId === userId)
    );
  }

  return {
    loading,
    multiSelectedObjects,
    objectList,
    selectedObject,
    selectedObjectPermissions,
    createObject,
    deleteObjectList,
    getObjectInfo,
    getObject,
    listObjects,
    getObjectPermissions,
    addObjectPermission,
    deleteObjectPermission,
    removeObjectUser,
    isActionAllowed
  };
});
