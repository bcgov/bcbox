<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { Button, Dialog, useToast } from '@/lib/primevue';
import { useObjectStore } from '@/store';
import { ButtonMode } from '@/utils/enums';

const toast = useToast();

// Props
type Props = {
  disabled?: boolean;
  ids: Array<string>;
  mode: ButtonMode;
  versionId?: string; // Only use this when downloading a single object
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Store
const objectStore = useObjectStore();

// State
const displayNoFileDlg = ref(false);

// Actions
const download = () => {
  if (props.ids.length) {
    // For now we are looping the supplied IDs (if multiple selected) until there is a batching feature
    let alerted = false;
    for (let i of props.ids) {
      // get S3 url
      objectStore.getObjectUrl(i, props.versionId).then((url) => {
        // open new tab, window or save dialog
        const newTab = window.open(url, '_blank');
        // if browser blocked new tab
        if (newTab === null && !alerted) {
          toast.warn('Downloading Objects', 'Your browser blocked multiple new tabs from opening.', { life: 0 });
          alerted = true;
        }
      });
    }
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
    v-tooltip.bottom="'Download object'"
    class="p-button-lg p-button-text"
    :disabled="props.disabled"
    aria-label="Download object"
    @click="download()"
  >
    <font-awesome-icon icon="fa-solid fa-download" />
  </Button>
  <Button
    v-else
    v-tooltip.bottom="'Download object'"
    class="mr-2"
    outlined
    :disabled="props.disabled"
    aria-label="Download object"
    @click="download()"
  >
    <font-awesome-icon
      icon="fa-solid fa-download"
      class="mr-1"
    />
    Download
  </Button>
</template>
