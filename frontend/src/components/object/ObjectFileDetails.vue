<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';

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

import { useObjectStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { COMSObject } from '@/interfaces';
import { ButtonMode } from '@/interfaces/common/enums';

const objectStore = useObjectStore();
const toast = useToast();
const route = useRoute();

const { loading, objectList } = storeToRefs(objectStore);
const { currentUser } = storeToRefs(useUserStore());

const objectInfo: Ref<COMSObject> = ref({} as COMSObject);

const permissionsVisible: Ref<boolean> = ref(false);
const permissionsObjectId: Ref<string> = ref('');
const permissionsObjectName: Ref<string> = ref('');

const getObjectInfo = async (objId: string) => {
  try {
    await objectStore.listObjects({ objId });
    if(!objectInfo.value || !objectList.value[0]) {
      throw Error(`Object ${objId} not found or you do not have access`);
    }
    objectInfo.value = objectList.value[0];
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load Object.', detail: error, life: 5000 });
  }
};

const showPermissions = async (objectId: string, objectName: string) => {
  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = objectName;
};

onMounted(() => {
  getObjectInfo(route.query.objId as string);
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
      </div>
    </div>

    <ProgressSpinner v-if="loading" />

    <div
      v-else
      class="pl-2"
    >
      <ObjectProperties :object-info="objectInfo" />
      <ObjectAccess :object-info="objectInfo" />
      <ObjectMetadata :object-metadata="objectInfo.metadata" />
      <ObjectTag :object-tag="objectInfo.tag" />
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
