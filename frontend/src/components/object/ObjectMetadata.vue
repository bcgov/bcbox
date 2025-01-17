<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import GridRow from '@/components/form/GridRow.vue';
import { ObjectMetadataTagForm } from '@/components/object';
import { Button, Dialog, useConfirm } from '@/lib/primevue';
import { useAuthStore, useMetadataStore, useObjectStore, usePermissionStore, useVersionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { ObjectMetadataTagFormType } from '@/components/object/ObjectMetadataTagForm.vue';

// Props
type Props = {
  editable?: boolean;
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {
  editable: true
});

// Store
const metadataStore = useMetadataStore();
const versionStore = useVersionStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const { getUserId } = storeToRefs(useAuthStore());
const { getMetadataByVersionId } = storeToRefs(versionStore);
const { getMetadataByObjectId } = storeToRefs(metadataStore);

// State
const obj = computed(() => objectStore.getObject(props.objectId));
const versionId = defineModel<string>('versionId');
const metadata  = computed(() => (versionId.value ?
  getMetadataByVersionId.value(versionId.value) :
  getMetadataByObjectId.value(props.objectId))?.metadata ?? []);
const editing: Ref<boolean> = ref(false);
const formData: Ref<ObjectMetadataTagFormType> = ref({
  filename: ''
});

// Emits
const emit = defineEmits(['on-metadata-success']);

// Actions
const confirm = useConfirm();

const confirmUpdate = (values: ObjectMetadataTagFormType) => {
  confirm.require({
    message: 'Please confirm that you want to save this metadata. This will create a new version.',
    header: 'Save metadata',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => submitModal(values)
  });
};

const showModal = () => {
  formData.value.filename = obj.value?.name ?? '';
  formData.value.metadata = metadata.value;

  editing.value = true;
};

const submitModal = async (values: ObjectMetadataTagFormType) => {
  const newVersion = await metadataStore.replaceMetadata(props.objectId, values.metadata ?? [], versionId.value);
  emit('on-metadata-success', newVersion);
  closeModal();
};

const closeModal = () => {
  editing.value = false;
};
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div
      v-if="metadata.length > 0 "
      class="col-12"
    >
      <h2>Metadata</h2>
    </div>
    <GridRow
      v-for="meta in metadata"
      :key="meta.key + meta.value"
      :label="meta.key"
      :value="meta.value"
    />
  </div>
  <div
    v-if="
      editable && permissionStore.isObjectActionAllowed(props.objectId, getUserId, Permissions.UPDATE, obj?.bucketId)
    "
  >
    <Button
      outlined
      @click="showModal()"
    >
      <font-awesome-icon
        icon="fa-solid fa-pen-to-square"
        class="mr-1"
      />
      Edit metadata
    </Button>
  </div>

  <Dialog
    v-model:visible="editing"
    :draggable="false"
    :modal="true"
    class="bcbox-info-dialog"
  >
    <template #header>
      <font-awesome-icon
        icon="fa-solid fa-pen-to-square"
        fixed-width
      />
      <span class="p-dialog-title">Edit metadata</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ formData.filename }}
    </h3>

    <ObjectMetadataTagForm
      :filename="formData.filename"
      :metadata="formData.metadata"
      :tagset-editable="false"
      @submit-object-metadatatag-config="confirmUpdate"
      @cancel-object-metadatatag-config="closeModal"
    />
  </Dialog>
</template>
