<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { ObjectMetadataTagForm } from '@/components/object';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { useAppStore, useMetadataStore, useObjectStore, useTagStore, useVersionStore } from '@/store';

import type { Ref } from 'vue';
import type { ObjectMetadataTagFormType } from '@/components/object/ObjectMetadataTagForm.vue';

// Props
type Props = {
  bucketId: string;
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['on-file-changed', 'on-file-uploaded']);

// Store
const appStore = useAppStore();
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const tagStore = useTagStore();
const versionStore = useVersionStore();

// Getters
const { getIsVersioningEnabled } = storeToRefs(versionStore);

// State
const { getObject } = storeToRefs(objectStore);
const { getTaggingByObjectId } = storeToRefs(tagStore);
const { getMetadataByObjectId } = storeToRefs(metadataStore);

const fileInput: Ref<any> = ref(null);
const file: Ref<File | undefined> = ref(undefined);

const editing: Ref<boolean> = ref(false);
const formData: Ref<ObjectMetadataTagFormType> = ref({
  filename: ''
});
let objectMetadata: Array<{ key: string; value: string }> | undefined = undefined;
let objectTagging: Array<{ key: string; value: string }> | undefined = undefined;

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmUpdate = () => {
  let confirmMessage = 'Please confirm that you want to upload a new version.';
  if (!getIsVersioningEnabled.value(props.objectId)) {
    confirmMessage = 'This is a non-versioned bucket. ' + 'Uploading a new version will overwrite the current version.';
  }
  confirm.require({
    message: confirmMessage,
    header: 'Upload new version',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => {
      onUpload();
      closeModal();
    }
  });
};

const onChange = (event: any) => {
  file.value = event.target.files[0];
  emit('on-file-changed');
  showModal();
};

const onSelectFile = () => {
  fileInput.value.click();
};

const onUpload = async () => {
  try {
    if (file.value) {
      toast.info('File upload starting...');
      appStore.beginUploading();

      const newVersionId = await objectStore.updateObject(
        props.objectId,
        file.value,
        { metadata: objectMetadata },
        { tagset: objectTagging },
        { timeout: 0 } // Infinite timeout for big files upload to avoid timeout error
      );

      // No finally block as we need this called before potential navigation
      appStore.endUploading();

      emit('on-file-uploaded', newVersionId);
      toast.success('File uploaded');
    }
  } catch (error: any) {
    appStore.endUploading();
    toast.error(`File upload: ${file.value?.name}`, error.response?.data.detail ?? error, { life: 0 });
  }
};

const showModal = () => {
  formData.value.filename = getObject.value(props.objectId)?.name ?? '';
  formData.value.metadata = getMetadataByObjectId.value(props.objectId)?.metadata;
  formData.value.tagset = getTaggingByObjectId.value(props.objectId)?.tagset;

  editing.value = true;
};

const submitModal = async (values: ObjectMetadataTagFormType) => {
  objectMetadata = values.metadata;
  objectTagging = values.tagset;
  confirmUpdate();
};

const closeModal = () => {
  editing.value = false;
};
</script>

<template>
  <Button
    outlined
    @click="onSelectFile"
  >
    <span
      id="upload-panel-label"
      class="material-icons-outlined mr-1"
    >
      file_upload
    </span>
    Upload new version
  </Button>
  <input
    ref="fileInput"
    type="file"
    style="display: none"
    accept="*"
    @change="onChange"
    @click="(event: any) => (event.target.value = null)"
  />

  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    v-model:visible="editing"
    :draggable="false"
    :modal="true"
    class="bcbox-info-dialog"
  >
    <!-- eslint-enable vue/no-v-model-argument -->
    <template #header>
      <font-awesome-icon
        icon="fa-solid fa-pen-to-square"
        fixed-width
      />
      <span class="p-dialog-title">New version's metadata and tags</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ formData.filename }}
    </h3>

    <ObjectMetadataTagForm
      :filename="formData.filename"
      :metadata="formData.metadata"
      :tagset="formData.tagset"
      @submit-object-metadatatag-config="submitModal"
      @cancel-object-metadatatag-config="closeModal"
    />
  </Dialog>
</template>
