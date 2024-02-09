<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';

import { Button } from '@/lib/primevue';
import { usePermissionStore, useBucketStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// access bucketId from parent
const bucketId = defineModel('bucketId', { type: String });
// Emits
const emit = defineEmits(['close-sidebar-info']);

// Store
const bucketStore = useBucketStore();
const permissionStore = usePermissionStore();

// State
const sidebarInfo: Ref<Bucket | undefined> = ref(undefined);
const managedBy: Ref<string | undefined> = ref();

// Actions
const closeSidebarInfo = async () => {
  emit('close-sidebar-info');
};

// required because sidebar component is mounted ater prop is first sent.
onBeforeMount(() => {
  load(bucketId.value);
});

watch(bucketId, () => {
  load(bucketId.value);
});

async function load(bucketId: string) {
  // get bucket details
  sidebarInfo.value = bucketStore.findBucketById(bucketId);
  // get 'managed by' users
  await permissionStore.fetchBucketPermissions({
    bucketId: bucketId,
    permCode: Permissions.MANAGE
  });
  await permissionStore.mapBucketToUserPermissions(bucketId);
  managedBy.value = permissionStore.getMappedBucketToUserPermissions
    .filter((mapped) => mapped.bucketId === bucketId && mapped.manage)
    .map((o) => o.fullName)
    .join(', ');
}
</script>

<template>
  <div class="side-panel pl-4">
    <div class="flex panel-header align-items-start">
      <font-awesome-icon icon="fa-solid fa-circle-info" />
      <h1 class="mt-0 ml-3 flex-grow-1">Bucket details</h1>
      <Button
        class="p-button-text pt-0"
        @click="closeSidebarInfo"
      >
        <font-awesome-icon icon="fa-xmark" />
      </Button>
    </div>

    <div class="grid details-grid grid-nogutter">
      <div class="col-12">
        <h2>Properties</h2>
      </div>
      <div class="grid overflow-hidden">
        <div class="col-fixed">Bucket Name:</div>
        <div class="col wrap-block">
          {{ sidebarInfo?.bucketName }}
        </div>
      </div>
      <div class="grid">
        <div class="col-fixed">Bucket ID:</div>
        <div class="col">
          {{ sidebarInfo?.bucketId }}
        </div>
      </div>
    </div>
    <div class="grid details-grid grid-nogutter">
      <div class="col-12">
        <h2>Access</h2>
      </div>
      <div class="grid">
        <div class="col-fixed">Managed by:</div>
        <div class="col">
          {{ managedBy }}
        </div>
      </div>
    </div>
  </div>
</template>
