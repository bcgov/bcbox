<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

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

import type { Ref } from 'vue';
const route = useRoute();


const permissionsVisible: Ref<boolean> = ref(false);
const permissionsObjectId: Ref<string> = ref('');
const permissionsObjectName: Ref<string> = ref('');

const showPermissions = async (objectId: string, objectName: string) => {
  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = objectName;
};

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
        v-if="!loading && objectInfo.permissions"
        class="action-buttons"
      >
        <ShareObjectButton
          v-if="objectStore.isActionAllowed(objectInfo.permissions, Permissions.MANAGE, currentUser?.userId)"
          :obj="objectInfo"
        />
        <DownloadObjectButton
          v-if="objectStore.isActionAllowed(objectInfo.permissions, Permissions.READ, currentUser?.userId)"
          :mode="ButtonMode.ICON"
          :ids="[objectInfo.id]"
        />
        <Button
          v-if="objectStore.isActionAllowed(objectInfo.permissions, Permissions.MANAGE, currentUser?.userId)"
          class="p-button-lg p-button-text"
          @click="showPermissions(objectInfo.id, objectInfo.name)"
        >
          <font-awesome-icon icon="fa-solid fa-users" />
        </Button>
        <DeleteObjectButton
          v-if="objectStore.isActionAllowed(objectInfo.permissions, Permissions.DELETE, currentUser?.userId)"
          :mode="ButtonMode.ICON"
          :ids="[objectInfo.id]"
        />
      </div> -->
    </div>

    <div class="pl-2">
      <ObjectProperties
        :object-info-id="(route.query.objId as string)"
        :full-view="true"
      />
      <ObjectAccess :object-info-id="(route.query.objId as string)" />
      <ObjectMetadata :object-info-id="(route.query.objId as string)" />
      <ObjectTag :object-info-id="(route.query.objId as string)" />
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
