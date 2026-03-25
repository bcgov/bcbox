<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { InputSwitch, useConfirm, useToast } from '@/lib/primevue';
import { useBucketStore, usePermissionStore } from '@/store';
import { bucketService } from '@/services';
import { Permissions } from '@/utils/constants';

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
      message: 'This setting will allow all IDIR users to view the contents of this folder using the share link.',
      header: 'Give access to all IDIR users?',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        permissionStore
          .addBucketIdpPermission(props.bucketId, 'idir', 'READ')
          .then(() => {
            isInternal.value = true;
            toast.success('IDIR permission applied', `"${props.bucketName}" can now be viewed by all IDIR users`);
          })
          .catch((e) => toast.error("Setting folder to 'All IDIR' failed", e.response?.data.detail, { life: 0 }));
      },
      reject: () => (isInternal.value = false),
      onHide: () => (isInternal.value = false)
    });
  } else
    confirm.require({
      message:
        "You are removing the 'IDIR Users' sharing access. " +
        'Only users with permissions will be able to view or download the contents of this folder.',
      header: 'Set file to private?',
      acceptLabel: 'Set to private',
      rejectLabel: 'Cancel',
      accept: () => {
        permissionStore
          .deleteBucketIdpPermission(props.bucketId, 'idir', 'READ')
          .then(() => {
            isInternal.value = false;
            toast.success('Folder set to private', `"${props.bucketName}" is no longer available to all IDIR users'`);
          })
          .catch((e) => toast.error('Setting folder to private failed', e.response?.data.detail, { life: 0 }));
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
          endpoint: bucket.endpoint,
          bucket: bucket.bucket
        })
      ).data;

      // Filter for parent buckets
      const parentBuckets = responseArray.filter((p: any) => {
        return (
          p.key !== bucket.key && // exclude current bucket
          (bucket.key.startsWith(p.key) || p.key === '/') // is parent if current starts with it
        );
      });
      // Get closest parent by longest key match
      const parent = parentBuckets.sort((a: any, b: any) => b.key.length - a.key.length)[0];
      if (parent) {
        // fetch bucketIdpPermissions for parent
        await permissionStore.fetchBucketIdpPermissions({
          bucketId: parent.bucketId,
          permCode: Permissions.READ,
          idp: 'idir'
        });
        isParentBucketInternal.value = permissionStore.getBucketInternal(parent.bucketId);
      }
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
          : 'To change this, update the parent folder\'s settings'
    "
  >
    <InputSwitch
      :model-value="isInternal"
      aria-label="Toggle to make file available to all IDIR users"
      :disabled="!isToggleEnabled"
      @update:model-value="toggleIdp($event)"
    />
  </span>
</template>
