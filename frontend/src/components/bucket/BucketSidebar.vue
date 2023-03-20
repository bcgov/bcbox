<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';

import { Button } from '@/lib/primevue';
import { usePermissionStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';

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
const { userSearch } = storeToRefs(userStore);

// State
const managedBy: Ref<string | undefined> = ref();

// Actions
const closeSidebarInfo = async () => {
  emit('close-sidebar-info');
};

async function load() {
  await permissionStore.fetchBucketPermissions({
    bucketId: props.sidebarInfo.bucketId,
  });

  const uniqueIds = [
    ...new Set(
      getBucketPermissions.value
        .filter(
          (x: BucketPermission) =>
            x.bucketId === props.sidebarInfo.bucketId &&
            x.permCode === Permissions.MANAGE
        )
        .map((x: BucketPermission) => x.userId)
    ),
  ];

  if (uniqueIds.length) {
    await userStore.fetchUsers({ userId: uniqueIds });
    managedBy.value = userSearch.value.map((x) => x.fullName).join(', ');
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
  <div class="flex justify-content-start">
    <div class="flex col align-items-center pl-0">
      <font-awesome-icon
        icon="fa-solid fa-circle-info"
        style="font-size: 2rem"
      />
      <h1>Bucket details</h1>
    </div>
    <div class="col-fixed align-items-center">
      <Button
        class="p-button-lg p-button-rounded p-button-text black"
        @click="closeSidebarInfo"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </Button>
    </div>
  </div>

  <div class="pl-2 sidebar">
    <div class="grid details-grid grid-nogutter">
      <div class="col-12">
        <h2 class="font-bold">Properties</h2>
      </div>
      <div class="grid overflow-hidden">
        <div class="col-fixed">Bucket Name:</div>
        <div class="col wrap-block w-6">
          {{ props.sidebarInfo?.bucketName }}
        </div>
      </div>
      <div class="grid">
        <div class="col-fixed">Bucket ID:</div>
        <div class="col">
          {{ props.sidebarInfo?.bucketId }}
        </div>
      </div>
    </div>

    <div class="grid details-grid grid-nogutter">
      <div class="col-12">
        <h2 class="font-bold">Access</h2>
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

<style lang="scss" scoped>
h1 {
  padding-left: 1rem;
  font-weight: bold;
}

h2 {
  font-weight: bold;
}

.black {
  color: black;
}
</style>
