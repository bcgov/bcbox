<script setup lang="ts">
import { Button } from '@/lib/primevue';
import { onMounted, ref, Ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Permissions } from '@/utils/constants';
import { usePermissionStore, useUserStore } from '@/store';

import type { Bucket } from '@/types';
import type { BucketPermission } from '@/types';

// Props
type Props = {
  sidebarInfo: Bucket
};

const props = withDefaults(defineProps<Props>(), {});

//Store
const permissionStore = usePermissionStore();
const userStore = useUserStore();

const { getBucketPermissions } = storeToRefs(permissionStore);
const { userSearch } = storeToRefs(userStore);

// State
const managedBy: Ref<string | undefined> = ref();

// Emits
const emit = defineEmits(['close-sidebar-info']);

// Actions
const closeSidebarInfo = async () => {
  emit('close-sidebar-info');
};

// Actions
async function load() {
  await permissionStore.fetchBucketPermissions({bucketId: props.sidebarInfo.bucketId});

  const uniqueIds = [...new Set(getBucketPermissions.value
    .filter( (x: BucketPermission) => x.bucketId === props.sidebarInfo.bucketId && x.permCode === Permissions.MANAGE )
    .map( (x: BucketPermission) => x.userId) )];

  if(uniqueIds.length) {
    await userStore.fetchUsers({userId: uniqueIds} );
    managedBy.value = userSearch.value.map( x => x.fullName ).join( ', ');
  }
}

onMounted(() => {
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
  <div class="pl-2">
    <div class="grid">
      <div class="col-12">
        <h2>Properties</h2>
      </div>
      <div class="col-3">
        Bucket Name:
      </div>
      <div class="col-9">
        {{ props.sidebarInfo?.bucketName }}
      </div>
      <div class="col-3">
        Bucket ID:
      </div>
      <div class="col-9">
        {{ props.sidebarInfo?.bucketId }}
      </div>
    </div>
    <div class="grid">
      <div class="col-12">
        <h2>Access</h2>
      </div>
      <div class="col-3">
        Managed by:
      </div>
      <div class="col-9">
        {{ managedBy }}
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
