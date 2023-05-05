<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { error } from '@/services/toastService';
import { useObjectStore } from '@/store/objectStore';
import { Button, Dialog, useConfirm } from '@/lib/primevue';
import { ButtonMode } from '@/utils/enums';

// Props
type Props = {
  disabled?: boolean;
  ids: Array<string>;
  mode: ButtonMode;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['on-deleted-success', 'on-deleted-error']);


// Store
const objectStore = useObjectStore();

// State
const displayNoFileDialog = ref(false);

// Actions
const confirm = useConfirm();

const confirmDelete = () => {
  if (props.ids.length) {
    const msgContext = props.ids.length > 1 ? `the selected ${props.ids.length} files` : 'this file';
    confirm.require({
      message: `Please confirm that you want to delete ${msgContext}`,
      header: `Delete ${props.ids.length > 1 ? 'items' : 'item'}`,
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: async () => {
        try {
          await objectStore.deleteObjects(props.ids);
          emit('on-deleted-success');
        } catch (e: any) {
          error('Deleting files', e);
          emit('on-deleted-error');
        }
      },
      reject: () => {
        // Intentionally left empty
      },
    });
  } else {
    displayNoFileDialog.value = true;
  }
};
</script>

<template>
  <Dialog
    v-model:visible="displayNoFileDialog"
    header="No File Selected"
    :modal="true"
  >
    <p>Please select at least one file from the list to delete.</p>
    <template #footer>
      <Button
        label="Ok"
        autofocus
        @click="displayNoFileDialog = false"
      />
    </template>
  </Dialog>

  <Button
    v-if="props.mode === ButtonMode.ICON"
    class="p-button-lg p-button-text p-button-danger"
    :disabled="props.disabled"
    @click="confirmDelete()"
  >
    <font-awesome-icon icon="fa-solid fa-trash" />
  </Button>
  <Button
    v-else
    class="p-button-outlined p-button-danger"
    :disabled="props.disabled"
    @click="confirmDelete()"
  >
    <font-awesome-icon
      icon="fa-solid fa-trash"
      class="mr-1"
    /> Delete
  </Button>
</template>
