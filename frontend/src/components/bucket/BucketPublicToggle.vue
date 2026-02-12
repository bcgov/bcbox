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
        'Setting this folder to public will allow anyone to access all subfolders and files. ' +
        'Anyone with a link can view the contents of this folder in BCBox without signing in.',
      header: 'Set folder to public?',
      acceptLabel: 'Set to public',
      rejectLabel: 'Cancel',
      accept: () => {
        bucketStore
          .togglePublic(props.bucketId, true)
          .then(() => {
            toast.success('Folder set to public', `${props.bucketName} and all its contents are now public.`);
          })
          .catch((e) => toast.error('Changing public state', e.response?.data.detail ?? e, { life: 0 }));
      },
      reject: () => (isPublic.value = false),
      onHide: () => (isPublic.value = false)
    });
  } else
    confirm.require({
      message:
        'Setting this folder to private will remove public access to all subfolders and files. ' +
        'Only users with permissions will be able to view and download them.',
      header: 'Set folder to private?',
      acceptLabel: 'Set to private',
      rejectLabel: 'Cancel',
      accept: () => {
        bucketStore
          .togglePublic(props.bucketId, false)
          .then(() => {
            toast.success('Folder set to private', `${props.bucketName} and all its contents are now private`);
          })
          .catch((e) => toast.error('Changing public state', e.response?.data.detail ?? e, { life: 0 }));
      },
      reject: () => (isPublic.value = true),
      onHide: () => (isPublic.value = true)
    });
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
  <span v-tooltip="isToggleEnabled ? '' : 'Change the parent folder\'s public setting to update this folder'">
    <InputSwitch
      v-model="isPublic"
      aria-label="Toggle to make public"
      :disabled="!isToggleEnabled"
      @change="togglePublic(isPublic)"
    />
  </span>
</template>
