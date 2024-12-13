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
const emit = defineEmits(['on-restored-success', 'on-restored-error']);

// Store
const objectStore = useObjectStore();
const { focusedElement } = storeToRefs(useNavStore());

// State
const displayNoFileDialog = ref(false);

// Actions
const confirm = useConfirm();

const confirmRestore = () => {
  focusedElement.value = document.activeElement;
  if (props.ids.length) {
    const item = props.versionId ? 'version' : 'object';
    const msgContext = props.ids.length > 1 ? `the selected ${props.ids.length} ${item}s` : `this ${item}`;
    confirm.require({
      message: `Please confirm that you want to restore ${msgContext}.`,
      header: `Restore ${props.ids.length > 1 ? item + 's' : item}`,
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        props.ids?.forEach((id: string) => {
          objectStore
            .restoreObject(id, props.versionId)
            .then(() => {
              // versionsId, hard
              emit('on-restored-success', props.versionId, true, false);
            })
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
    <p>Please select at least one file from the list to restore.</p>
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
    v-tooltip.bottom="props.versionId ? 'Restore this version' : 'Restore latest version'"
    class="p-button-lg p-button-text p-button-success"
    :disabled="props.disabled"
    :aria-label="props.versionId ? 'Restore this version' : 'Restore latest version'"
    @click="confirmRestore()"
  >
    <font-awesome-icon icon="fa-solid fa-trash-restore" />
  </Button>
  <Button
    v-else
    v-tooltip.bottom="props.versionId ? 'Restore this version' : 'Restore latest version'"
    class="p-button-outlined p-button-success"
    :disabled="props.disabled"
    :aria-label="props.versionId ? 'Restore this version' : 'Restore latest version'"
    @click="confirmRestore()"
  >
    <font-awesome-icon
      icon="fa-solid fa-trash-restore"
      class="mr-1"
    />
    Restore
  </Button>
</template>
