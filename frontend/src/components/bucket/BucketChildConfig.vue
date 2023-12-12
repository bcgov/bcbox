<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { ref, onMounted } from 'vue';
import { object, string } from 'yup';

import TextInput from '@/components/form/TextInput.vue';
import { Button, Dialog, Message, useToast } from '@/lib/primevue';
import { useBucketStore } from '@/store';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Props
const props = defineProps<{
  parentBucket: Bucket;
}>();

const validationMessages: Ref<Array<string>> = ref([]);

// Store
const bucketStore = useBucketStore();

// Form validation schema
const schema = object({
  bucketName: string().required().max(255).label('Folder display name'),
  subKey: string()
    .required()
    .matches(/[^/\\]+$/, 'Folder sub-path must not contain back or forward slashes')
    .label('Folder sub-path')
});

// Actions
const toast = useToast();
const dialogIsVisible: Ref<boolean> = ref(false);
const showDialog = (x: boolean) => {
  dialogIsVisible.value = x;
};

const onSubmit = async (values: any) => {
  try {
    const formData = {
      bucketName: values.bucketName.trim(),
      subKey: values.subKey.trim()
    };
    // create bucket
    await bucketStore.createBucketChild(props.parentBucket.bucketId, formData.subKey, formData.bucketName);
    showDialog(false);
    toast.success('Adding Folder to a bucket', 'Folder configuration successful');
  } catch (error: any) {
    validationMessages.value = [];
    validationMessages.value.push(error.response.data.detail);
  }
};
const onCancel = () => {
  showDialog(false);
};
</script>

<template>
  <Button
    v-tooltip.bottom="'Add folder to a bucket'"
    class="p-button-lg p-button-text"
    aria-label="Add folder to a bucket"
    @click="showDialog(true)"
  >
    <font-awesome-icon icon="fa-solid fa-folder-plus" />
  </Button>

  <Dialog
    class="bcbox-info-dialog"
    :style="{ width: '50vw' }"
    :modal="true"
    :visible="dialogIsVisible"
    @update:visible="showDialog(false)"
  >
    <template #header>
      <font-awesome-icon
        icon="fas fa-cog"
        fixed-width
      />
      <span class="p-dialog-title">Add Folder to bucket</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead mb-0">{{ props.parentBucket.bucketName }}</h3>
    <ul class="mt-0 pl-3">
      <li>Sets a folder to appear within a bucket</li>
    </ul>
    <Form
      :validation-schema="schema"
      @submit="onSubmit"
    >
      <Message
        v-for="msg of validationMessages"
        :key="msg"
        severity="error"
      >
        {{ msg }}
      </Message>
      <TextInput
        name="subKey"
        label="Folder sub-path"
        placeholder="my-documents"
        help-text="The directory will be created if it does not already exist.
          Sub-paths are supported using '/' between levels.
          This value cannot be changed after it is set."
      />
      <TextInput
        name="bucketName"
        label="Folder display name *"
        placeholder="My Documents"
        help-text="Your custom display name for the bucket - any name as you would like to see it listed in BCBox."
        autofocus
      />
      <Button
        class="p-button mt-2 mr-2"
        label="Save"
        type="submit"
      />
      <Button
        class="p-button-outlined mt-2"
        label="Cancel"
        @click="onCancel"
      />
    </Form>
  </Dialog>
</template>

<style lang="scss" scoped>
:deep(.p-inputtext) {
  width: 100% !important;
}
</style>
