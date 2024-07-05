<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectSidebar,
  ObjectTable,
  ObjectUpload
} from '@/components/object';
import { Button } from '@/lib/primevue';
import { useAuthStore, useObjectStore, useNavStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { onDialogHide } from '@/utils/utils';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

//const navStore = useNavStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const { focusedElement } = storeToRefs(useNavStore());

const { getSelectedObjects } = storeToRefs(objectStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const displayUpload = ref(false);
const objectInfoId: Ref<string | undefined> = ref(undefined);
const objectTableKey = ref(0);

const selectedObjectIds = computed(() => {
  return getSelectedObjects.value.map((o) => o.id);
});

const showObjectInfo = async (objectId: string | undefined) => {
  objectInfoId.value = objectId;
};

const closeObjectInfo = () => {
  objectInfoId.value = undefined;
};

const showUpload = () => {
  displayUpload.value = true;
  focusedElement.value = document.activeElement;
};

const closeUpload = () => {
  onDialogHide();
  displayUpload.value = false;
  objectTableKey.value += 1;
};

const onDeletedSuccess = () => {
  objectTableKey.value += 1;
};
</script>

<template>
  <div>
    <div
      v-if="displayUpload"
      class="mb-4"
    >
      <ObjectUpload
        :bucket-id="props.bucketId"
        :close-callback="closeUpload"
      />
    </div>
    <div>
      <Button
        v-if="permissionStore.isBucketActionAllowed(props.bucketId as string, getUserId, Permissions.CREATE)"
        v-tooltip.bottom="'Upload file'"
        class="mr-2"
        :disabled="displayUpload"
        aria-label="Upload file"
        @click="showUpload"
      >
        <font-awesome-icon
          icon="fa-solid fa-upload"
          class="mr-1"
        />
        Upload
      </Button>
      <DownloadObjectButton
        :disabled="displayUpload"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
      />
      <DeleteObjectButton
        :disabled="displayUpload"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
        @on-deleted-success="onDeletedSuccess"
      />
    </div>

    <div
      class="flex mt-4"
      :class="{ 'disable-overlay': displayUpload }"
    >
      <div class="flex-grow-1">
        <ObjectTable
          :key="objectTableKey"
          :bucket-id="props.bucketId"
          :object-info-id="objectInfoId"
          @show-object-info="showObjectInfo"
        />
      </div>
      <div
        v-if="objectInfoId"
        class="flex-shrink-1 w-4"
      >
        <ObjectSidebar
          :object-id="objectInfoId"
          @close-object-info="closeObjectInfo"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.disable-overlay {
  pointer-events: none;
  opacity: 0.4;
}
</style>
