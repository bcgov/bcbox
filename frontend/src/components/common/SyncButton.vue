<script setup lang="ts">
import { ref } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, Dialog, useToast } from '@/lib/primevue';
import { useObjectStore, useBucketStore } from '@/store';


// Props
type Props = {
  type: string;
  id: string;
  name: string;
};

const BUCKET = 'bucket';
const OBJECT = 'object';

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();
const bucketStore = useBucketStore();
const toast = useToast();

// Dialog
const displaySyncDialog = ref(false);

// Actions
const syncFunction = () => {
  switch (props.type) {
    case OBJECT:
      objectStore.syncObject(props.id);
      break;
    case BUCKET:
      bucketStore.syncBucket(props.id);
      break;
    default:
      toast.error('', 'Unable to synchronize');
      break;
  }

  displaySyncDialog.value = false;
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
      <span class="p-dialog-title">Synchronize {{ props.type }}</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ props.name }}
    </h3>

    <ul class="mb-4">
      <li v-if="props.type === BUCKET">
        This will schedule a synchronization of the bucket's contents
      </li>
      <li v-else>
        This will schedule a synchronization of the file
      </li>
      <li>
        Use this if you are modifying it outside of BCBox,
        such as in another software application,
        and want to see those changes reflected in BCBox
      </li>
      <li>Synchronization duration is dependent on server load</li>
    </ul>

    <Button
      class="no-indent p-button mr-1 mt-2"
      label="Submit sync request"
      type="submit"
      @click="syncFunction"
    />
    <Button
      class="no-indent p-button-outlined mt-2"
      label="Cancel"
      @click="displaySyncDialog = false"
    />
  </Dialog>

  <Button
    class="p-button-lg p-button-text"
    @click="displaySyncDialog = true"
  >
    <font-awesome-icon icon="fa-solid fa-sync" />
  </Button>
</template>

<style scoped lang="scss">
h2 {
  font-weight: bold;
}
ul {
  padding-left: 22px;
}
</style>
