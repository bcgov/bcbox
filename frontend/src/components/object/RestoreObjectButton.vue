<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
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
const emit = defineEmits(['on-object-restored', 'on-version-restored']);

// Store
const objectStore = useObjectStore();
const { focusedElement } = storeToRefs(useNavStore());
const { getObject } = storeToRefs(objectStore);

// State
const displayNoFileDialog = ref(false);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmRestore = () => {
  focusedElement.value = document.activeElement;
  const numberOfObjects = props.ids.length;
  if (numberOfObjects) {
    if (props.versionId) {
      confirm.require({
        message: 'Are you sure you want to restore the file with the this version?',
        header: 'Restore Version?',
        acceptLabel: 'Confirm',
        rejectLabel: 'Cancel',
        accept: async () => {
          try {
            const newVersion = await objectStore.restoreObject(props.ids[0], props.versionId);
            emit('on-version-restored', { versionId: newVersion.data.id });
            toast.success('Version restored');
          } catch (error: any) {
            toast.error('Unable to restore version', error.response?.data.detail ?? error, { life: 0 });
          }
        },
        onHide: () => onDialogHide(),
        reject: () => onDialogHide()
      });
    } else {
      let header: string, message: string, confirmation: string;
      const filename = getObject.value(props.ids[0])?.name;
      if (numberOfObjects > 1) {
        header = 'Restore Files?';
        message = `Are you sure you want to restore the selected ${numberOfObjects} files from the Recycle Bin?
          Once restored, the files will be returned to their original location.`;
        confirmation = `${numberOfObjects} have been successfully restored to their original location.`;
      } else {
        header = 'Restore File?';
        message = `Are you sure you want to restore this file from the Recycle Bin?
          Once restored, the file will be returned to its original location.`;

        confirmation = `${filename} has been successfully restored to its original location.`;
      }
      confirm.require({
        header: header,
        message: message,
        acceptLabel: 'Restore',
        rejectLabel: 'Cancel',
        accept: async () => {
          try {
            for (const id of props.ids) {
              await objectStore.restoreObject(id, undefined);
            }
            toast.success(`${numberOfObjects > 1 ? 'Files' : 'File'} Restored`, confirmation);
            emit('on-object-restored');
          } catch (error: any) {
            toast.error('Unable to restore file', error.response?.data.detail ?? error, { life: 0 });
          }
        },
        onHide: () => onDialogHide(),
        reject: () => onDialogHide()
      });
    }
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
    class="p-button-lg p-button-text p-button-primary"
    :disabled="props.disabled"
    :aria-label="props.versionId ? 'Restore this version' : 'Restore latest version'"
    @click="confirmRestore()"
  >
    <span class="material-icons-outlined">restore</span>
  </Button>
  <Button
    v-else
    v-tooltip.bottom="props.versionId ? 'Restore this version' : 'Restore selected files'"
    class="p-button mr-2"
    :disabled="props.disabled"
    :aria-label="props.versionId ? 'Restore this version' : 'Restore selected files'"
    @click="confirmRestore()"
  >
    <span class="material-icons-outlined mr-2">restore</span>
    Restore
  </Button>
</template>
