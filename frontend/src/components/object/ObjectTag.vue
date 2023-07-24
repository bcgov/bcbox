<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import { ObjectMetadataTagForm } from '@/components/object';
import { Button, Dialog } from '@/lib/primevue';
import { useAuthStore, useObjectStore, usePermissionStore, useTagStore, useVersionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { ObjectMetadataTagFormType } from '@/components/object/ObjectMetadataTagForm.vue';
import type { Tagging } from '@/types';

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
const tagStore = useTagStore();
const versionStore = useVersionStore();
const permissionStore = usePermissionStore();
const { getUserId } = storeToRefs(useAuthStore());
const { getTagging: tsGetTagging } = storeToRefs(tagStore);
const { getTagging: vsGetTagging } = storeToRefs(versionStore);

// State
const editing: Ref<boolean> = ref(false);
const formData: Ref<ObjectMetadataTagFormType> = ref({
  filename: ''
});
const objectTagging: Ref<Tagging | undefined> = ref(undefined);

// Actions
const showModal = () => {
  formData.value.filename = useObjectStore().findObjectById(props.objectId)?.name ?? '';
  formData.value.tagset = objectTagging.value?.tagset;

  editing.value = true;
};

const submitModal = async (values: ObjectMetadataTagFormType) => {
  if( values.tagset ) {
    await tagStore.replaceTagging(props.objectId,  values.tagset, props.versionId);
  }
  else {
    await tagStore.deleteTagging(props.objectId, [], props.versionId);
  }

  emit('on-file-uploaded');

  closeModal();
};

const closeModal = () => {
  editing.value = false;
};

async function load() {
  if( props.versionId ) {
    objectTagging.value = versionStore.findTaggingByVersionId(props.versionId);
  }
  else {
    objectTagging.value = tagStore.findTaggingByObjectId(props.objectId);
  }
}

onMounted(() => {
  load();
});

watch( [props, tsGetTagging, vsGetTagging], () => {
  load();
});
</script>

<template>
  <div
    v-if="objectTagging?.tagset.length"
    class="grid details-grid grid-nogutter mb-2"
  >
    <div class="col-12">
      <h2 class="font-bold">
        Tags
      </h2>
    </div>
    <div
      v-for="tag in objectTagging?.tagset"
      :key="tag.key + tag.value"
    >
      <div class="col">
        <Button
          label="Primary"
          class="p-button-raised p-button-rounded"
        >
          {{ tag.key + "=" + tag.value }}
        </Button>
      </div>
    </div>
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
      Edit tags
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
      <span class="p-dialog-title">Edit tags</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ formData.filename }}
    </h3>

    <ObjectMetadataTagForm
      :filename="formData.filename"
      :metadata-editable="false"
      :tagset="formData.tagset"
      @submit-object-metadatatag-config="submitModal"
      @cancel-object-metadatatag-config="closeModal"
    />
  </Dialog>
</template>
