<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { object, string } from 'yup';

import Password from '@/components/form/Password.vue';
import TextInput from '@/components/form/TextInput.vue';
import { Button, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore } from '@/store';
import { differential, joinPath } from '@/utils/utils';

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
      secretAccessKey: values.secretAccessKey,
    } as Bucket;

    // Only add key for new configurations
    if( !props.bucket && values.key ) {
      formBucket.key = joinPath(values.key);
    }

    props.bucket ?
      await bucketStore.updateBucket(props.bucket?.bucketId, differential(formBucket, initialValues)) :
      await bucketStore.createBucket(formBucket);

    await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
    emit('submit-bucket-config');

    toast.success('Configuring bucket', 'Bucket configuration successful');
  } catch (error: any) {
    toast.error('Configuring bucket', error);
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
        help-text="Your custom display name for the bucket - any name as you would like to see it listed in BCBox."
        autofocus
      />
      <TextInput
        name="bucket"
        label="Bucket *"
        placeholder="bucket0123456789"
        help-text="The name of the bucket given to you, e.g. yxwgj"
      />
      <TextInput
        name="endpoint"
        label="Endpoint *"
        placeholder="https://example.com/"
        help-text="The URL of your object storage namespace without the bucket identifier/name."
      />
      <Password
        name="accessKeyId"
        label="Access key identifier / User account *"
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
        label="Key/Folder"
        placeholder="directory"
        help-text="A folder prefix within a bucket. The folder will be created if it doesn't already exist.
          Will default to '/' if not provided. This value cannot be changed after the bucket is configured."
        :disabled="!!props.bucket"
      />
      <Button
        class="mt-2"
        label="Apply"
        type="submit"
        icon="pi pi-check"
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
  width: 100% !important;
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
