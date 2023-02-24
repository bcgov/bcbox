<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import ObjectUploadFile from '@/components/object/ObjectUploadFile.vue';
import { Button, FileUpload, useToast } from '@/lib/primevue';
import { useObjectStore, useUserStore } from '@/store';

import type { Ref } from 'vue';

// Props
defineProps<{
  closeCallback: Function,
}>();

// Store
const objectStore = useObjectStore();
const { currentUser } = storeToRefs(useUserStore());

// State
const pendingFiles: Ref<Array<File>> = ref([]);
const successfulFiles: Ref<Array<File>> = ref([]);
const failedFiles: Ref<Array<File>> = ref([]);

// Actions
const route = useRoute();
const toast = useToast();

const onSelectedFiles = (event: any) => {
  pendingFiles.value = event.files;
};

const onUpload = async (event: any) => {
  const bucketId = route.query.bucketId?.toString();

  if (bucketId) {
    // Reset file arrays before upload
    successfulFiles.value = [];
    failedFiles.value = [];

    // Send all files to COMS for upload
    await Promise.allSettled(
      event.files.map(async (file: File) => {
        try {
          await objectStore.createObject(file, bucketId);
          successfulFiles.value.push(file);
        } catch (error) {
          toast.add({ severity: 'error', summary: 'Error', detail: `Failed to upload file ${file.name}`, life: 3000 });
          failedFiles.value.push(file);
        }
      })
    );

    // Clear selected files at the end of upload process
    pendingFiles.value = [];

    // Update object store
    await objectStore.fetchObjects({ bucketId: bucketId });
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to acquire bucket ID', life: 3000 });
  }
};

const onRemoveUploadedFile = async (index: number) => {
  successfulFiles.value.splice(index, 1);
};

const onRemoveFailedFile = async (index: number) => {
  failedFiles.value.splice(index, 1);
};

// Based on files prop from upload component, are we in ready to upload mode
const noFilesChosen = (files?: Array<File>): boolean => !files?.length;
</script>

<template>
  <FileUpload
    name="objectUpload"
    :multiple="true"
    :custom-upload="true"
    @select="onSelectedFiles"
    @uploader="onUpload"
  >
    <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
      <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
        <div class="flex gap-2">
          <Button
            :class="{ 'p-button-outlined': !noFilesChosen(files) }"
            @click="chooseCallback()"
          >
            <font-awesome-icon
              icon="fa-solid fa-plus"
              class="mr-1"
            />Choose
          </Button>
          <Button
            :class="{ 'p-button-outlined': noFilesChosen(files) }"
            :disabled="noFilesChosen(files)"
            @click="uploadCallback()"
          >
            <font-awesome-icon
              icon="fa-solid fa-upload"
              class="mr-1"
            />Start upload
          </Button>
          <Button
            class="p-button-outlined"
            @click="() => {
              clearCallback();
              closeCallback();
            }"
          >
            <font-awesome-icon
              icon="fa-solid fa-xmark"
              class="mr-1"
            />Close
          </Button>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="flex align-items-center justify-content-center flex-column mb-3">
        <font-awesome-icon
          icon="fa-solid fa-upload"
          class="border-2 border-dashed border-circle p-5 text-7xl text-400 border-400"
        />
        <p class="mt-4 mb-0">
          Drag and drop files here to upload.
        </p>
      </div>
      <ObjectUploadFile
        :files="successfulFiles"
        :badge-props="{ value: 'Complete', severity: 'success' }"
        :remove-callback="onRemoveUploadedFile"
      />
      <ObjectUploadFile
        :files="failedFiles"
        :badge-props="{ value: 'Failed', severity: 'danger' }"
        :remove-callback="onRemoveFailedFile"
      />
    </template>
    <template #content="{ files, uploadedFiles, removeFileCallback, removeUploadedFileCallback }">
      <ObjectUploadFile
        :files="files || pendingFiles"
        :badge-props="{ value: 'Pending', severity: 'warning' }"
        :remove-callback="removeFileCallback"
      />
      <ObjectUploadFile
        :files="uploadedFiles || successfulFiles"
        :badge-props="{ value: 'Complete', severity: 'success' }"
        :remove-callback="removeUploadedFileCallback"
      />
      <ObjectUploadFile
        :files="failedFiles"
        :badge-props="{ value: 'Failed', severity: 'danger' }"
        :remove-callback="removeUploadedFileCallback"
      />
    </template>
  </FileUpload>
</template>
