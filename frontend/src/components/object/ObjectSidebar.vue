<script setup lang="ts">
// PrimeVue
import Button from 'primevue/button';
// Other
import { formatDateLong } from '@/utils/formatters';

defineProps({
  displayInfo: Object,
});

const emit = defineEmits(['close-info']);

const closeInfo = async () => {
  emit('close-info');
};
</script>

<template>
  <div class="flex justify-content-start">
    <div class="flex col align-items-center pl-0">
      <font-awesome-icon icon="fa-solid fa-circle-info" style="font-size: 2rem" />
      <h1>File details</h1>
    </div>
    <div class="col-fixed align-items-center">
      <Button class="p-button-lg p-button-rounded p-button-text black" @click="closeInfo"><font-awesome-icon icon="fa-solid fa-xmark" /></Button>
    </div>
  </div>
  <div class="pl-2">
    <div class="grid">
      <div class="col-12"><h2>Properties</h2></div>
      <div class="col-3">Name:</div>
      <div class="col-9">{{ displayInfo?.name }}</div>
      <div class="col-3">Size:</div>
      <div class="col-9">{{ displayInfo?.size }}</div>
      <div class="col-3">Object ID:</div>
      <div class="col-9">{{ displayInfo?.id }}</div>
      <div class="col-3">Created by:</div>
      <div class="col-9">{{ displayInfo?.createdBy }}</div>
      <div class="col-3">Creation date:</div>
      <div class="col-9">{{ formatDateLong(displayInfo?.createdAt) }}</div>
      <div class="col-3">Updated by:</div>
      <div class="col-9">{{ displayInfo?.updatedBy }}</div>
      <div class="col-3">Updated date:</div>
      <div class="col-9">{{ formatDateLong(displayInfo?.updatedAt) }}</div>
    </div>
    <div class="grid">
      <div class="col-12"><h2>Access</h2></div>
      <div class="col-3">Managed by:</div>
      <div class="col-9">{{ displayInfo?.managedBy }}</div>
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
