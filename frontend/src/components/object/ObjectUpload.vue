<script setup lang="ts">
// Vue
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
// PrimeVue
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
// State
import { useObjectStore } from '@/store/objectStore';
// Component
import ObjectUploadFile from '@/components/object/ObjectUploadFile.vue';

defineProps({
  closeCallback: {
    type: Function,
    required: true,
  },
});

const objectStore = useObjectStore();
const route = useRoute();
const toast = useToast();

const files = ref([] as File[]);
const uploadedFiles = ref([] as File[]);
const failedFiles = ref([] as File[]);

const onSelectedFiles = (event: any) => {
  files.value = event.files;
  console.log('Selected files...');
  console.log(files.value);
};

const onUpload = async (event: any) => {
  const bucketId = route.query.bucketId?.toString();

  if (bucketId) {
    // Reset file arrays before upload
    uploadedFiles.value = [];
    failedFiles.value = [];

    // Attempt to create objects one by one
    for (let file of event.files) {
      try {
        await objectStore.createObject(file, bucketId);
        uploadedFiles.value.push(file);
      } catch (error) {
        failedFiles.value.push(file);
        toast.add({ severity: 'error', summary: 'Error', detail: `Failed to upload file ${file.name}`, life: 3000 });
      }
    }

    // Clear selected files at the end of upload process
    files.value = [];

    // Update object list
    await objectStore.listObjects({ bucketId: bucketId });
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: `Failed to acquire bucket ID`, life: 3000 });
  }
};

const onRemoveUploadedFile = async (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

const onRemoveFailedFile = async (index: number) => {
  failedFiles.value.splice(index, 1);
};
</script>

<template>
  <FileUpload name="objectUpload" :multiple="true" :customUpload="true" @select="onSelectedFiles" @uploader="onUpload">
    <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
      <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
        <div class="flex gap-2">
          <Button @click="chooseCallback()"> <font-awesome-icon icon="fa-solid fa-plus" class="mr-1" />Choose</Button>
          <Button @click="uploadCallback()" class="p-button-outlined" :disabled="!files || files.length === 0">
            <font-awesome-icon icon="fa-solid fa-upload" class="mr-1" />Start upload</Button
          >
          <Button
            @click="
              () => {
                clearCallback();
                closeCallback();
              }
            "
            class="p-button-outlined"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="mr-1" />Close</Button
          >
        </div>
      </div>
    </template>
    <template #empty>
      <div class="flex align-items-center justify-content-center flex-column mb-3">
        <font-awesome-icon icon="fa-solid fa-upload" class="border-2 border-dashed border-circle p-5 text-7xl text-400 border-400" />
        <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
      </div>
      <ObjectUploadFile :files="uploadedFiles" :badgeProps="{ value: 'Complete', severity: 'success' }" :removeCallback="onRemoveUploadedFile" />
      <ObjectUploadFile :files="failedFiles" :badgeProps="{ value: 'Failed', severity: 'danger' }" :removeCallback="onRemoveFailedFile" />
    </template>
    <template #content="{ files, uploadedFiles, removeFileCallback, removeUploadedFileCallback }">
      <ObjectUploadFile :files="files" :badgeProps="{ value: 'Pending', severity: 'warning' }" :removeCallback="removeFileCallback" />
      <ObjectUploadFile
        :files="uploadedFiles"
        :badgeProps="{ value: 'Complete', severity: 'success' }"
        :removeCallback="removeUploadedFileCallback"
      />
      <ObjectUploadFile :files="failedFiles" :badgeProps="{ value: 'Failed', severity: 'danger' }" :removeCallback="removeUploadedFileCallback" />
    </template>
  </FileUpload>
</template>
