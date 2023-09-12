<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, Dialog} from '@/lib/primevue';
import { useObjectStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  id: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();

// State
const obj: Ref<COMSObject | undefined> = ref(undefined);

// Dialog
const displaySyncDialog = ref(false);

// Actions
const syncObject = () => {
  objectStore.syncObject(props.id);
  displaySyncDialog.value = false;
};

onMounted( () => {
  obj.value = objectStore.findObjectById(props.id);
});
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
      <span class="p-dialog-title">Synchronize object</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ obj?.name }}
    </h3>

    <ul class="mb-4">
      <li>This will schedule a synchronization of the file</li>
      <li>
        Use this if you are modifying it outside of BCBox,
        such as in another software application,
        and want to see those changes reflected in BCBox
      </li>
      <li>Do not use this feature if you aren't sure if you need it</li>
      <li>Synchronization duration is dependent on file size and server load</li>
    </ul>

    <Button
      class="mt-2"
      label="Submit sync request"
      type="submit"
      icon="pi pi-check"
      @click="syncObject"
    />
    <Button
      class="p-button-text mt-2"
      label="Cancel"
      icon="pi pi-times"
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
