<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { Button, Dialog } from '@/lib/primevue';
import { useObjectStore } from '@/store';
import { ButtonMode } from '@/utils/enums';

// Props
type Props = {
  disabled?: boolean;
  ids: Array<string>;
  mode: ButtonMode;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();

// State
const displayNoFileDlg = ref(false);

// Actions
const download = () => {
  if (props.ids.length) {
    // For now we are looping the supplied IDs (if multiple selected) until there is a batching feature
    props.ids.forEach((i) => {
      objectStore.downloadObject(i, undefined);
    });
  } else {
    displayNoFileDlg.value = true;
  }
};
</script>

<template>
  <Dialog
    v-model:visible="displayNoFileDlg"
    header="No File Selected"
    :modal="true"
  >
    <p>Please select at least one file from the list to download.</p>
    <template #footer>
      <Button
        label="Ok"
        autofocus
        @click="displayNoFileDlg = false"
      />
    </template>
  </Dialog>

  <Button
    v-if="props.mode === ButtonMode.ICON"
    class="p-button-lg p-button-text"
    :disabled="props.disabled"
    @click="download()"
  >
    <font-awesome-icon icon="fa-solid fa-download" />
  </Button>
  <Button
    v-else
    class="mr-2"
    outlined
    :disabled="props.disabled"
    @click="download()"
  >
    <font-awesome-icon
      icon="fa-solid fa-download"
      class="mr-1"
    /> Download
  </Button>
</template>
