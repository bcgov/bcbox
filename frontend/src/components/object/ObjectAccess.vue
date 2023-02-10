<script setup lang="ts">
import { onMounted, ref, watch} from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Permission } from '@/interfaces';

const userStore = useUserStore();
const { userSearch } = storeToRefs(userStore);

const props = defineProps({
  objectAccess: {
    type: Object,
    default: undefined
  }
});

const managedBy = ref();

async function getUserData() {
  const uniqueIds = [...new Set(props.objectAccess?.permissions
    .filter( (x: Permission) => x.permCode === Permissions.MANAGE )
    .map((x: Permission) => x.userId))];

  await userStore.searchUsers({userId: uniqueIds} );

  managedBy.value = userSearch.value.map( x => x.fullName ).join( ', ');
}

onMounted(() => {
  getUserData();
});

watch( props, async () => {
  await getUserData();
});
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2 class="font-bold">
        Access
      </h2>
    </div>
    <div class="col-3">
      Managed by:
    </div>
    <div class="col-9">
      {{ managedBy }}
    </div>
  </div>
</template>
