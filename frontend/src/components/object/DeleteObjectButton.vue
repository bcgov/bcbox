<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';
import { ref, type PropType } from 'vue';

// PrimeVue / Fonts / etc
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
// State
import { useObjectStore } from '@/store/objectStore';
const objectStore = useObjectStore();

const confirm = useConfirm();
const toast = useToast();

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

// Deletion
const displayNoFileDialog = ref(false);
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
          await objectStore.deleteObjectList(props.ids);
        } catch (error) {
          toast.add({ severity: 'error', summary: 'Error deleting one or more files', detail: error, life: 3000 });
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
  <Dialog header="No File Selected" v-model:visible="displayNoFileDialog" :modal="true">
    <p>Please select at least one file from the list to delete.</p>
    <template #footer>
      <Button label="Ok" @click="displayNoFileDialog = false" autofocus />
    </template>
  </Dialog>

  <Button v-if="mode === ButtonMode.ICON" class="p-button-lg p-button-text p-button-danger" @click="confirmDelete()">
    <font-awesome-icon icon="fa-solid fa-trash" />
  </Button>
  <Button v-else class="p-button-outlined p-button-danger" @click="confirmDelete()">
    <font-awesome-icon icon="fa-solid fa-trash" class="mr-1" /> Delete
  </Button>
</template>
