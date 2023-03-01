<script setup lang="ts">
import Button from 'primevue/button';
import type { Tagging } from '@/interfaces';

defineProps<{
  objectTag: Tagging;
}>();
</script>

<template>
  <div
    v-if="objectTag?.tagset?.length"
    class="grid"
  >
    <div class="col-12">
      <h2 class="font-bold">
        Tags
      </h2>
    </div>
    <div
      v-for="tag in objectTag?.tagset"
      :key="tag.key + tag.value"
    >
      <div class="col-3">
        <Button
          label="Primary"
          class="p-button-raised p-button-rounded"
        >
          {{ tag.key + "=" + tag.value }}
        </Button>
      </div>
    </div>
  </div>
</template>
