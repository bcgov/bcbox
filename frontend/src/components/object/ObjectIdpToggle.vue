<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { InputSwitch, useConfirm, useToast } from '@/lib/primevue';
import { useBucketStore, usePermissionStore } from '@/store';
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

// ---- State:
const permissionStore = usePermissionStore();
const bucketStore = useBucketStore();

// has object IDP permission
const isObjectInternal = computed(() => permissionStore.getObjectInternal(props.objectId));
// has bucket IDP permission
const isBucketInternal = computed(() => permissionStore.getBucketInternal(props.bucketId));
// is public
const isPublic: Ref<boolean> = computed(() => {
  const bucketIsPublic = bucketStore.getBucket(props.bucketId)?.public ?? false;
  return bucketIsPublic || props.objectPublic;
});

// value for toggle
const switchVal: Ref<boolean> = computed(() => {
  return isObjectInternal.value || isBucketInternal.value || isPublic.value;
});

const isToggleEnabled = computed(() => {
  return (
    !isBucketInternal.value &&
    !isPublic.value &&
    usePermissionStore().isUserElevatedRights() &&
    permissionStore.isObjectActionAllowed(props.objectId, props.userId, Permissions.MANAGE, props.bucketId as string)
  );
});

// Actions
const toast = useToast();
const confirm = useConfirm();

const toggleIdp = async (value: boolean) => {
  if (value) {
    confirm.require({
      message: "Setting this file to 'Internal only' will allow all IDIR users " + 'to view and download it.',
      header: 'Set file to Internal only?',
      acceptLabel: 'Set to Internal only',
      rejectLabel: 'Cancel',
      accept: () => {
        permissionStore
          .addObjectIdpPermission(props.objectId, 'idir', 'READ')
          .then(() => {
            switchVal.value = true;
            toast.success('File set to Internal only', `"${props.objectName}" is now Internal only`);
          })
          .catch((e) => toast.error('Setting file to Internal only failed', e.response?.data.detail, { life: 0 }));
      },
      reject: () => (switchVal.value = false),
      onHide: () => (switchVal.value = false)
    });
  } else
    confirm.require({
      message:
        "Setting this file to private will remove 'Internal only' access. " +
        'Only users with permissions will be able to view or download the file.',
      header: 'Set file to private?',
      acceptLabel: 'Set to private',
      rejectLabel: 'Cancel',
      accept: () => {
        permissionStore
          .deleteObjectIdpPermission(props.objectId, 'idir', 'READ')
          .then(() => {
            switchVal.value = false;
            toast.success('File set to private', `"${props.objectName}" is no longer 'Internal only'`);
          })
          .catch((e) => toast.error('Setting file to private failed', e.response?.data.detail, { life: 0 }));
      },
      reject: () => (switchVal.value = true),
      onHide: () => (switchVal.value = true)
    });
};

onMounted(async () => {
  await permissionStore.fetchObjectIdpPermissions({
    objectId: props.objectId,
    permCode: 'READ',
    idp: 'idir'
  });
  await permissionStore.fetchBucketIdpPermissions({
    bucketId: props.bucketId,
    permCode: 'READ',
    idp: 'idir'
  });
});
</script>

<template>
  <span
    v-tooltip="
      isToggleEnabled
        ? ''
        : isPublic
          ? 'Enabled by Public Sharing'
          : 'Change the folder\'s \'Internal only\' setting to update this file'
    "
  >
    <InputSwitch
      :model-value="switchVal"
      aria-label="Toggle to make file Internl only"
      :disabled="!isToggleEnabled"
      @update:model-value="toggleIdp($event)"
    />
  </span>
</template>
