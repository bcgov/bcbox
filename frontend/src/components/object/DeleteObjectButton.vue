<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';
import type { PropType } from 'vue';

// PrimeVue / Fonts
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
const confirmDelete = () => {
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
};
</script>

<template>
  <Button v-if="mode === ButtonMode.ICON" class="p-button-lg p-button-text p-button-danger" @click="confirmDelete()">
    <font-awesome-icon icon="fa-solid fa-trash" />
  </Button>
  <Button v-else class="p-button-outlined p-button-danger mr-2" @click="confirmDelete()">
    <font-awesome-icon icon="fa-solid fa-trash" class="mr-1" /> Delete
  </Button>
</template>
