<script setup lang="ts">
import { ref } from 'vue';

import { Button, useConfirm, useToast } from '@/lib/primevue';
import { useAppStore, useObjectStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId: string,
  objectId: string
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['on-file-changed', 'on-file-uploaded']);

// Store
const appStore = useAppStore();
const objectStore = useObjectStore();

// State
const fileInput: Ref<any> = ref(null);
const file: Ref<File | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmUpdate = () => {
  confirm.require({
    message: 'Please confirm that you want to upload a new version.',
    header: 'Upload new version',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => onUpload()
  });
};

const onChange = (event: any) => {
  file.value = event.target.files[0];
  emit('on-file-changed');
  confirmUpdate();
};

const onSelectFile = () => {
  fileInput.value.click();
};

const onUpload = async () => {
  try {
    if( file.value ) {
      toast.info('File upload starting...');
      appStore.beginUploading();

      // Infinite timeout for big files upload to avoid timeout error
      await objectStore.updateObject(file.value, props.objectId, { timeout: 0 });

      // No finally block as we need this called before potential navigation
      appStore.endUploading();

      emit('on-file-uploaded');
      toast.success('File uploaded');
    }
  } catch (error: any) {
    appStore.endUploading();
    toast.error(`File upload: ${file.value?.name}`, error);
  }
};
</script>

<template>
  <Button
    outlined
    @click="onSelectFile"
  >
    <font-awesome-icon
      icon="fa-solid fa-upload"
      class="mr-1"
    />
    Upload new version
  </Button>
  <input
    ref="fileInput"
    type="file"
    style="display: none"
    accept="*"
    @change="onChange"
    @click="(event: any) => event.target.value = null"
  />
</template>
