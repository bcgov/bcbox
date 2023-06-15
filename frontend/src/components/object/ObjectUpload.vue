<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import ObjectUploadFile from '@/components/object/ObjectUploadFile.vue';
import { Button, FileUpload, useToast } from '@/lib/primevue';
import { useAuthStore, useAppStore, useObjectStore } from '@/store';

import type { Ref } from 'vue';
import type { ObjectMetadataTagFormType } from '@/components/object/ObjectMetadataTagForm.vue';

// Props
type Props = {
  bucketId?: string;
  closeCallback: Function;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const appStore = useAppStore();
const objectStore = useObjectStore();
const { getUserId } = storeToRefs(useAuthStore());

// State
const pendingFiles: Ref<Array<File>> = ref([]);
const successfulFiles: Ref<Array<File>> = ref([]);
const failedFiles: Ref<Array<File>> = ref([]);

// Actions
let formData: Array<ObjectMetadataTagFormType> = [];
const toast = useToast();

const onSelectedFiles = (event: any) => {
  pendingFiles.value = event.files;
};

const onUpload = async (event: any) => {
  const bucketId = props.bucketId?.toString();

  if (bucketId) {
    // Reset file arrays before upload
    successfulFiles.value = [];
    failedFiles.value = [];

    toast.info('File upload starting...');

    // Send all files to COMS for upload
    await Promise.allSettled(
      event.files.map(async (file: File) => {
        try {
          appStore.beginUploading();

          const data = formData.find( (x: ObjectMetadataTagFormType) => x.filename === file.name );

          await objectStore.createObject(
            file,
            { metadata: data?.metadata },
            { bucketId: bucketId, tagset: data?.tagset},
            { timeout: 0 } // Infinite timeout for big files upload to avoid timeout error
          );
          successfulFiles.value.push(file);
        } catch (error: any) {
          toast.error(`Failed to upload file ${file.name}`, error);
          failedFiles.value.push(file);
        }
        finally {
          appStore.endUploading();
        }
      })
    );

    // Clear metadata and tagset information - clears children as well
    formData = [];

    // Clear selected files at the end of upload process
    pendingFiles.value = [];

    // Update object store
    await objectStore.fetchObjects({ bucketId: bucketId, userId: getUserId.value, bucketPerms: true });
  } else {
    toast.error('Updating file', 'Failed to acquire bucket ID');
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

const submitObjectMetaTagConfig = (values: Array<ObjectMetadataTagFormType>) => formData = values;
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
              props.closeCallback();
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
          Drag and drop files here to select for upload. Then click "Start upload".
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
        :editable="true"
        :files="files || pendingFiles"
        :badge-props="{ value: 'Pending', severity: 'warning' }"
        :form-data="formData"
        :remove-callback="removeFileCallback"
        @submit-object-metadatatag-config="submitObjectMetaTagConfig"
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
