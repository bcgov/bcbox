<script setup lang="ts">
import { FieldArray, Form } from 'vee-validate';
import { onBeforeMount } from 'vue';

import TextInput from '@/components/form/TextInput.vue';
import { Button, useToast } from '@/lib/primevue';
import { MAX_TAGS } from '@/utils/constants';

export type ObjectMetadataTagFormType = {
  filename: string;
  metadata?: Array<{ key: string; value: string }>;
  tagset?: Array<{ key: string; value: string }>;
};

// Props
type Props = {
  filename: string;
  metadata?: Array<{ key: string; value: string }>;
  metadataEditable?: boolean;
  tagset?: Array<{ key: string; value: string }>;
  tagsetEditable?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  metadata: () => [{key: '', value: ''}],
  metadataEditable: true,
  tagset: () => [{key: '', value: ''}],
  tagsetEditable: true,
});

// Emits
const emit = defineEmits(['cancel-object-metadatatag-config', 'submit-object-metadatatag-config']);

// Default form values
const initialValues: ObjectMetadataTagFormType = {
  filename: props.filename,
  metadata: props.metadata,
  tagset: props.tagset
};

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    // Remove any rows where key or value is empty
    values.metadata = values.metadata.filter( (x: {key: string, value: string}) => x.key && x.value );
    values.tagset = values.tagset.filter( (x: {key: string, value: string}) => x.key && x.value );

    emit('submit-object-metadatatag-config', {
      filename: props.filename,
      metadata: values.metadata.length ? values.metadata : undefined,
      tagset: values.tagset.length ? values.tagset : undefined
    } as ObjectMetadataTagFormType);
  } catch (error: any) {
    toast.error('Adding metadata and tags', error);
  }
};

const onCancel = () => {
  emit('cancel-object-metadatatag-config');
};

onBeforeMount(() => {
  initialValues.tagset = initialValues.tagset?.filter( (x: {key: string, value: string}) => x.key !== 'coms-id' );
});
</script>

<template>
  <div>
    <Form
      :initial-values="initialValues"
      @submit="onSubmit"
    >
      <span v-if="metadataEditable">
        <div class="grid">
          <div class="col-12">
            <h2 class="font-bold">
              Metadata
            </h2>
          </div>
          <div class="grid col-11 pb-0 pt-0">
            <div class="col-6">
              Key
            </div>
            <div class="col-6">
              Value
            </div>
          </div>
          <div class="col" />
        </div>
        <FieldArray
          v-slot="{ fields, push, remove }"
          name="metadata"
        >
          <div
            v-for="(meta, index) of fields"
            :key="'metadata.'+index"
            class="grid"
          >
            <div class="grid col-11">
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
            <div class="col flex align-content-center justify-content-center p-0">
              <Button
                class="p-button-lg p-button-text p-button-danger p-0"
                @click="() => { remove(index); if(!fields.length) push({});}"
              >
                <font-awesome-icon icon="fa-solid fa-minus" />
              </Button>
            </div>
          </div>
          <div class="mb-4">
            <Button
              class="p-button p-button-text p-0"
              @click="push({})"
            >
              <font-awesome-icon
                icon="fa-solid fa-plus"
                class="mr-1"
              /> Add row
            </Button>
          </div>
        </FieldArray>
      </span>

      <span v-if="tagsetEditable">
        <div class="grid">
          <div class="col-12">
            <h2 class="font-bold">
              Tags
            </h2>
          </div>
          <div class="grid col-11">
            <div class="col-6 pt-0">
              Key
            </div>
            <div class="col-6 pt-0">
              Value
            </div>
          </div>
          <div class="col" />
        </div>
        <FieldArray
          v-slot="{ fields, push, remove }"
          name="tagset"
        >
          <div
            v-for="(tag, index) of fields"
            :key="index"
            class="grid"
          >
            <div class="grid col-11 pb-0 pt-0">
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
            <div class="col flex align-content-center justify-content-center p-0">
              <Button
                class="p-button-lg p-button-text p-button-danger p-0"
                @click="() => { remove(index); if(!fields.length) push({});}"
              >
                <font-awesome-icon icon="fa-solid fa-minus" />
              </Button>
            </div>
          </div>
          <div class="mb-4">
            <Button
              v-if="fields.length < MAX_TAGS"
              class="p-button p-button-text p-0"
              @click="push({})"
            >
              <font-awesome-icon
                icon="fa-solid fa-plus"
                class="mr-1"
              /> Add row
            </Button>
            <div v-if="fields.length >= MAX_TAGS">
              <font-awesome-icon
                icon="fa-solid fa-triangle-exclamation"
                class="mr-1"
              /> Tag limit reached
            </div>
          </div>
        </FieldArray>
      </span>

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

:deep(.field) {
  margin-bottom: -5px !important;
}
</style>
