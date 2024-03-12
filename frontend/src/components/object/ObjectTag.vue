<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { ObjectMetadataTagForm } from '@/components/object';
import { Button, Dialog, Tag } from '@/lib/primevue';
import { useAuthStore, useObjectStore, usePermissionStore, useTagStore, useVersionStore } from '@/store';
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
const objectStore = useObjectStore();
const tagStore = useTagStore();
const versionStore = useVersionStore();
const permissionStore = usePermissionStore();
const { getUserId } = storeToRefs(useAuthStore());
const { getTaggingByVersionId } = storeToRefs(versionStore);
const { getTaggingByObjectId } = storeToRefs(tagStore);

// State
const obj = computed(() => objectStore.getObject(props.objectId));
const versionId = defineModel<string>('versionId');
const editing: Ref<boolean> = ref(false);
const formData: Ref<ObjectMetadataTagFormType> = ref({
  filename: ''
});

// Actions
const showModal = () => {
  formData.value.filename = obj.value?.name ?? '';
  formData.value.tagset = (
    versionId.value ? getTaggingByVersionId.value(versionId.value) : getTaggingByObjectId.value(props.objectId)
  )?.tagset;

  editing.value = true;
};

const submitModal = async (values: ObjectMetadataTagFormType) => {
  if (values.tagset) {
    await tagStore.replaceTagging(props.objectId, values.tagset, versionId.value);
  } else {
    await tagStore.deleteTagging(props.objectId, [], versionId.value);
  }
  await versionStore.fetchTagging({ versionId: versionId.value as string });
  closeModal();
};

const closeModal = () => {
  editing.value = false;
};
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div class="col-12">
      <h2>Tags</h2>
    </div>
    <div
      v-for="tag in (versionId ? getTaggingByVersionId(versionId) : getTaggingByObjectId(props.objectId))?.tagset"
      :key="tag.key + tag.value"
    >
      <div class="grid">
        <div class="col mr-2">
          <Tag
            value="Primary"
            rounded
          >
            {{ tag.key + '=' + tag.value }}
          </Tag>
        </div>
      </div>
    </div>
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
      Edit tags
    </Button>
  </div>

  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    v-model:visible="editing"
    :draggable="false"
    :modal="true"
    class="bcbox-info-dialog"
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
