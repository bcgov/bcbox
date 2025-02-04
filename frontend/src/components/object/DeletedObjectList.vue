<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import {
  DeleteObjectButton,
  ObjectSidebar,
  DeletedObjectTable,
  RestoreObjectButton
} from '@/components/object';
import { useObjectStore } from '@/store';
import { ButtonMode } from '@/utils/enums';

import type { Ref } from 'vue';

//const navStore = useNavStore();
const objectStore = useObjectStore();

const { getSelectedObjects } = storeToRefs(objectStore);

// State
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

const onObjectDeleted = () => {
  objectTableKey.value += 1;
};

const onOjectRestored = () => {
  objectTableKey.value += 1;
};
</script>

<template>
  <div>
    <div class="flex align-items-center justify-content-start">
      <RestoreObjectButton
        :disabled="selectedObjectIds.length === 0"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
        @on-object-restored="onOjectRestored"
      />
      <DeleteObjectButton
        :disabled="selectedObjectIds.length === 0"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
        :hard-delete="true"
        @on-object-deleted="onObjectDeleted"
      />
    </div>

    <div
      class="flex mt-4"
      :class="{ 'disable-overlay': false }"
    >
      <div class="flex-grow-1">
        <DeletedObjectTable
          :key="objectTableKey"
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
