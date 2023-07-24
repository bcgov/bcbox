<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import GridRow from '@/components/form/GridRow.vue';
import { ObjectMetadataTagForm } from '@/components/object';
import { Button, Dialog, useConfirm } from '@/lib/primevue';
import { useAuthStore, useMetadataStore, useObjectStore, usePermissionStore, useVersionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { ObjectMetadataTagFormType } from '@/components/object/ObjectMetadataTagForm.vue';
import type { Metadata } from '@/types';

// Props
type Props = {
  editable?: boolean;
  objectId: string;
  versionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  versionId: undefined
});

// Emits
const emit = defineEmits(['on-file-uploaded']);

// Store
const metadataStore = useMetadataStore();
const versionStore = useVersionStore();
const permissionStore = usePermissionStore();
const { getUserId } = storeToRefs(useAuthStore());
const { getMetadata: tsGetMetadata } = storeToRefs(metadataStore);
const { getMetadata: vsGetMetadata } = storeToRefs(versionStore);

// State
const editing: Ref<boolean> = ref(false);
const formData: Ref<ObjectMetadataTagFormType> = ref({
  filename: ''
});
const objectMetadata: Ref<Metadata | undefined> = ref(undefined);

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
  formData.value.filename = useObjectStore().findObjectById(props.objectId)?.name ?? '';
  formData.value.metadata = objectMetadata.value?.metadata;

  editing.value = true;
};

const submitModal = async (values: ObjectMetadataTagFormType) => {
  await metadataStore.replaceMetadata(props.objectId, values.metadata ?? [], props.versionId);
  emit('on-file-uploaded');

  closeModal();
};

const closeModal = () => {
  editing.value = false;
};

async function load() {
  if( props.versionId ) {
    objectMetadata.value = versionStore.findMetadataByVersionId(props.versionId);
  }
  else {
    objectMetadata.value = metadataStore.findMetadataByObjectId(props.objectId);
  }
}

onMounted(() => {
  load();
});

watch([props, tsGetMetadata,vsGetMetadata] , () => {
  load();
});
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div class="col-12">
      <h2 class="font-bold">
        Metadata
      </h2>
    </div>
    <GridRow
      v-for="meta in objectMetadata?.metadata"
      :key="meta.key + meta.value"
      :label="meta.key"
      :value="meta.value"
    />
  </div>
  <div
    v-if="editable &&
      permissionStore.isObjectActionAllowed(props.objectId, getUserId, Permissions.UPDATE, props.objectId)"
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
