<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { Button, Dialog, useConfirm, useToast} from '@/lib/primevue';
import { useNavStore, useObjectStore, useVersionStore } from '@/store';
import { ButtonMode } from '@/utils/enums';
import { onDialogHide } from '@/utils/utils';

// Props
type Props = {
  disabled?: boolean;
  ids: Array<string>;
  mode: ButtonMode;
  versionId?: string; // Only use this when deleting a single object
  hardDelete?: boolean // are we doing a hardDelete delete?
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined,
  hardDelete: false
});

// Emits
const emit = defineEmits(['on-object-deleted', 'on-version-deleted']);

// Store
const objectStore = useObjectStore();
const versionStore = useVersionStore();
const { focusedElement } = storeToRefs(useNavStore());

// Getters
const { getIsVersioningEnabled } = storeToRefs(versionStore);

// State
const displayNoFileDialog = ref(false);
const bucketVersioningEnabled = computed(() => getIsVersioningEnabled.value(props.ids[0]));

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmDelete = async () => {
  focusedElement.value = document.activeElement;
  const numberOfObjects = props.ids.length;
  if (numberOfObjects) {
    // refresh version store to determine if bucketVersioningEnabled
    await versionStore.fetchVersions({ objectId: props.ids[0] });
    // if versionId provided, and versioning is enabled on bucket, delete version
    if(props.versionId && bucketVersioningEnabled.value) {
      confirm.require({
        message: 'Are you sure you want to permanently delete this version?',
        header: 'Delete Version?',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        accept: async () => {
          try {
            await objectStore.deleteVersion(props.ids[0], props.versionId);
            emit('on-version-deleted', { versionId: props.versionId });
            toast.success('Version deleted');
          }
          catch (error) {
            toast.error('Unable to delete version');
          }
        },
        onHide: () => onDialogHide(),
        reject: () => onDialogHide()
      });
    }
    // else deleting an object
    else {
      const isPermanent = props.hardDelete || !bucketVersioningEnabled.value;
      const msgContext = numberOfObjects > 1 ? `the selected ${numberOfObjects} files` : 'this file';
      let header, message;
      if(!isPermanent){
        header =`Delete ${numberOfObjects > 1 ? 'files' : 'file'}?`,
        message =  `Are you sure you want to delete ${msgContext}?
          If Versioning is enabled on the object storage server, deleted files are moved to the Recycle Bin`;
      } else {
        header =`Permanently Delete ${numberOfObjects > 1 ? 'files' : 'file'}?`,
        message =  `This action cannot be undone. Are you sure you want to permanently delete ${msgContext}.
          Once deleted, these files cannot be restored`;
      }
      confirm.require({
        message: message,
        header: header,
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        accept: async () => {
          try {
            for (const id of props.ids) {
              await objectStore.deleteObject(id, props.hardDelete);
            };
            // to break on single failure (use promise.all ?)
            toast.success(`${numberOfObjects} ${numberOfObjects > 1 ? 'files' : 'file'} deleted`);
            emit('on-object-deleted', { hardDelete: props.hardDelete });
          }
          catch (error) {
            toast.error('Unable to delete File(s)');
          }
        },
        onHide: () => onDialogHide(),
        reject: () => onDialogHide()
      });
    }
  }

  else {
    displayNoFileDialog.value = true;
  }
};
const buttonLabel = computed(() => {
  return props.hardDelete ?
    (props.versionId ?
      'Permanently delete version' : (props.ids.length > 1 ?
        'Permanently delete selected files' : 'Permanently delete file')) :
    (props.versionId ? 'Delete version' : 'Delete file' );
});
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
    v-tooltip.bottom="buttonLabel"
    class="p-button-lg p-button-text p-button-primary"
    :disabled="props.disabled"
    :aria-label="buttonLabel"
    @click="confirmDelete()"
  >
    <font-awesome-icon icon="fa-solid fa-trash" />
  </Button>
  <Button
    v-else
    v-tooltip.bottom="buttonLabel"
    class="p-button-outlined"
    :disabled="props.disabled"
    :aria-label="buttonLabel"
    @click="confirmDelete()"
  >
    <font-awesome-icon
      icon="fa-solid fa-trash"
      class="mr-1"
    />
    Delete
  </Button>
</template>
