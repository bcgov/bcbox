<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { object, string } from 'yup';

import Password from '@/components/form/Password.vue';
import TextInput from '@/components/form/TextInput.vue';
import { Button, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore } from '@/store';

import type { Bucket } from '@/types';

// Props
type Props = {
  bucket?: Bucket;
};

const props = withDefaults(defineProps<Props>(), {
  bucket: undefined
});

// Emits
const emit = defineEmits(['cancel-bucket-config', 'submit-bucket-config']);

// Store
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());

// Default form values
const initialValues = {
  bucketName: props.bucket?.bucketName,
  bucket: props.bucket?.bucket,
  endpoint: props.bucket?.endpoint,
  accessKeyId: props.bucket?.accessKeyId,
  secretAccessKey: props.bucket?.secretAccessKey,
  key: props.bucket?.key
};

// Form validation schema
const schema = object({
  bucketName: string().max(255).required().label('Bucket name'),
  bucket: string().max(255).required().label('Bucket'),
  endpoint: string().max(255).required().label('Endpoint'),
  accessKeyId: string().max(255).required().label('Access Key ID'),
  secretAccessKey: string().max(255).required().label('Secret Access Key'),
  key: string().max(255).label('Key')
});

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    const formBucket = {
      bucketName: values.bucketName,
      bucket: values.bucket,
      endpoint: values.endpoint,
      accessKeyId: values.accessKeyId !== 'REDACTED' ? values.accessKeyId : undefined,
      secretAccessKey:
        values.secretAccessKey !== 'REDACTED' ? values.secretAccessKey : undefined,
      key: values.key.trim() ? values.key : '/',
      active: true
    } as Bucket;

    props.bucket ?
      await bucketStore.updateBucket(props.bucket?.bucketId, formBucket) :
      await bucketStore.createBucket(formBucket);

    await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
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

const onCancel = () => {
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
        label="Bucket name *"
        placeholder="My Documents"
        helptext="Your custom display name for the bucket."
      />
      <TextInput
        name="bucket"
        label="Bucket *"
        placeholder="bucket0123456789"
        helptext="Your storage provider's bucket identifier."
      />
      <TextInput
        name="endpoint"
        label="Endpoint *"
        placeholder="https://example.com/"
        helptext="The URL of the object storage server."
      />
      <Password
        name="accessKeyId"
        label="Access key identifier / Username *"
        placeholder="username"
        helptext="User/Account identifier or username."
      />
      <Password
        name="secretAccessKey"
        label="Secret access key *"
        placeholder="password"
        helptext="A password used to access the bucket."
      />
      <TextInput
        name="key"
        label="Key"
        placeholder="directory"
        helptext="An optional path prefix within a bucket. The path will be created if it doesn't already exist."
      />
      <Button
        class="mt-2"
        label="Apply"
        type="submit"
        icon="pi pi-check"
        autofocus
      />
      <Button
        class="p-button-text mt-2"
        label="Cancel"
        icon="pi pi
        -times"
        @click="onCancel"
      />
    </Form>
  </div>
</template>

<style lang="scss" scoped>

:deep(.p-inputtext) {
  width: 65% !important;
}

:deep(.pi-eye) {
  right: auto !important;
  margin-left: 10px;
}

:deep(.pi-eye-slash) {
  right: auto !important;
  margin-left: 10px;
}
</style>
