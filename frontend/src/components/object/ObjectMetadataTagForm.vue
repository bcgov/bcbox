<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { object } from 'yup';

import TextInput from '@/components/form/TextInput.vue';
import { Button, useToast } from '@/lib/primevue';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

export type ObjectMetadataTagFormType = {
  filename: string;
  metadata?: Array<{ key: string; value: string }>;
  tagset?: Array<{ key: string; value: string }>;
};

// Props
type Props = {
  filename: string;
  obj?: COMSObject;
  metadata?: Array<{ key: string; value: string }>;
  tagset?: Array<{ key: string; value: string }>;
};

const props = withDefaults(defineProps<Props>(), {
  obj: undefined,
  metadata: () => [{key: '', value: ''}],
  tagset: () => [{key: '', value: ''}],
});

// Emits
const emit = defineEmits(['cancel-object-metadatatag-config', 'submit-object-metadatatag-config']);

// State
const metadata: Ref<Array<{ key: string; value: string }>> = ref(props.metadata);
const tagset: Ref<Array<{ key: string; value: string }>> = ref(props.tagset);

// Default form values
const initialValues: ObjectMetadataTagFormType = {
  filename: props.filename,
  metadata: props.metadata,
  tagset: props.tagset
};

// Form validation schema
const schema = object({});

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    // Remove any rows where key or value is empty
    values.metadata = values.metadata.filter( (x: {key: string, value: string}) => x.key && x.value );
    values.tagset = values.tagset.filter( (x: {key: string, value: string}) => x.key && x.value );

    emit('submit-object-metadatatag-config', {
      filename: props.filename,
      metadata: values.metadata,
      tagset: values.tagset
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

function addTagsetRow() {
  tagset.value.push({key: '', value: ''});
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
        <div class="col-12">
          <h2 class="font-bold">
            Metadata
          </h2>
        </div>
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
        <div class="col pb-0 mb-0">
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

      <div class="grid">
        <div class="col-12">
          <h2 class="font-bold">
            Tags
          </h2>
        </div>
        <div class="col">
          Key
        </div>
        <div class="col">
          Value
        </div>
      </div>
      <div
        v-for="(tag, index) of tagset"
        :key="index"
        class="grid"
      >
        <div class="col">
          <TextInput
            :name="'tagset.'+index+'.key'"
          />
        </div>
        <div class="col">
          <TextInput
            :name="'tagset.'+index+'.value'"
          />
        </div>
      </div>
      <div>
        <Button
          class="p-button-lg p-button-rounded p-button-text"
          @click="addTagsetRow"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
        </Button>
      </div>

      <Button
        class="mt-5"
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
