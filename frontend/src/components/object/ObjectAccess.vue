<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import { usePermissionStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { COMSObjectPermission } from '@/types';

// Props
type Props = {
  objectInfoId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();
const userStore = useUserStore();

const { getObjectPermissions } = storeToRefs(permissionStore);
const { userSearch } = storeToRefs(userStore);

// State
const managedBy: Ref<string | undefined> = ref();

// Actions
async function load() {
  const uniqueIds = [...new Set(getObjectPermissions.value
    .filter( (x: COMSObjectPermission) => x.objectId === props.objectInfoId && x.permCode === Permissions.MANAGE )
    .map( (x: COMSObjectPermission) => x.userId) )];

  await userStore.fetchUsers({userId: uniqueIds} );

  managedBy.value = userSearch.value.map( x => x.fullName ).join( ', ');
}

onMounted(() => {
  load();
});

watch( props, () => {
  load();
});
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div class="col-12">
      <h2 class="font-bold">
        Access
      </h2>
    </div>
    <div class="grid">
      <div class="col-fixed">
        Managed by:
      </div>
      <div class="col">
        {{ managedBy }}
      </div>
    </div>
  </div>
</template>
