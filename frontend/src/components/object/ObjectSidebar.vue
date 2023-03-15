<script setup lang="ts">
import { watch } from 'vue';

import {
  ObjectMetadata,
  ObjectProperties,
  ObjectTag
} from '@/components/object';
import { Button } from '@/lib/primevue';
import { useTagStore } from '@/store';
import { RouteNames } from '@/utils/constants';

// Props
type Props = {
  objectInfoId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['close-object-info']);

// Store
const tagStore = useTagStore();

// Actions
const closeObjectInfo = async () => {
  emit('close-object-info');
};

watch( props, () => {
  tagStore.fetchTagging({objectId: props.objectInfoId});
}, { immediate: true });
</script>

<template>
  <div class="flex justify-content-start">
    <div class="flex col align-items-center pl-0">
      <font-awesome-icon
        icon="fa-solid fa-circle-info"
        style="font-size: 2rem"
      />
      <h1>File details</h1>
    </div>
    <div>
      <Button
        class="black"
        icon="pi pi-times"
        text
        rounded
        @click="closeObjectInfo"
      />
    </div>
  </div>
  <div class="pl-2">
    <ObjectProperties
      :object-info-id="props.objectInfoId"
      :full-view="false"
    />
    <ObjectMetadata
      :object-info-id="props.objectInfoId"
      :full-view="false"
    />
    <ObjectTag :object-info-id="props.objectInfoId" />
    <div class="col-9">
      <router-link
        v-slot="{ navigate }"
        custom
        :to="{ name: RouteNames.DETAIL_OBJECTS, query: { objectId: props.objectInfoId } }"
      >
        <Button
          label="Primary"
          class="p-button-outlined"
          @click="navigate"
        >
          <font-awesome-icon icon="file-contract" />
          View all details
        </Button>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  padding-left: 1rem;
  font-weight: bold;
}

h2 {
  font-weight: bold;
}

.black {
  color: black;
}

button {
  margin-top: 15px;
  text-indent: 10px;
}
</style>
