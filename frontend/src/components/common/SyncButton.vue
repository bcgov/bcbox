<script setup lang="ts">
import { ref } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, Dialog, useToast } from '@/lib/primevue';
import { useObjectStore, useBucketStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId?: string;
  objectId?: string;
  labelText?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: '',
  objectId: '',
  labelText:''
});

// State
const name: Ref<String> = ref('');

// Store
const objectStore = useObjectStore();
const bucketStore = useBucketStore();
const toast = useToast();

// Dialog
const displaySyncDialog = ref(false);

// Actions
const onSubmit = () => {
  if (props.objectId) {
    objectStore.syncObject(props.objectId);
  } else if (props.bucketId) {
    bucketStore.syncBucket(props.bucketId);
  } else {
    toast.error('', 'Unable to synchronize');
  }

  displaySyncDialog.value = false;
};

const onClick = () => {
  displaySyncDialog.value = true;
  if (props.bucketId) {
    name.value = bucketStore.findBucketById(props.bucketId)?.bucketName ?? '';
  } else if (props.objectId) {
    name.value = objectStore.findObjectById(props.objectId)?.name ?? '';
  }
};
</script>

<template>
  <Dialog
    v-model:visible="displaySyncDialog"
    header="Synchronize"
    :modal="true"
    :style="{ minWidth: '50vw' }"
    class="bcbox-info-dialog"
  >
    <template #header>
      <font-awesome-icon
        icon="fas fa-sync"
        fixed-width
      />
      <span
        v-if="props.bucketId"
        class="p-dialog-title"
      >
        Synchronize Bucket
      </span>
      <span
        v-else
        class="p-dialog-title"
      >
        Synchronize File
      </span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ name }}
    </h3>

    <ul class="mb-4 ml-1.5">
      <li v-if="props.bucketId">This will schedule a synchronization of the bucket's contents</li>
      <li v-else>This will schedule a synchronization of the file</li>
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
    />
    <Button
      class="no-indent p-button-outlined mt-2"
      label="Cancel"
      @click="displaySyncDialog = false"
    />
  </Dialog>

  <Button
    v-tooltip.bottom="{ value: labelText }"
    class="p-button-lg p-button-text"
    :aria-label="labelText"
    @click="onClick"
  >
    <font-awesome-icon icon="fa-solid fa-sync" />
  </Button>
</template>
