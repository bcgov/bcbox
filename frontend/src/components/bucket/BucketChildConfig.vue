<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { object, string } from 'yup';

import TextInput from '@/components/form/TextInput.vue';
import { Button, Dialog, Message, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore, useNavStore } from '@/store';
import { onDialogHide } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Props
const props = defineProps<{
  parentBucket: Bucket;
}>();

// Store
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());
const { focusedElement } = storeToRefs(useNavStore());

// Form validation
const validationMessages: Ref<Array<string>> = ref([]);
const schema = object({
  bucketName: string().required().max(255).label('Folder display name'),
  subKey: string()
    .required()
    .matches(/^[^\\]+$/, { excludeEmptyString: true, message: 'Path must not contain backslashes' })
});

// Actions
const toast = useToast();
const dialogIsVisible: Ref<boolean> = ref(false);
const showDialog = (x: boolean) => {
  dialogIsVisible.value = x;
  if (dialogIsVisible.value) {
    focusedElement.value = document.activeElement;
  }
};

const onSubmit = async (values: any) => {
  try {
    const formData = {
      bucketName: values.bucketName.trim(),
      subKey: values.subKey.trim()
    };
    // create bucket
    await bucketStore.createBucketChild(props.parentBucket.bucketId, formData.subKey, formData.bucketName);
    // refresh stores
    await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
    showDialog(false);
    toast.success('Adding subfolder', 'Folder configuration successful');
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
    v-tooltip.bottom="'Add subfolder'"
    class="p-button-lg p-button-text"
    aria-label="Add subfolder"
    @click="showDialog(true)"
  >
    <font-awesome-icon icon="fa-solid fa-folder-plus" />
  </Button>

  <Dialog
    aria-labelledby="subfolder_label"
    aria-describedby="subfolder_desc"
    class="bcbox-info-dialog"
    :style="{ width: '50vw' }"
    :modal="true"
    :visible="dialogIsVisible"
    @update:visible="showDialog(false)"
    @after-hide="onDialogHide"
  >
    <template #header>
      <font-awesome-icon
        icon="fas fa-cog"
        fixed-width
      />
      <span
        id="subfolder_label"
        class="p-dialog-title"
      >
        Add subfolder
      </span>
    </template>
    <h3
      id="subfolder_desc"
      class="bcbox-info-dialog-subhead mb-0"
    >
      {{ props.parentBucket.bucketName }}
    </h3>
    <ul class="mt-0 pl-3">
      <li>Sets a subfolder to appear within a folder</li>
    </ul>
    <Form
      id="add-subfolder"
      aria-label="Add subfolder"
      :validation-schema="schema"
      role="form"
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
        label="Path"
        placeholder="my-documents"
        :help-text="`The relative path of the subfolder.
          You can pick a new path or choose an existing object storage path,
          but it can't be changed after it is set.<br />
          Folder levels are supported using '/' between levels (for example: 2024/January/my-documents).`"
        class="child-input"
        focus-trap
      />
      <TextInput
        name="bucketName"
        label="Folder display name *"
        placeholder="My Documents"
        help-text="Your custom display name for the subfolder - any name as you would like to see it listed in BCBox."
        class="child-input"
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
<style scoped lang="scss">
.child-input:deep(input) {
  width: 70%;
}
</style>
