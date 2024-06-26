<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onMounted, ref, watch } from 'vue';

import { Button } from '@/lib/primevue';
import { usePermissionStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Bucket, BucketPermission } from '@/types';
import { onDialogHide } from '@/utils/utils';

// Props
type Props = {
  sidebarInfo: Bucket;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['close-sidebar-info']);

// Store
const permissionStore = usePermissionStore();
const userStore = useUserStore();

const { getBucketPermissions } = storeToRefs(permissionStore);

// State
const managedBy: Ref<string | undefined> = ref();

// Actions
const closeSidebarInfo = async () => {
  onDialogHide();
  emit('close-sidebar-info');
};

async function load() {
  await permissionStore.fetchBucketPermissions({
    bucketId: props.sidebarInfo.bucketId
  });

  const uniqueIds = [
    ...new Set(
      getBucketPermissions.value
        .filter((x: BucketPermission) => x.bucketId === props.sidebarInfo.bucketId && x.permCode === Permissions.MANAGE)
        .map((x: BucketPermission) => x.userId)
    )
  ];

  if (uniqueIds.length) {
    await userStore.fetchUsers({ userId: uniqueIds });
    managedBy.value = userStore
      .getUsers(uniqueIds)
      .map((x) => x.fullName)
      .join(', ');
  }
}

onBeforeMount(() => {
  load();
});

onMounted(() => {
  document.getElementById('side-panel')?.focus();
});

watch(props, () => {
  load();
});
</script>

<template>
  <div
    id="side-panel"
    tabindex="0"
    class="side-panel pl-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="side-panel_label"
    aria-describedby="side-panel_desc"
  >
    <div class="flex panel-header align-items-start">
      <font-awesome-icon icon="fa-solid fa-circle-info" />
      <h1 class="mt-0 ml-3 flex-grow-1">Folder details</h1>
      <Button
        aria-label="Close"
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
        <div class="col-fixed">Folder name:</div>
        <div class="col wrap-block">
          {{ props.sidebarInfo?.bucketName }}
        </div>
      </div>
      <div class="grid">
        <div class="col-fixed">Source storage location ID:</div>
        <div class="col">
          {{ props.sidebarInfo?.bucketId }}
        </div>
      </div>
      <div class="grid">
        <div class="col-fixed">Last sync date:</div>
        <div
          v-if="props.sidebarInfo.lastSyncRequestedDate"
          class="col"
        >
          {{ formatDateLong(props.sidebarInfo?.lastSyncRequestedDate as string) }}
        </div>
        <div
          v-else
          class="col"
        >
          (none)
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
