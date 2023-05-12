<script setup lang="ts">
import { ref } from 'vue';

import { Button, useConfirm, useToast } from '@/lib/primevue';
import { useObjectStore } from '@/store';

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
const objectStore = useObjectStore();

// State
const fileInput: Ref<any> = ref(null);
const file: Ref<File | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmUpdate = () => {
  confirm.require({
    message: 'Please confirm that you want to upload a new version. All other versions will still be stored.',
    header: 'Upload new version',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: async () => {
      onUpload();
    },
    reject: () => {
      // Intentionally left empty
    },
  });
};

const onChange = async (event: any) => {
  file.value = event.target.files[0];
  emit('on-file-changed');
  confirmUpdate();
};

const onSelectFile = async () => {
  fileInput.value.click();
};

const onUpload = async () => {
  try {
    if( file.value ) {
      // Infinite timeout for big files upload to avoid timeout error
      await objectStore.updateObject(file.value, props.objectId, { timeout: 0 });
      emit('on-file-uploaded');
      toast.success('File uploaded');
    }
  } catch (error: any) {
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
  />
</template>
