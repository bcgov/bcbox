import { ref, isProxy, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { objectService, permissionService, userService } from '@/services';
import { useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { COMSObject, Metadata, ObjectTag, Tag, User, UserPermissions } from '@/interfaces';

export const useObjectStore = defineStore('objectStore', () => {
  const { currentUser } = storeToRefs(useUserStore());

  // state
  const loading = ref(false);
  const objectList = ref([] as COMSObject[]);
  const selectedObject = ref({});
  const selectedObjectPermissions = ref([] as UserPermissions[]);
  const multiSelectedObjects = ref([] as COMSObject[]); // all selected table row items

  // actions
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
          bucketPerms: true
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
                (metadata1: Array<{key: string, value: string}>, metadata2: Array<{key: string, value: string}> ) =>
                  metadata1.key < metadata2.key ? -1 : metadata1.key > metadata2.key ? 1 : 0
              );
              obj.name = metadata.metadata.find((x: { key: string }) => x.key === 'name')?.value;
            }

            if(taggingResponse) {
              obj.tag = taggingResponse.find((x: ObjectTag) => x.objectId === obj.id);
              obj.tag.tagset.sort(
                (tag1: Tag, tag2: Tag) => tag1.key < tag2.key ? -1 : tag1.key > tag2.key ? 1 : 0
              );
            }

            // Add the permissions to each object list item
            obj.permissions = permResponse
              .find((p: { objectId: string, permission: UserPermissions}) => p.objectId === obj.id).permissions;
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

  // async function readObject(objectId: string) {
  //   const response = await objectService.readObject(objectId);
  //   selectedObject.value = response.data;
  // }

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
          userPermissions.push({
            userId: user.userId,
            fullName: user.fullName,
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

  async function addObjectPermission(
    bucketId: string,
    userId: string,
    permCode: string
  ) {
    try {
      loading.value = true;

      await objectService.addPermissions(bucketId, [{ userId, permCode }]);
    } finally {
      loading.value = false;
    }
  }

  async function deleteObjectPermission(
    bucketId: string,
    userId: string,
    permCode: string
  ) {
    try {
      loading.value = true;

      await objectService.deletePermission(bucketId, { userId, permCode });
    } finally {
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

      await getObjectPermissions(bucketId);
    } finally {
      loading.value = false;
    }
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
  };
});
