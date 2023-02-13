<script setup lang="ts">
import Button from 'primevue/button';
import { Form } from 'vee-validate';
import * as yup from 'yup';
import { useBucketStore } from '@/store';
import { useToast } from 'primevue/usetoast';
import TextInput from '@/components/form/TextInput.vue';
import type { Bucket } from '@/interfaces';

const props = defineProps<{
  isUpdate: boolean;
  bucket?: Bucket;
}>();

const bucketStore = useBucketStore();
const toast = useToast();

const emit = defineEmits(['submit-bucket-config', 'cancel-bucket-config']);

const initialValues = {
  bucketName: props.bucket?.bucketName,
  bucket: props.bucket?.bucket,
  endpoint: props.bucket?.endpoint,
  accessKeyId: props.bucket?.accessKeyId,
  secretAccessKey: props.bucket?.secretAccessKey,
  key: props.bucket?.key
};

const schema = yup.object({
  bucketName: yup.string().max(255).required().label('Bucket name'),
  bucket: yup.string().max(255).required().label('Bucket'),
  endpoint: yup.string().max(255).required().label('Endpoint'),
  accessKeyId: yup.string().max(255).required().label('Access Key ID'),
  secretAccessKey: yup.string().max(255).required().label('Secret Access Key'),
  key: yup.string().max(255).required().label('Key'),
});

const onSubmit = async (values: any) => {

  try {
    const formBucket = {
      bucketName: values.bucketName,
      bucket: values.bucket,
      endpoint: values.endpoint,
      accessKeyId: values.accessKeyId,
      secretAccessKey: values.secretAccessKey,
      key: values.key
    } as Bucket;

    props.isUpdate ?
      await bucketStore.updateBucket(props.bucket!.bucketId, formBucket) :
      await bucketStore.createBucket(formBucket);

    await bucketStore.load();
    emit('submit-bucket-config');

    toast.add(
      {
        severity: 'success',
        summary: 'Success',
        detail: 'Bucket configuration successful',
        life: 3000
      }
    );
  } catch (error: any) {
    emit('cancel-bucket-config');
    toast.add(
      {
        severity: 'error',
        summary: 'Bucket configuration was not successful',
        detail: error,
        life: 5000
      }
    );
  }
};

const onCancel = async () => {
  emit('cancel-bucket-config');
};
</script>

<template>
  <div>
    <Form
      :initial-values="initialValues"
      :validation-schema="schema"
      @submit="onSubmit"
    >
      <TextInput
        name="bucketName"
        label="Bucket name (what other users will see)"
      />
      <TextInput
        name="bucket"
        label="Bucket"
      />
      <TextInput
        name="endpoint"
        label="Endpoint"
      />
      <TextInput
        name="accessKeyId"
        label="Access key Identifier"
      />
      <TextInput
        name="secretAccessKey"
        label="Secret access key"
      />
      <TextInput
        name="key"
        label="Key"
      />
      <Button
        label="Apply"
        type="submit"
        icon="pi pi-check"
        autofocus
      />
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="onCancel"
      />
    </Form>
  </div>
</template>

<style lang="scss" scoped>

:deep(.p-inputtext) {
  width: 65% !important;
}

button {
  margin-top: 20px;
}
</style>
