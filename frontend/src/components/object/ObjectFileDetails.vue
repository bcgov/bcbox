<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch, unref } from 'vue';
import { useRoute } from 'vue-router';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectAccess,
  ObjectMetadata,
  ObjectPermission,
  ObjectProperties,
  ObjectTag,
  ShareObjectButton
} from '@/components/object';
import { Button, Dialog } from '@/lib/primevue';
import { useMetadataStore, useObjectStore, usePermissionStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Store
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const route = useRoute();
const { getObjects } = storeToRefs(objectStore);
const { getCurrentUser } = storeToRefs(useUserStore());

// State
const permissionsVisible: Ref<boolean> = ref(false);
const permissionsObjectId: Ref<string> = ref('');
const permissionsObjectName: Ref<string> = ref('');
const routeObjId: Ref<string> = ref(route.query.objId as string);
const obj: Ref<COMSObject | undefined> = ref(undefined);
const bucketId: Ref<string> = ref('');

// Actions
const showPermissions = async (objectId: string, objectName?: string) => {
  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = objectName || '';
};

onMounted(() => {
  permissionStore.fetchBucketPermissions({ userId: getCurrentUser.value?.userId, objectPerms: true });
});

watch( [routeObjId, getObjects], () => {
  metadataStore.fetchMetadata({objId: unref(routeObjId) });
  obj.value = objectStore.getObjectById(unref(routeObjId));
  bucketId.value = obj.value?.bucketId || '';
});
</script>

<template>
  <div>
    <div class="flex justify-content-start">
      <div class="flex col align-items-center pl-0">
        <font-awesome-icon
          icon="fa-solid fa-circle-info"
          style="font-size: 2rem"
        />
        <h1 class="pl-1 font-bold">
          File details
        </h1>
      </div>

      <div
        v-if="obj"
        class="action-buttons"
      >
        <ShareObjectButton
          v-if="permissionStore.getIsObjectActionAllowed(
            routeObjId, getCurrentUser?.userId, Permissions.MANAGE, bucketId)"
          :id="routeObjId"
        />
        <DownloadObjectButton
          v-if="permissionStore.getIsObjectActionAllowed(
            routeObjId, getCurrentUser?.userId, Permissions.READ, bucketId)"
          :mode="ButtonMode.ICON"
          :ids="[routeObjId]"
        />
        <Button
          v-if="permissionStore.getIsObjectActionAllowed(
            routeObjId, getCurrentUser?.userId, Permissions.MANAGE, bucketId)"
          class="p-button-lg p-button-text"
          @click="showPermissions(routeObjId, metadataStore.getValue(routeObjId, 'name'))"
        >
          <font-awesome-icon icon="fa-solid fa-users" />
        </Button>
        <DeleteObjectButton
          v-if="permissionStore.getIsObjectActionAllowed(
            routeObjId, getCurrentUser?.userId, Permissions.DELETE, bucketId)"
          :mode="ButtonMode.ICON"
          :ids="[routeObjId]"
        />
      </div>
    </div>

    <div class="pl-2">
      <ObjectProperties
        :object-info-id="routeObjId"
        :full-view="true"
      />
      <ObjectAccess :object-info-id="routeObjId" />
      <ObjectMetadata
        :object-info-id="routeObjId"
        :full-view="true"
      />
      <ObjectTag :object-info-id="routeObjId" />
    </div>
  </div>

  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    v-model:visible="permissionsVisible"
    :draggable="false"
    :modal="true"
    class="permissions-modal"
  >
    <!-- eslint-enable vue/no-v-model-argument -->
    <template #header>
      <div class="flex">
        <font-awesome-icon
          icon="fa-solid fa-users"
          class="pr-3 pt-2"
          style="font-size: 2rem"
        />
        <div>
          <h1>Object Permissions</h1>
          <h3>{{ permissionsObjectName }}</h3>
        </div>
      </div>
    </template>

    <ObjectPermission :object-id="permissionsObjectId" />
  </Dialog>
</template>

<style lang="scss" scoped>
:deep(.grid) {
  width: 33% !important;
}
</style>
