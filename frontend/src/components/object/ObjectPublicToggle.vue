<script setup lang="ts">
import { ref, watch } from 'vue';

import { InputSwitch } from '@/lib/primevue';
import { useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId: string;
  objectId: string;
  objectPublic: boolean;
  userId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();

// State
const isPublic: Ref<boolean> = ref(props.objectPublic);

// Actions
const togglePublic = async (isPublic: boolean) => {
  await objectStore.togglePublic(props.objectId, isPublic);
};

watch(props, () => {
  isPublic.value = props.objectPublic;
});
</script>

<template>
  <InputSwitch
    v-model="isPublic"
    :disabled="
      !(
        usePermissionStore().isUserElevatedRights() &&
        permissionStore.isObjectActionAllowed(
          props.objectId,
          props.userId,
          Permissions.MANAGE,
          props.bucketId as string
        )
      )
    "
    @change="togglePublic(isPublic)"
  />
</template>
