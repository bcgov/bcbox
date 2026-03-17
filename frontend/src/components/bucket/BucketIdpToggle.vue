<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { InputSwitch, useConfirm, useToast } from '@/lib/primevue';
import { useBucketStore, usePermissionStore } from '@/store';
import { bucketService } from '@/services';
import { Permissions } from '@/utils/constants';

import { getParentKey } from '@/utils/utils';
import type { Ref } from 'vue';

// Props
type Props = {
  bucketId: string;
  bucketName: string;
  bucketPublic: boolean;
  userId: string;
};
const props = withDefaults(defineProps<Props>(), {});

// Store
const bucketStore = useBucketStore();
const permissionStore = usePermissionStore();

// State
const isInternal: Ref<boolean> = ref(false);
const isParentBucketInternal = ref(false);

const isInternalState = computed(() => {
  return permissionStore.getBucketInternal(props.bucketId) || props.bucketPublic || isParentBucketInternal.value;
});

const isToggleEnabled = computed(() => {
  return (
    !isParentBucketInternal.value &&
    !props.bucketPublic &&
    usePermissionStore().isUserElevatedRights() &&
    permissionStore.isBucketActionAllowed(props.bucketId, props.userId, Permissions.MANAGE)
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
          .addBucketIdpPermission(props.bucketId, 'idir', 'READ')
          .then(() => {
            isInternal.value = true;
            toast.success('File set to Internal only', `"${props.bucketName}" is now Internal only`);
          })
          .catch((e) => toast.error('Setting file to Internal only failed', e.response?.data.detail, { life: 0 }));
      },
      reject: () => (isInternal.value = false),
      onHide: () => (isInternal.value = false)
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
          .deleteBucketIdpPermission(props.bucketId, 'idir', 'READ')
          .then(() => {
            isInternal.value = false;
            toast.success('File set to private', `"${props.bucketName}" is no longer 'Internal only'`);
          })
          .catch((e) => toast.error('Setting file to private failed', e.response?.data.detail, { life: 0 }));
      },
      reject: () => (isInternal.value = true),
      onHide: () => (isInternal.value = true)
    });
};

onMounted(async () => {
  // refresh current bucket IDP permissions
  await permissionStore.fetchBucketIdpPermissions({
    bucketId: props.bucketId,
    permCode: 'READ',
    idp: 'idir'
  });

  // get immediate parent bucket IDP permissions
  // TODO: get perms for every parent in path (eg: x/y/z/currentBucket)
  // let isParentBucketInternal = false;
  const bucket = bucketStore.getBucket(props.bucketId);
  if (bucket) {
    // if current bucket is not at root
    if (bucket.key !== '/') {
      // search for parent bucket by endpoint and bucket and segment of key
      const responseArray = (
        await bucketService.searchBuckets({
          key: getParentKey(bucket.key),
          endpoint: bucket.endpoint,
          bucket: bucket.bucket
        })
      ).data;
      const parent = responseArray.reduce((a: any, b: any) => (a.key.length <= b.key.length ? a : b));
      // fetch bucketIdpPermissions for parent
      await permissionStore.fetchBucketIdpPermissions({
        bucketId: parent.bucketId,
        permCode: 'READ',
        idp: 'idir'
      });
      isParentBucketInternal.value = permissionStore.getBucketInternal(parent.bucketId);
    }
  }
  isInternal.value = isInternalState.value;
});

watch(props, () => {
  if (props.bucketPublic === true) isInternal.value = true;
  else {
    const perms = permissionStore.getBucketIdpPermissions.filter(
      (p: any) => p.permCode === Permissions.READ && p.bucketId === props.bucketId && p.idp === 'idir'
    );
    if (perms.length > 0) isInternal.value = true;
    else {
      isInternal.value = false;
    }
  }
});
</script>

<template>
  <span
    v-tooltip="
      isToggleEnabled
        ? ''
        : props.bucketPublic
          ? 'Enabled by Public Sharing'
          : 'Change the folder\'s \'Internal only\' setting to update this file'
    "
  >
    <InputSwitch
      :model-value="isInternal"
      aria-label="Toggle to make file Internal only"
      :disabled="!isToggleEnabled"
      @update:model-value="toggleIdp($event)"
    />
  </span>
</template>
