<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';

import { InputSwitch, useConfirm, useToast } from '@/lib/primevue';
import { useBucketStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import { getBucketPath, trimUrl } from '@/utils/utils';

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
const isPublic: Ref<boolean> = ref(props.bucketPublic);
const isParentPublic = ref<boolean>(false);

// Actions
const toast = useToast();
const confirm = useConfirm();

const togglePublic = async (setPublicValue: boolean) => {
  if (setPublicValue) {
    confirm.require({
      message:
        'Please confirm that you want to set folder to public. ' +
        'This allows the share link to be accessible by anyone, even without credentials.',
      header: 'Confirm set to public',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        bucketStore
          .togglePublic(props.bucketId, true)
          .then(() => {
            toast.success(`"${props.bucketName}" set to public`);
          })
          .catch((e) => toast.error('Changing public state', e.response?.data.detail ?? e, { life: 0 }));
      },
      reject: () => (isPublic.value = false),
      onHide: () => (isPublic.value = false)
    });
  } else
    bucketStore
      .togglePublic(props.bucketId, false)
      .then(() => {
        toast.success(`"${props.bucketName}" is no longer public`);
      })
      .catch((e) => toast.error('Changing public state', e.response?.data.detail ?? e, { life: 0 }));
};

const isParentBucketPublic = (): boolean => {
  // @ts-ignore: bucketId will always be provided
  const currBucketPath = getBucketPath(bucketStore.getBucket(props.bucketId));
  const parentPath = currBucketPath.substring(0, currBucketPath.lastIndexOf('/'));
  const parentBucket = bucketStore.getBucketByFullPath(parentPath);

  const isTopLevelBucket = trimUrl(currBucketPath) === trimUrl(parentPath);

  // top-level buckets by definition won't have a parent bucket restricting public status
  return isTopLevelBucket ? false : parentBucket?.public ?? false;
};

const isToggleEnabled = computed(() => {
  return (
    !isParentPublic.value &&
    usePermissionStore().isUserElevatedRights() &&
    permissionStore.isObjectActionAllowed(props.bucketId, props.userId, Permissions.MANAGE, props.bucketId as string)
  );
});

onMounted(async () => {
  isPublic.value = props.bucketPublic;
  isParentPublic.value = await isParentBucketPublic();
});

watch(props, () => {
  isPublic.value = props.bucketPublic;
});
</script>

<template>
  <InputSwitch
    v-model="isPublic"
    aria-label="Toggle to make public"
    :disabled="!isToggleEnabled"
    @change="togglePublic(isPublic)"
  />
</template>
