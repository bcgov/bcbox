<script setup lang="ts">
import { ref, watch } from 'vue';

import { InputSwitch, useConfirm, useToast } from '@/lib/primevue';
import { useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId: string;
  objectId: string;
  objectName: string;
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
const toast = useToast();
const confirm = useConfirm();

const togglePublic = async (setPublicValue: boolean) => {
  if (setPublicValue) {
    confirm.require({
      message:
        'Please confirm that you want to set the file(s) to public. ' +
        'This allows the share link to be accessible by anyone, even without credentials.',
      header: 'Confirm set to public',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        objectStore
          .togglePublic(props.objectId, true)
          .then(() => {
            toast.success(`"${props.objectName}" set to public`);
          })
          .catch((e) => toast.error('Setting file to public', e.response?.data.detail, { life: 0 }));
      },
      reject: () => (isPublic.value = false),
      onHide: () => (isPublic.value = false)
    });
  } else
    objectStore
      .togglePublic(props.objectId, false)
      .then(() => {
        toast.success(`"${props.objectName}" is no longer public`);
      })
      .catch((e) => toast.error('Setting file to non-public', e.response?.data.detail, { life: 0 }));
};

watch(props, () => {
  isPublic.value = props.objectPublic;
});
</script>

<template>
  <InputSwitch
    v-model="isPublic"
    aria-label="Toggle to make public"
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
