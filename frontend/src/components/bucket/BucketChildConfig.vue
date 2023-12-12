<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { ref, onMounted } from 'vue';
import { object, string } from 'yup';

import TextInput from '@/components/form/TextInput.vue';
import { Button, Dialog, Message, useToast } from '@/lib/primevue';
import { useBucketStore } from '@/store';

import type { Ref } from 'vue';

// Props
const props = defineProps<{
  parentBucketId: string;
}>();

const validationMessages: Ref<Array<string>> = ref([]);

// Store
const bucketStore = useBucketStore();

// Form validation schema
const schema = object({
  bucketName: string().max(255).required().label('Folder name'),
  subKey: string()
    .matches(/^[^\\]+$/, 'Sub-path must not contain backslashes')
    .max(255)
    .required()
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
      bucketName: values.bucketName,
      subKey: values.subKey
    };
    // call service
    await bucketStore.createBucketChild(props.parentBucketId, formData.subKey, formData.bucketName);
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
  <div>
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
        <span class="p-dialog-title">Add Folder</span>
      </template>

      <h3 class="bcbox-info-dialog-subhead">sub-head</h3>

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
          label="Sub-path"
          placeholder="documents"
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
          class="p-button mt-2 mr-1"
          label="Apply"
          type="submit"
          icon="pi pi-check"
        />
        <Button
          class="p-button-outlined mt-2"
          label="Cancel"
          icon="pi pi-times"
          @click="onCancel"
        />
      </Form>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.p-inputtext) {
  width: 100% !important;
}
</style>
