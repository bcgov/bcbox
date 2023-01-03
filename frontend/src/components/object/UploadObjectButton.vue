<script setup lang="ts">
// Vue
import { ref } from 'vue';
// PrimeVue
import Button from 'primevue/button';
// State
import { useObjectStore } from '@/store/objectStore';

const objectStore = useObjectStore();

// Props
const props = defineProps({
  bucketId: {
    type: String,
  },
});

// Refs
const isSelecting = ref(false);
const selectedFile = ref<any>(null);
const uploader = ref<any>(null);

// Methods
const handleFileImport = () => { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  isSelecting.value = true;

  // After obtaining the focus when closing the FilePicker, return the button state to normal
  window.addEventListener(
    'focus',
    () => {
      isSelecting.value = false;
    },
    { once: true }
  );

  // Trigger click on the FileInput
  uploader.value.click();
};

const onFileChanged = async (e: any) => { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  selectedFile.value = e.target.files[0];
  await objectStore.createObject(selectedFile.value, props.bucketId);
  selectedFile.value = null;
};
</script>

<template>
  <Button class="mr-2">
    <font-awesome-icon
      icon="fa-solid fa-upload"
      class="mr-1"
    /> Upload
  </Button>
</template>
