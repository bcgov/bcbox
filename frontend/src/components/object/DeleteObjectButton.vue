<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { useObjectStore } from '@/store/objectStore';
import { ButtonMode } from '@/utils/enums';

// Props
type Props = {
  disabled?: boolean;
  ids: Array<string>;
  mode: ButtonMode;
  versionId?: string; // Only use this when deleting a single object
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Emits
const emit = defineEmits(['on-deleted-success', 'on-deleted-error']);

// Store
const objectStore = useObjectStore();

// State
const displayNoFileDialog = ref(false);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmDelete = () => {
  if (props.ids.length) {
    const item = props.versionId ? 'version' : 'object';
    const msgContext = props.ids.length > 1 ? `the selected ${props.ids.length} ${item}s` : `this ${item}`;
    confirm.require({
      message: `Please confirm that you want to delete ${msgContext}.`,
      header: `Delete ${props.ids.length > 1 ? item + 's' : item}`,
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: async () => {
        for( const id of props.ids){
          try {
            await objectStore.deleteObjects([id], props.versionId);
            emit('on-deleted-success', props.versionId);
          }
          catch{
            // intentionally left blank
          }
        }
      }
    });
  } else {
    displayNoFileDialog.value = true;
  }
};
</script>

<template>
  <Dialog v-model:visible="displayNoFileDialog" header="No File Selected" :modal="true">
    <p>Please select at least one file from the list to delete.</p>
    <template #footer>
      <Button label="Ok" autofocus @click="displayNoFileDialog = false" />
    </template>
  </Dialog>

  <Button
    v-if="props.mode === ButtonMode.ICON"
    class="p-button-lg p-button-text p-button-danger"
    :disabled="props.disabled"
    aria-label="Delete object"
    @click="confirmDelete()"
  >
    <font-awesome-icon icon="fa-solid fa-trash" />
  </Button>
  <Button
    v-else
    class="p-button-outlined p-button-danger"
    :disabled="props.disabled"
    aria-label="Delete object"
    @click="confirmDelete()"
  >
    <font-awesome-icon
      icon="fa-solid fa-trash"
      class="mr-1"
    /> Delete
  </Button>
</template>
