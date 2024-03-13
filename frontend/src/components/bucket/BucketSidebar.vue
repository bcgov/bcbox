<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';

import { Button } from '@/lib/primevue';
import { usePermissionStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Bucket, BucketPermission } from '@/types';

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

watch(props, () => {
  load();
});
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
          {{ props.sidebarInfo?.bucketName }}
        </div>
      </div>
      <div class="grid">
        <div class="col-fixed">Bucket ID:</div>
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
