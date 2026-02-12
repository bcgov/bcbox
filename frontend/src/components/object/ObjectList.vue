<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { differenceInSeconds, formatDistance } from 'date-fns';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectSidebar,
  ObjectTable,
  ObjectUpload
} from '@/components/object';
import { SyncButton } from '@/components/common';

import { Button } from '@/lib/primevue';
import { useAuthStore, useBucketStore, useObjectStore, useNavStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { onDialogHide } from '@/utils/utils';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId: string;
  isBucketPublic?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined,
  isBucketPublic: undefined
});

//const navStore = useNavStore();
const objectStore = useObjectStore();
const bucketStore = useBucketStore();
const permissionStore = usePermissionStore();
const { focusedElement } = storeToRefs(useNavStore());

const { getSelectedObjects } = storeToRefs(objectStore);
const { getIsAuthenticated, getUserId } = storeToRefs(useAuthStore());

// State
const bucket = bucketStore.getBucket(props.bucketId);
const displayUpload = ref(false);
const objectInfoId: Ref<string | undefined> = ref(undefined);
const objectTableKey = ref(0);

const selectedObjectIds = computed(() => {
  return getSelectedObjects.value.map((o) => o.id);
});

const showObjectInfo = async (objectId: string | undefined) => {
  objectInfoId.value = objectId;
};

const syncButtonDisabled: Ref<boolean> = ref(true);
const timeToNextManual: Ref<number> = ref(0);
const syncStatus: Ref<string> = ref('');

// actions
const closeObjectInfo = () => {
  objectInfoId.value = undefined;
};

const showUpload = () => {
  displayUpload.value = true;
  focusedElement.value = document.activeElement;
};

const closeUpload = () => {
  onDialogHide();
  displayUpload.value = false;
  objectTableKey.value += 1;
};

const onObjectDeleted = () => {
  objectTableKey.value += 1;
};

// auto-sync
const autoSync = async () => {
  const now = new Date();
  const manualMinimum = 1800; // 30 minutes
  const autoMinimum = 86400; // 1 day

  const syncQueueSize: Ref<number> = ref(0);
  syncQueueSize.value = await bucketStore.syncBucketStatus(props.bucketId);
  const lastSyncDate = new Date(bucket?.lastSyncRequestedDate as string);
  const sinceLastSyncDate = differenceInSeconds(now, lastSyncDate);

  // if havent synced for 24 hrs trigger autoSync
  if (sinceLastSyncDate > autoMinimum) {
    await bucketStore.syncBucket(props.bucketId, false);
    syncStatus.value = 'Sync in progress';
  }
  // if sync in progress, show status
  else if (syncQueueSize.value > 0) {
    const word = syncQueueSize.value > 1 ? 'files' : 'file';
    syncStatus.value = `Sync in progress (${syncQueueSize.value} ${word} remaining)`;
    timeToNextManual.value = manualMinimum;
  }
  // if havent synced for 30 minutes, enable button for manual full sync
  else {
    if (sinceLastSyncDate > manualMinimum) {
      syncButtonDisabled.value = false;
    } else {
      timeToNextManual.value = Math.ceil((manualMinimum - sinceLastSyncDate) / 60);
    }
    // if more than 1 day ago show date, otherwise use 'ago' format
    syncStatus.value =
      sinceLastSyncDate > 86400
        ? `Last synced: ${formatDateLong(bucket?.lastSyncRequestedDate || '')}`
        : `Last synced: ${formatDistance(lastSyncDate, now, { addSuffix: true })}`;
  }
};

onBeforeMount(async () => {
  // sync bucket if necessary
  const hasRead = permissionStore.getBucketPermissions.filter((p) => p.permCode === Permissions.READ);
  if (hasRead.length > 0) await autoSync();
});
</script>

<template>
  <div>
    <div
      v-if="displayUpload"
      class="mb-4"
    >
      <ObjectUpload
        :bucket-id="props.bucketId"
        :close-callback="closeUpload"
      />
    </div>
    <div
      v-if="!displayUpload"
      class="flex flex-row"
    >
      <Button
        v-if="permissionStore.isBucketActionAllowed(props.bucketId as string, getUserId, Permissions.CREATE)"
        v-tooltip.bottom="'Upload file'"
        class="flex mr-2"
        :disabled="displayUpload"
        aria-label="Upload file"
        @click="showUpload"
      >
        <span
          id="upload-panel-label"
          class="material-icons-outlined mr-1"
        >
          file_upload
        </span>
        Upload
      </Button>
      <DownloadObjectButton
        :disabled="displayUpload || selectedObjectIds.length === 0"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
        class="flex"
      />
      <DeleteObjectButton
        v-if="getIsAuthenticated"
        :disabled="displayUpload || selectedObjectIds.length === 0"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
        :hard-delete="false"
        class="flex"
        @on-object-deleted="onObjectDeleted"
      />

      <span class="flex align-items-center ml-auto">
        <small class="mr-2">{{ syncStatus }}</small>
        <span
          v-tooltip.left="
            syncButtonDisabled
              ? `Sync will be available in ${timeToNextManual} minutes`
              : 'Sync all files and sub-folders with storage'
          "
        >
          <SyncButton
            v-if="bucket && permissionStore.isBucketActionAllowed(bucket.bucketId, getUserId, Permissions.READ)"
            :disabled="syncButtonDisabled"
            :bucket-id="bucket?.bucketId"
            :mode="ButtonMode.BUTTON"
            :recursive="true"
          />
        </span>
      </span>
    </div>

    <div
      class="flex mt-4"
      :class="{ 'disable-overlay': displayUpload }"
    >
      <div class="flex-grow-1">
        <ObjectTable
          :key="objectTableKey"
          :bucket-id="props.bucketId"
          :is-bucket-public="props.isBucketPublic"
          :object-info-id="objectInfoId"
          @show-object-info="showObjectInfo"
        />
      </div>
      <div
        v-if="objectInfoId"
        class="flex-shrink-1 w-4"
      >
        <ObjectSidebar
          :object-id="objectInfoId"
          @close-object-info="closeObjectInfo"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.disable-overlay {
  pointer-events: none;
  opacity: 0.4;
}
</style>
