<script setup lang="ts">
import { Button } from '@/lib/primevue';

import type { Bucket } from '@/interfaces';

// Props
defineProps<{
  displayInfo: Bucket
}>();

// Emits
const emit = defineEmits(['close-info']);

// Actions
const closeInfo = async () => {
  emit('close-info');
};
</script>

<template>
  <div class="flex justify-content-start">
    <div class="flex col align-items-center pl-0">
      <font-awesome-icon
        icon="fa-solid fa-circle-info"
        style="font-size: 2rem"
      />
      <h1>Bucket details</h1>
    </div>
    <div class="col-fixed align-items-center">
      <Button
        class="p-button-lg p-button-rounded p-button-text black"
        @click="closeInfo"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </Button>
    </div>
  </div>
  <div class="pl-2">
    <div class="grid">
      <div class="col-12">
        <h2>Properties</h2>
      </div>
      <div class="col-3">
        Bucket Name:
      </div>
      <div class="col-9">
        {{ displayInfo?.bucketName }}
      </div>
      <div class="col-3">
        Bucket ID:
      </div>
      <div class="col-9">
        {{ displayInfo?.bucketId }}
      </div>
    </div>
    <div class="grid">
      <div class="col-12">
        <h2>Access</h2>
      </div>
      <div class="col-3">
        Managed by:
      </div>
      <div class="col-9">
        {{ '' }}
      </div>
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
</style>
