<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { Button, Dialog, useToast } from '@/lib/primevue';
import { useObjectStore, useBucketStore, useNavStore } from '@/store';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';
import { onDialogHide } from '@/utils/utils';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId?: string;
  objectId?: string;
  recursive: boolean;
  labelText?: string;
  disabled?: boolean;
  mode: ButtonMode;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: '',
  objectId: '',
  recursive: false,
  labelText: '',
  disabled: false
});

// State
const name: Ref<String> = ref('');
const lastSyncedDate: Ref<String> = ref('');
const lastSyncRequestedDate: Ref<String> = ref('');

// Store
const objectStore = useObjectStore();
const bucketStore = useBucketStore();
const toast = useToast();
const { focusedElement } = storeToRefs(useNavStore());

// Dialog
const displaySyncDialog = ref(false);

// Actions
const onSubmit = async () => {
  try{
    if (props.objectId) {
      await objectStore.syncObject(props.objectId);
    } else if (props.bucketId) {
      await bucketStore.syncBucket(props.bucketId, props.recursive);
    }
    toast.info('Sync in progress', '');
  } catch(error: any){
    toast.error(error, '', { life: 0 });
  }
  displaySyncDialog.value = false;
};

const onClick = () => {
  focusedElement.value = document.activeElement;
  displaySyncDialog.value = true;
  if (props.bucketId) {
    const bucket = bucketStore.getBucket(props.bucketId);
    name.value = bucket?.bucketName ?? '';
    lastSyncRequestedDate.value = formatDateLong(bucket?.lastSyncRequestedDate as string);
  } else if (props.objectId) {
    const object = objectStore.getObject(props.objectId);
    name.value = object?.name ?? '';
    lastSyncedDate.value = formatDateLong(object?.lastSyncedDate as string);
  }
};
</script>

<template>
  <Dialog
    id="sync_dialog"
    v-model:visible="displaySyncDialog"
    header="Synchronize"
    :modal="true"
    :style="{ minWidth: '50vw' }"
    class="bcbox-info-dialog"
    aria-labelledby="sync_dialog_label"
    aria-describedby="sync_dialog_desc"
    @after-hide="onDialogHide"
  >
    <template #header>
      <span class="material-icons-outlined">sync</span>
      <span
        v-if="props.bucketId"
        id="sync_dialog_label"
        class="p-dialog-title"
      >
        Synchronize storage location
      </span>
      <span
        v-else
        class="p-dialog-title"
      >
        Synchronize File
      </span>
    </template>

    <h3
      id="sync_dialog_desc"
      class="bcbox-info-dialog-subhead"
    >
      {{ name }}
    </h3>

    <span class="mr-2">Last sync date:</span>
    <strong>
      <span v-if="lastSyncRequestedDate">
        {{ lastSyncRequestedDate }}
      </span>
      <span v-else-if="lastSyncedDate">
        {{ lastSyncedDate }}
      </span>
      <span v-else>(none)</span>
    </strong>

    <ul class="mb-4 ml-1.5">
      <!-- recursive bucket-->
      <li v-if="props.bucketId && props.recursive">
        This will schedule a
        <strong>Full</strong>
        synchronization of all files and any sub-folders with the source storage location.
      </li>
      <!-- flat bucket -->
      <li v-else-if="props.bucketId">
        This will schedule a synchronization of the folder's contents with its source storage location.
      </li>
      <!-- object -->
      <li v-else>This will schedule a synchronization of any new versions or metadata found in the storage location</li>
      <li>
        Use this if you are modifying it outside of BCBox, such as in another software application, and want to see
        those changes reflected in BCBox
      </li>
      <li>Synchronization duration is dependent on server load</li>
    </ul>

    <Button
      class="no-indent p-button mr-1 mt-2"
      label="Submit sync request"
      type="submit"
      @click="onSubmit"
      @keyup.enter="onSubmit"
    />
    <Button
      class="no-indent p-button-outlined mt-2"
      label="Cancel"
      @click="displaySyncDialog = false"
    />
  </Dialog>

  <!-- <Button
    v-tooltip.bottom="{ value: labelText }"
    class="p-button-lg p-button-text"
    :aria-label="labelText"
    @click="onClick"
  >
  <span class="material-icons-outlined">sync</span>
  </Button> -->

  <Button
    v-if="props.mode === ButtonMode.ICON"
    v-tooltip.bottom="{ value: labelText }"
    class="p-button-lg p-button-text p-button-primary btn-delete-text"
    :disabled="props.disabled"
    :aria-label="labelText"
    @click="onClick"
  >
    <span class="material-icons-outlined">sync</span>
  </Button>
  <Button
    v-else
    v-tooltip.bottom="{ value: labelText }"
    class="p-button-outlined btn-delete"
    :disabled="props.disabled"
    :aria-label="labelText"
    @click="onClick"
  >
    <span class="material-icons-outlined mr-1 sync-icon">sync</span>
    Sync
  </Button>
</template>
