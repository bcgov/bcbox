<script setup lang="ts">
import { filesize } from 'filesize';
import { ref, toRaw } from 'vue';

import { ObjectMetadataTagForm } from '@/components/object';
import { Badge, Button, Dialog } from '@/lib/primevue';

import type { Ref } from 'vue';
import type { ObjectMetadataTagFormType } from '@/components/object/ObjectMetadataTagForm.vue';

// Props
type Props = {
  editable?: boolean;
  files: Array<any>; // TODO: Change any to more specific type
  badgeProps: any;
  formData?: Array<ObjectMetadataTagFormType>;
  removeCallback: Function;
};

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  formData: () => []
});

// Emits
const emit = defineEmits(['submit-object-metadatatag-config']);

// State
const editing: Ref<boolean> = ref(false);
const initialModalData: Ref<ObjectMetadataTagFormType> = ref({
  filename: ''
});
const formData: Ref<Array<ObjectMetadataTagFormType>> = ref(props.formData);

// Actions
const showModal = async (filename: string) => {
  initialModalData.value.filename = filename;
  initialModalData.value.metadata = formData.value.find(x => x.filename === filename)?.metadata;
  initialModalData.value.tagset = formData.value.find(x => x.filename === filename)?.tagset ;

  editing.value = true;
};

const submitModal = (values: ObjectMetadataTagFormType) => {
  const idx = formData.value.findIndex( (x: ObjectMetadataTagFormType) => x.filename === values.filename);

  if( idx >= 0 ) {
    formData.value[idx].metadata = values.metadata;
    formData.value[idx].tagset = values.tagset;
  }
  else {
    formData.value.push(values);
  }

  // Emit formData back to ObjectUpload
  emit('submit-object-metadatatag-config', toRaw(formData.value));

  closeModal();
};

const closeModal = () => {
  editing.value = false;
};

</script>

<template>
  <div v-if="props.files.length > 0">
    <div
      v-for="(file, index) of props.files"
      :key="file.name + file.type + file.size"
      class="card flex border-1 border-round surface-border align-items-center p-2 gap-3 mb-1 text-sm"
    >
      <img
        v-if="file.type.startsWith('image')"
        role="presentation"
        :alt="file.name"
        :src="file.objectURL"
        width="50"
      />
      <div class="flex-grow-1 overflow-hidden">
        <span class="wrap-block">{{ file.name }}</span>
        <div>
          <span class="pr-2">{{ filesize(file.size) }}</span>
          <Badge
            :value="props.badgeProps.value"
            :severity="props.badgeProps.severity"
          />
        </div>
      </div>
      <div class="ml-auto">
        <Button
          v-if="editable"
          class="p-button-lg p-button-rounded p-button-text"
          @click="showModal(file.name)"
        >
          <font-awesome-icon icon="fa-solid fa-pen-to-square" />
        </Button>
        <Button
          class="p-button-lg p-button-rounded p-button-text"
          @click="props.removeCallback(index)"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </Button>
      </div>
    </div>

    <!-- eslint-disable vue/no-v-model-argument -->
    <Dialog
      v-model:visible="editing"
      :draggable="false"
      :modal="true"
      class="bcbox-info-dialog permissions-modal"
    >
      <!-- eslint-enable vue/no-v-model-argument -->
      <template #header>
        <font-awesome-icon
          icon="fa-solid fa-pen-to-square"
          fixed-width
        />
        <span class="p-dialog-title">Add metadata and tags</span>
      </template>

      <h3 class="bcbox-info-dialog-subhead">
        {{ initialModalData.filename }}
      </h3>

      <ObjectMetadataTagForm
        :filename="initialModalData.filename"
        :metadata="initialModalData.metadata"
        :tagset="initialModalData.tagset"
        @submit-object-metadatatag-config="submitModal"
        @cancel-object-metadatatag-config="closeModal"
      />
    </Dialog>
  </div>
</template>
