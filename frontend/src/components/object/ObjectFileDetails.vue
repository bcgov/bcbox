<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

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
import { useAuthStore, useMetadataStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  objId: string
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const { getObjects } = storeToRefs(objectStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const permissionsVisible: Ref<boolean> = ref(false);
const permissionsObjectId: Ref<string> = ref('');
const permissionsObjectName: Ref<string> = ref('');
const obj: Ref<COMSObject | undefined> = ref(undefined);
const bucketId: Ref<string> = ref('');

// Actions
const showPermissions = async (objectId: string) => {
  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = metadataStore.findValue(objectId, 'name') || '';
};

onMounted(() => {
  permissionStore.fetchBucketPermissions({ userId: getUserId.value, objectPerms: true });
});

watch( [props, getObjects], () => {
  metadataStore.fetchMetadata({objId: props.objId });
  obj.value = objectStore.findObjectById(props.objId);
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
          v-if="permissionStore.isObjectActionAllowed(
            props.objId, getUserId, Permissions.MANAGE, bucketId)"
          :id="props.objId"
        />
        <DownloadObjectButton
          v-if="permissionStore.isObjectActionAllowed(
            props.objId, getUserId, Permissions.READ, bucketId)"
          :mode="ButtonMode.ICON"
          :ids="[props.objId]"
        />
        <Button
          v-if="permissionStore.isObjectActionAllowed(
            props.objId, getUserId, Permissions.MANAGE, bucketId)"
          class="p-button-lg p-button-text"
          @click="showPermissions(props.objId)"
        >
          <font-awesome-icon icon="fa-solid fa-users" />
        </Button>
        <DeleteObjectButton
          v-if="permissionStore.isObjectActionAllowed(
            props.objId, getUserId, Permissions.DELETE, bucketId)"
          :mode="ButtonMode.ICON"
          :ids="[props.objId]"
        />
      </div>
    </div>

    <div class="pl-2">
      <ObjectProperties
        :object-info-id="props.objId"
        :full-view="true"
      />
      <ObjectAccess :object-info-id="props.objId" />
      <ObjectMetadata
        :object-info-id="props.objId"
        :full-view="true"
      />
      <ObjectTag :object-info-id="props.objId" />
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
