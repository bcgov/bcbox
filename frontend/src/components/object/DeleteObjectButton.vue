<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';
import { ref, type PropType } from 'vue';

// PrimeVue / Fonts
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Dialog from 'primevue/dialog';

const confirm = useConfirm();

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
    confirm.require({
      message: `Please confirm that you want to delete the selected ${props.ids.length > 1 ? 'files' : 'file'}`,
      header: `Delete ${props.ids.length > 1 ? 'items' : 'item'}`,
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        // TODO: Delete items
        alert(`Not Implemented Yet (IDs ${props.ids})`);
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
