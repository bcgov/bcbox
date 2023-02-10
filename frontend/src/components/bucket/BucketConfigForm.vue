<script setup lang="ts">
import Button from 'primevue/button';
import { Form } from 'vee-validate';
import { useBucketStore } from '@/store';
import { useToast } from 'primevue/usetoast';
import TextInput from '@/components/form/TextInput.vue';
import { validateRequired } from '@/utils/formValidators';
import type { Bucket } from '@/interfaces';

const props = defineProps<{
  isUpdate: boolean;
  bucket?: Bucket;
}>();

const bucketStore = useBucketStore();
const toast = useToast();

const emit = defineEmits(['submit-bucket-config', 'cancel-bucket-config']);

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
  finally {
    emit('submit-bucket-config');
  }
};

const onCancel = async () => {
  emit('cancel-bucket-config');
};
</script>

<template>
  <div>
    <Form
      @submit="onSubmit"
    >
      <TextInput
        :value="props.bucket?.bucketName"
        name="bucketName"
        label="Bucket name (what other users will see)"
        :rules="validateRequired"
      />
      <TextInput
        :value="props.bucket?.bucket"
        name="bucket"
        label="Bucket"
        :rules="validateRequired"
      />
      <TextInput
        :value="props.bucket?.endpoint"
        name="endpoint"
        label="Endpoint"
        :rules="validateRequired"
      />
      <TextInput
        :value="props.bucket?.accessKeyId"
        name="accessKeyId"
        label="Access key Identifier"
        :rules="validateRequired"
      />
      <TextInput
        :value="props.bucket?.secretAccessKey"
        name="secretAccessKey"
        label="Secret access key"
        :rules="validateRequired"
      />
      <TextInput
        :value="props.bucket?.key"
        name="key"
        label="Key"
        :rules="validateRequired"
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
