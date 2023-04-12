<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { object, string } from 'yup';

import Password from '@/components/form/Password.vue';
import TextInput from '@/components/form/TextInput.vue';
import { Button, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore } from '@/store';
import { differential } from '@/utils/utils';

import type { Bucket } from '@/types';

export type BucketForm = {
  accessKeyId?: string;
  bucket?: string;
  bucketName?: string;
  endpoint?: string;
  key?: string;
  secretAccessKey?: string;
};

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
const initialValues: BucketForm = {
  accessKeyId: props.bucket?.accessKeyId,
  bucket: props.bucket?.bucket,
  bucketName: props.bucket?.bucketName,
  endpoint: props.bucket?.endpoint,
  key: props.bucket?.key,
  secretAccessKey: props.bucket?.secretAccessKey
};

// Form validation schema
const schema = object({
  accessKeyId: string().max(255).required().label('Access Key ID'),
  bucket: string().max(255).required().label('Bucket'),
  bucketName: string().max(255).required().label('Bucket name'),
  endpoint: string().max(255).required().label('Endpoint'),
  key: string().max(255).label('Key'),
  secretAccessKey: string().max(255).required().label('Secret Access Key')
});

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    const formBucket = {
      accessKeyId: values.accessKeyId,
      bucket: values.bucket,
      bucketName: values.bucketName,
      endpoint: values.endpoint,
      key: values.key ? values.key : '/',
      secretAccessKey: values.secretAccessKey,
    } as Bucket;

    props.bucket ?
      await bucketStore.updateBucket(props.bucket?.bucketId, differential(formBucket, initialValues)) :
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
        help-text="Your custom display name for the bucket."
      />
      <TextInput
        name="bucket"
        label="Bucket *"
        placeholder="bucket0123456789"
        help-text="Your storage provider's bucket identifier."
      />
      <TextInput
        name="endpoint"
        label="Endpoint *"
        placeholder="https://example.com/"
        help-text="The URL of the object storage server."
      />
      <Password
        name="accessKeyId"
        label="Access key identifier / Username *"
        placeholder="username"
        help-text="User/Account identifier or username."
      />
      <Password
        name="secretAccessKey"
        label="Secret access key *"
        placeholder="password"
        help-text="A password used to access the bucket."
      />
      <TextInput
        name="key"
        label="Key"
        placeholder="directory"
        help-text="An optional path prefix within a bucket. The path will be created if it doesn't already exist."
        :disabled="!!props.bucket"
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
        icon="pi pi-times"
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
