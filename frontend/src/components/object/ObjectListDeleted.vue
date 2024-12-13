<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import {
  DeleteObjectButton,
  ObjectSidebar,
  ObjectTableDeleted,
} from '@/components/object';
import { useObjectStore } from '@/store';
import { RouteNames } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';

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

const onDeletedSuccess = () => {
  objectTableKey.value += 1;
};
</script>

<template>
  <div>
    <div class="head-actions">
      <DeleteObjectButton
        v-if="selectedObjectIds.length > 0"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
        :hard="true"
        @on-deleted-success="onDeletedSuccess"
      />
    </div>

    <div
      class="flex mt-4"
      :class="{ 'disable-overlay': false }"
    >
      <div class="flex-grow-1">
        <ObjectTableDeleted
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
    <router-link
      class="deleted-files-link"
      :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: props.bucketId } }"
    >
      Back to folder
    </router-link>
  </div>
</template>

<style scoped>
.disable-overlay {
  pointer-events: none;
  opacity: 0.4;
}
</style>
