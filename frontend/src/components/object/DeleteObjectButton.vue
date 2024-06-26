<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { Button, Dialog, useConfirm } from '@/lib/primevue';
import { useNavStore, useObjectStore } from '@/store';
import { ButtonMode } from '@/utils/enums';
import { onDialogHide } from '@/utils/utils';

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
const { focusedElement } = storeToRefs(useNavStore());

// State
const displayNoFileDialog = ref(false);

// Actions
const confirm = useConfirm();

const confirmDelete = () => {
  focusedElement.value = document.activeElement;
  if (props.ids.length) {
    const item = props.versionId ? 'version' : 'object';
    const msgContext = props.ids.length > 1 ? `the selected ${props.ids.length} ${item}s` : `this ${item}`;
    confirm.require({
      message: `Please confirm that you want to delete ${msgContext}.`,
      header: `Delete ${props.ids.length > 1 ? item + 's' : item}`,
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        props.ids?.forEach((id: string) => {
          objectStore
            .deleteObject(id, props.versionId)
            .then(() => emit('on-deleted-success', props.versionId))
            .catch(() => {});
        });
      },
      onHide: () => onDialogHide(),
      reject: () => onDialogHide()
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
    v-tooltip.bottom="props.versionId ? 'Delete version' : 'Delete file'"
    class="p-button-lg p-button-text p-button-danger"
    :disabled="props.disabled"
    :aria-label="props.versionId ? 'Delete version' : 'Delete file'"
    @click="confirmDelete()"
  >
    <font-awesome-icon icon="fa-solid fa-trash" />
  </Button>
  <Button
    v-else
    v-tooltip.bottom="props.versionId ? 'Delete version' : 'Delete file'"
    class="p-button-outlined p-button-danger"
    :disabled="props.disabled"
    :aria-label="props.versionId ? 'Delete version' : 'Delete file'"
    @click="confirmDelete()"
  >
    <font-awesome-icon
      icon="fa-solid fa-trash"
      class="mr-1"
    />
    Delete
  </Button>
</template>
