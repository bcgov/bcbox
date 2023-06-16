<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import GridRow from '@/components/form/GridRow.vue';
import ObjectMetadataTagForm from '@/components/object/ObjectMetadataTagForm.vue';
import { Button, Dialog, useConfirm } from '@/lib/primevue';
import { useMetadataStore, useObjectStore, useVersionStore } from '@/store';

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
const { getMetadata: tsGetMetadata } = storeToRefs(metadataStore);
const { getMetadata: vsGetMetadata } = storeToRefs(versionStore);

// State
const metaVisible: Ref<boolean> = ref(false);
const metadataTagFormData: Ref<ObjectMetadataTagFormType> = ref({
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
    accept: () => submitMetaModal(values)
  });
};

const showMetaModal = async () => {
  metadataTagFormData.value.filename = useObjectStore().findObjectById(props.objectId)?.name ?? '';
  metadataTagFormData.value.metadata = objectMetadata.value?.metadata;

  metaVisible.value = true;
};

const submitMetaModal = async (values: ObjectMetadataTagFormType) => {
  if( values.metadata?.length ) {
    await metadataStore.replaceMetadata(props.objectId, values.metadata, props.versionId);
    emit('on-file-uploaded');
  }

  closeMetaModal();
};

const closeMetaModal = () => {
  metaVisible.value = false;
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
  <div>
    <Button
      v-if="editable"
      outlined
      @click="showMetaModal()"
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
    v-model:visible="metaVisible"
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
      {{ metadataTagFormData.filename }}
    </h3>

    <ObjectMetadataTagForm
      :filename="metadataTagFormData.filename"
      :metadata="metadataTagFormData.metadata"
      :tagset-editable="false"
      @submit-object-metadatatag-config="confirmUpdate"
      @cancel-object-metadatatag-config="closeMetaModal"
    />
  </Dialog>
</template>
