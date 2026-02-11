<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { InputSwitch, useConfirm, useToast } from '@/lib/primevue';
import { useBucketStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId: string;
  bucketPublic?: boolean;
  objectId: string;
  objectName: string;
  objectPublic: boolean;
  userId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();
const bucketStore = useBucketStore();
const permissionStore = usePermissionStore();

// State
const isPublic: Ref<boolean> = ref(props.objectPublic);
const isParentPublic = ref<boolean>(false);

// Actions
const toast = useToast();
const confirm = useConfirm();

const togglePublic = async (setPublicValue: boolean) => {
  if (setPublicValue) {
    confirm.require({
      message: 'Setting this file to public will allow anyone to view and download it without signing in.',
      header: 'Set file to public?',
      acceptLabel: 'Set to public',
      rejectLabel: 'Cancel',
      accept: () => {
        objectStore
          .togglePublic(props.objectId, true)
          .then(() => {
            toast.success('File set to public', `"${props.objectName}" is now public`);
          })
          .catch((e) => toast.error('Setting file to public failed', e.response?.data.detail, { life: 0 }));
      },
      reject: () => (isPublic.value = false),
      onHide: () => (isPublic.value = false)
    });
  } else
    confirm.require({
      message:
        'Setting this file to private will remove public access. ' +
        'Only users with permissions will be able to view or download the file.',
      header: 'Set file to private?',
      acceptLabel: 'Set to private',
      rejectLabel: 'Cancel',
      accept: () => {
        objectStore
          .togglePublic(props.objectId, false)
          .then(() => {
            toast.success('File set to private', `"${props.objectName}" is no longer public`);
          })
          .catch((e) => toast.error('Setting file to private failed', e.response?.data.detail, { life: 0 }));
      },
      reject: () => (isPublic.value = true),
      onHide: () => (isPublic.value = true)
    });
};

const isToggleEnabled = computed(() => {
  return (
    !isParentPublic.value &&
    usePermissionStore().isUserElevatedRights() &&
    permissionStore.isObjectActionAllowed(props.objectId, props.userId, Permissions.MANAGE, props.bucketId as string)
  );
});

onMounted(async () => {
  isPublic.value = props.objectPublic;
  // @ts-ignore: bucketId will always be provided
  isParentPublic.value = bucketStore.getBucket(props.bucketId).public ?? false;
});

watch(props, () => {
  isPublic.value = props.objectPublic;
});
</script>

<template>
  <span v-tooltip="isToggleEnabled ? '' : 'Change the folder\'s public setting to update this file'">
    <InputSwitch
      v-model="isPublic"
      aria-label="Toggle to make public"
      :disabled="!isToggleEnabled"
      @change="togglePublic(isPublic)"
    />
  </span>
</template>
