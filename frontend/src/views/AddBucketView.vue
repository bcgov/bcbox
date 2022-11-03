<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import TextInput from '@/components/form/TextInput.vue';
import { Form } from 'vee-validate';
import { useUserStore } from '@/store/userStore';
import { validateRequired } from '@/utils/formValidators';

const userStore = useUserStore();

const success = ref(false);

function onSubmit(values: any, { resetForm }) {
  console.log(values);
  success.value = true;
  resetForm();
  userStore.addBucket({
    bucketId: values.bucketId,
    accessKeyId: values.accessKeyId,
    bucketName: values.bucketName,
    bucket: values.bucket,
  });
}
</script>

<template>
  <div v-if="success">
    <p>Bucket succesfully added.</p>
  </div>
  <div v-else>
    <Form @submit="onSubmit">
      <TextInput name="bucketId" label="Bucket ID" :rules="validateRequired" />
      <TextInput name="accessKeyId" label="Access Key ID" :rules="validateRequired" />
      <TextInput name="bucketName" label="Bucket Name" :rules="validateRequired" />
      <TextInput name="bucket" label="Bucket" :rules="validateRequired" />
      <Button type="submit" label="Submit" />
    </Form>
  </div>
</template>

<style lang="scss" scoped></style>
