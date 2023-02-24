<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, Dialog } from '@/lib/primevue';
import { useObjectStore } from '@/store';
import { ButtonMode } from '@/utils/enums';

// Props
const props = defineProps({
  mode: {
    type: String as PropType<ButtonMode>,
    required: true,
  },
  ids: {
    type: Array<string>,
    required: true,
  },
});

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
    v-if="mode === ButtonMode.ICON"
    class="p-button-lg p-button-text"
    @click="download()"
  >
    <font-awesome-icon icon="fa-solid fa-download" />
  </Button>
  <Button
    v-else
    class="p-button-outlined mr-2"
    @click="download()"
  >
    <font-awesome-icon
      icon="fa-solid fa-download"
      class="mr-1"
    /> Download
  </Button>
</template>
