import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, useAuthStore, usePermissionStore, useVersionStore } from '@/store';
import { partition } from '@/utils/utils';

import type { AxiosRequestConfig } from 'axios';
import type { Ref } from 'vue';
import type { COMSObject, MetadataPair, ObjectSearchPermissionsOptions, Tag } from '@/types';

export type ObjectStoreState = {
  objects: Ref<Array<COMSObject>>;
  selectedObjects: Ref<Array<COMSObject>>; // All selected table row items
  unfilteredObjectIds: Ref<Array<string>>;
};

export const useObjectStore = defineStore('object', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const versionStore = useVersionStore();
  const { getUserId } = storeToRefs(useAuthStore());

  // State
  const state: ObjectStoreState = {
    objects: ref([]),
    selectedObjects: ref([]),
    unfilteredObjectIds: ref([])
  };

  // Getters
  const getters = {
    getObject: computed(() => (id: string) => state.objects.value.find((obj) => obj.id === id)),
    getObjects: computed(() => state.objects.value),
    getSelectedObjects: computed(() => state.selectedObjects.value),
    getUnfilteredObjectIds: computed(() => state.unfilteredObjectIds.value)
  };

  // Actions
  async function createObject(
    object: any,
    headers: {
      metadata?: Array<{ key: string; value: string }>;
    },
    params: {
      bucketId?: string;
      tagset?: Array<{ key: string; value: string }>;
    },
    axiosOptions?: AxiosRequestConfig
  ) {
    try{
      appStore.beginIndeterminateLoading();

      // Ensure x-amz-meta- prefix exists
      if (headers.metadata) {
        for (const meta of headers.metadata) {
          if (!meta.key.startsWith('x-amz-meta-')) {
            meta.key = `x-amz-meta-${meta.key}`;
          }
        }
      }

      await objectService.createObject(object, headers, params, axiosOptions);
    } catch(error: any) {
      if (error.response?.status === 409){
        // New behaviour:
        // if file already exists in bucket
        // do updateObject operation instead
        const newVersionId = await updateObject(
          error.response.data.existingObjectId,
          object,
          headers,
          params,
          axiosOptions
        );
        return { newVersionId: newVersionId };
      }

      else {
        throw new Error('Network error');
      }
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function deleteObject(objectId: string, versionId?: string, hard = false) {
    const bucketId = getters.getObject.value(objectId)?.bucketId;
    try {
      appStore.beginIndeterminateLoading();



      if(!versionId) {
        if(hard) {
          // await versionStore.fetchVersions({ objectId: objectId });
          const versions = await versionStore.getVersionsByObjectId(objectId);
          for (const v of versions) {
            await objectService.deleteObject(objectId, v.id);
          }
        } else{
          await objectService.deleteObject(objectId, versionId);
        }
        toast.success('File deleted');
      }
      else{
        await objectService.deleteObject(objectId, versionId);
        toast.success('Version deleted');
      }
      removeSelectedObject(objectId);
    } catch (error: any) {
      toast.error('deleting object.');
      throw error;
    } finally {
      fetchObjects({ bucketId: bucketId, userId: getUserId.value, bucketPerms: true });
      appStore.endIndeterminateLoading();
    }
  }

  async function restoreObject(objectId: string, versionId?: string) {
    const bucketId = getters.getObject.value(objectId)?.bucketId;
    try {
      appStore.beginIndeterminateLoading();
      // if restoring a specific version.. copy and make latest
      if(versionId) {
        await objectService.copyObjectVersion(objectId, versionId);
      }
      const versions = await versionStore.getVersionsByObjectId(objectId);
      versions
        .filter(v => v.deleteMarker)
        .forEach(v => objectService.deleteObject(objectId, v.id));
      toast.success('File restored');
    } catch (error: any) {
      toast.error('restoring file');
      throw error;
    } finally {
      fetchObjects({ bucketId: bucketId, userId: getUserId.value, bucketPerms: true });
      appStore.endIndeterminateLoading();
    }
  }

  async function getObjectUrl(objectId: string, versionId?: string) {
    try {
      appStore.beginIndeterminateLoading();
      return objectService.getObject(objectId, versionId).then((response) => response.data);
    } catch (error: any) {
      toast.error('Downloading object', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchObjects(
    params: ObjectSearchPermissionsOptions = {},
    tagset?: Array<Tag>,
    metadata?: Array<MetadataPair>
  ) {
    try {
      appStore.beginIndeterminateLoading();

      // Get a unique list of object IDs the user has access to
      const permResponse = await permissionStore.fetchObjectPermissions(params);

      if (permResponse) {
        const uniqueIds: Array<string> = [
          ...new Set<string>(
            permResponse
              .map((x: { objectId: string }) => x.objectId)
              // Resolve API returning all objects with bucketPerms=true even when requesting single objectId
              .filter((objectId: string) => !params.objectId || objectId === params.objectId)
          )
        ];

        let response = Array<COMSObject>();
        if (uniqueIds.length) {
          // If metadata specified, search for objects with matching metadata
          const headers: Record<string, string> = {};
          if (metadata?.length) {
            for (const meta of metadata) {
              headers[`x-amz-meta-${meta.key}`] = meta.value;
            }
          }

          response = await objectService
            .searchObjects(
              {
                bucketId: params.bucketId ? [params.bucketId] : undefined,
                objectId: uniqueIds,
                tagset: tagset ? tagset.reduce((acc, cur) => ({ ...acc, [cur.key]: cur.value }), {}) : undefined,

                // Added to allow deletion of objects before versioning implementation
                // TODO: Verify if needed after versioning implemented
                // deleteMarker: false,
                // latest: true
              },
              headers
            )
            .then((r) => r.data);

          // Remove old values matching search parameters
          const matches = (x: COMSObject) =>
            (!params.objectId || x.id === params.objectId) && (!params.bucketId || x.bucketId === params.bucketId);

          const [, difference] = partition(state.objects.value, matches);

          // Merge and assign
          state.objects.value = difference.concat(response);

          // Track all the object IDs in this bucket that the user would have access to in the table
          // (even if filters are applied)
          if (!tagset?.length && !metadata?.length) {
            state.unfilteredObjectIds.value = state.objects.value
              .filter((x) => !params.bucketId || x.bucketId === params.bucketId)
              .map((o) => o.id);
          }
        } else {
          state.objects.value = response;
          state.unfilteredObjectIds.value = [];
        }
      }
    } catch (error: any) {
      toast.error('Fetching objects', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function headObject(objectId: string) {
    try {
      appStore.beginIndeterminateLoading();

      // Return full response as data will always be No Content
      return await objectService.headObject(objectId);
    } catch (error: any) {
      // toast.error('Fetching head', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function setObjects(objects: Array<COMSObject>) {
    state.objects.value = objects;
  }

  function setSelectedObjects(selected: Array<COMSObject>) {
    state.selectedObjects.value = selected;
  }

  function removeSelectedObject(removeSelected: string) {
    state.selectedObjects.value = state.selectedObjects.value.filter((object) => {
      return object.id != removeSelected;
    });
  }

  async function togglePublic(objectId: string, isPublic: boolean) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.togglePublic(objectId, isPublic);
      const obj = getters.getObject.value(objectId);
      if (obj) obj.public = isPublic;
    } catch (error: any) {
      toast.error('Changing public state', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function updateObject(
    objectId: string,
    object: any,
    headers: {
      metadata?: Array<MetadataPair>;
    },
    params: {
      tagset?: Array<Tag>;
    },
    axiosOptions?: AxiosRequestConfig
  ) {
    try {
      appStore.beginIndeterminateLoading();

      // Ensure x-amz-meta- prefix exists
      if (headers.metadata) {
        for (const meta of headers.metadata) {
          if (!meta.key.startsWith('x-amz-meta-')) {
            meta.key = `x-amz-meta-${meta.key}`;
          }
        }
      }

      const newObject = await objectService.updateObject(objectId, object, headers, params, axiosOptions);
      return newObject.data.versionId;
    } catch (error: any) {
      toast.error('Updating object', error);
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function syncObject(objectId: string) {
    try {
      appStore.beginIndeterminateLoading();
      await objectService.syncObject(objectId);
      toast.success('', 'Sync is in queue and will begin soon');
    } catch (error: any) {
      toast.error('Unable to sync', error);
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
    createObject,
    deleteObject,
    restoreObject,
    getObjectUrl,
    fetchObjects,
    headObject,
    removeSelectedObject,
    setObjects,
    setSelectedObjects,
    syncObject,
    togglePublic,
    updateObject
  };
});

export default useObjectStore;
