<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { ref, watch } from 'vue';
import { object, string } from 'yup';

import TextInput from '@/components/form/TextInput.vue';
import { Button, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore } from '@/store';
import { differential } from '@/utils/utils';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

export type ObjectMetadataTagFormType = {
  filename: string;
  metadata?: Array<{ key: string; value: string }>;
  tags?: Array<{ key: string; value: string }>;
};

// Props
type Props = {
  filename: string;
  obj?: COMSObject;
  metadata?: Array<{ key: string; value: string }>;
  tags?: Array<{ key: string; value: string }>;
};

const props = withDefaults(defineProps<Props>(), {
  obj: undefined,
  metadata: () => [{key: '', value: ''}],
  tags: () => [{key: '', value: ''}],
});

// Emits
const emit = defineEmits(['cancel-object-metadatatag-config', 'submit-object-metadatatag-config']);

// Store
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());

// State
const metadata: Ref<Array<{ key: string; value: string }>> = ref(props.metadata);

// Default form values
const initialValues: ObjectMetadataTagFormType = {
  filename: props.filename,
  metadata: props.metadata,
  tags: props.tags
};

// Form validation schema
const schema = object({});

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    // Remove any rows where key or value is empty
    values.metadata = values.metadata.filter( (x: {key: string, value: string}) => x.key && x.value );
    values.tags = values.tags.filter( (x: {key: string, value: string}) => x.key && x.value );

    emit('submit-object-metadatatag-config', {
      filename: props.filename,
      metadata: values.metadata,
      tags: values.tags
    } as ObjectMetadataTagFormType);
  } catch (error: any) {
    toast.error('Adding metadata and tags', error);
  }
};

const onCancel = () => {
  emit('cancel-object-metadatatag-config');
};

function addMetadataRow() {
  metadata.value.push({key: '', value: ''});
}
</script>

<template>
  <div>
    <Form
      :initial-values="initialValues"
      :validation-schema="schema"
      @submit="onSubmit"
    >
      <div class="grid">
        <div class="col">
          Key
        </div>
        <div class="col">
          Value
        </div>
      </div>

      <div
        v-for="(meta, index) of metadata"
        :key="index"
        class="grid"
      >
        <div class="col">
          <TextInput
            :name="'metadata.'+index+'.key'"
          />
        </div>
        <div class="col">
          <TextInput
            :name="'metadata.'+index+'.value'"
          />
        </div>
      </div>

      <div>
        <Button
          class="p-button-lg p-button-rounded p-button-text"
          @click="addMetadataRow"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
        </Button>
      </div>

      <Button
        class="mt-2"
        label="Save"
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
</style>
