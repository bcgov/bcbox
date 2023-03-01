<script setup lang="ts">
import {
  ObjectMetadata,
  ObjectProperties,
  ObjectTag
} from '@/components/object';
import { RouteNames } from '@/utils/constants';
import { Button } from '@/lib/primevue';

// Props
defineProps<{
  objectInfoId: string;
}>();

// Emits
const emit = defineEmits(['close-object-info']);

// Actions
const closeObjectInfo = async () => {
  emit('close-object-info');
};
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
    <div class="col-fixed align-items-center">
      <Button
        class="p-button-lg p-button-rounded p-button-text black"
        @click="closeObjectInfo"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </Button>
    </div>
  </div>
  <div class="pl-2">
    <ObjectProperties
      :object-info-id="objectInfoId"
      :full-view="false"
    />
    <ObjectMetadata
      :object-info-id="objectInfoId"
      :full-view="false"
    />
    <ObjectTag :object-info-id="objectInfoId" />
    <div class="col-9">
      <router-link
        v-slot="{ navigate }"
        custom
        :to="{ name: RouteNames.DETAIL_OBJECTS, query: { objId: objectInfoId } }"
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
