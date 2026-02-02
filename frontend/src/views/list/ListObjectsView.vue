<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { useRouter } from 'vue-router';
import { differenceInSeconds } from 'date-fns';

import { ObjectList } from '@/components/object';
import { Tag, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore, usePermissionStore } from '@/store';
import { RouteNames, Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Props
type Props = {
  bucketId: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const bucketStore = useBucketStore();
const { getUserId, getIsAuthenticated } = storeToRefs(useAuthStore());
const permissionStore = usePermissionStore();
const { getBucketPermissions } = storeToRefs(permissionStore);
const toast = useToast();

// State
const ready: Ref<boolean> = ref(false);
const bucket: Ref<Bucket | undefined> = ref(undefined);

// trigger bucket sync if last synced more than 1hr ago
const autoSync = async () => {
  const lastSyncRequestedDate: Ref<string | undefined> = ref(bucket.value?.lastSyncRequestedDate);
  const syncQueueSize: Ref<number> = ref(0);
  syncQueueSize.value = await bucketStore.syncBucketStatus(props.bucketId);
  const last = new Date(lastSyncRequestedDate.value as string);
  const now = new Date();
  const since = differenceInSeconds(now, last);
  if (since > 3600) {
    await bucketStore.syncBucket(props.bucketId, false);
    toast.info(
      'Sync in progress.',
      "It's been a while since we checked for changes on the file server. " +
        'Please refresh this page to ensure the file listing is up-to-date.',
      { life: 0 }
    );
  } else if (syncQueueSize.value > 0) {
    const word = syncQueueSize.value > 1 ? 'files' : 'file';
    toast.info('Sync in progress.', `${syncQueueSize.value} ${word} remaining.`, { life: 0 });
  }
};

onErrorCaptured((e: Error) => {
  toast.error('Loading folder', e.message, { life: 0 });
});

onBeforeMount(async () => {
  const router = useRouter();

  // fetch buckets (which is already scoped by cur user's permissions) and populates bucket and permissions in store
  let bucketResponse: any = [];
  if (props?.bucketId) {
    if (getIsAuthenticated.value) {
      bucketResponse = await bucketStore.fetchBuckets({
        bucketId: props.bucketId,
        userId: getUserId.value,
        objectPerms: true
      });
    } else {
      bucketResponse = [await bucketStore.fetchBucket(props.bucketId)];
    }
  }

  if (bucketResponse?.length) {
    bucket.value = bucketResponse[0];
    ready.value = true;
    // sync bucket if necessary
    const hasRead = getBucketPermissions.value.filter((p) => p.permCode === Permissions.READ);
    if (hasRead.length > 0) await autoSync();
  } else {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
});
</script>
<template>
  <div v-if="ready">
    <h2
      v-if="bucket"
      class="mb-3 flex flex-align-baseline overflow-hidden"
    >
      <font-awesome-icon
        icon="fa-solid fa-folder"
        class="flex align-items-center mr-2 mt-2"
      />
      <span class="wrap-block w-11 flex flex-grow-1">
        {{ bucket.bucketName }}
        <span class="ml-3 flex align-items-center">
          <Tag
            v-if="bucket.public"
            v-tooltip="
              'This folder and its contents are set to public. Change the settings in &quot;Folder permissions.&quot;'
            "
            value="Public"
            severity="danger"
            rounded
            icon="pi pi-info-circle"
          />
        </span>
      </span>
    </h2>
    <ObjectList
      :bucket-id="props.bucketId"
      :is-bucket-public="bucket?.public"
    />
  </div>
</template>
<style scoped lang="scss">
.heading svg {
  color: $bcbox-primary;
}
</style>
