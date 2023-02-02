<script setup lang="ts">
import type { ObjectTag } from '@/interfaces';
import Button from 'primevue/button';

defineProps<{
  objectTag: ObjectTag;
}>();
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2>Tags</h2>
    </div>
    <div
      v-for="tag in objectTag?.tagSet"
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

<style lang="scss" scoped>
h2 {
  font-weight: bold;
}
</style>
