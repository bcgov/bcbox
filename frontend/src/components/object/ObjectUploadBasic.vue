<script setup lang="ts">
import { ref } from 'vue';

import { Button, useToast } from '@/lib/primevue';
import { useObjectStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId: string,
  objectId: string
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();

// State
const fileInput: Ref<any> = ref(null);
const file: Ref<File | undefined> = ref(undefined);

// Actions
const toast = useToast();

const onChange = async (event: any) => {
  file.value = event.target.files[0];
  onUpload();
};

const onSelectFile = async () => {
  fileInput.value.click();
};

const onUpload = async () => {
  try {
    if( file.value ) {
      // Infinite timeout for big files upload to avoid timeout error
      await objectStore.updateObject(file.value, props.objectId, { timeout: 0 });
    }
  } catch (error: any) {
    toast.error(`Failed to upload file ${file.value?.name}`, error);
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
