<script setup lang="ts">
// Vue
import { ref } from 'vue';
import { useRoute } from 'vue-router';
// PrimeVue
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
// State
import { useObjectStore } from '@/store';
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

const pendingFiles = ref([] as File[]);
const successfulFiles = ref([] as File[]);
const failedFiles = ref([] as File[]);

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
      event.files.map( async (file: File) => {
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

    // Update object list
    await objectStore.listObjects({ bucketId: bucketId });
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
          <Button @click="chooseCallback()">
            <font-awesome-icon
              icon="fa-solid fa-plus"
              class="mr-1"
            />Choose
          </Button>
          <Button
            class="p-button-outlined"
            :disabled="!files || files.length === 0"
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
          Drag and drop files to here to upload.
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
