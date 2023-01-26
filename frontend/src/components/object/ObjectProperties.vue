<script setup lang="ts">
import { formatDateLong } from '@/utils/formatters';

defineProps({
  displayInfo: {
    type: Object,
    default: undefined
  }
});

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2>Properties</h2>
    </div>
    <div class="col-3">
      Name:
    </div>
    <div class="col-9">
      {{ displayInfo?.name }}
    </div>
    <div class="col-3">
      Size:
    </div>
    <div class="col-9">
      {{ displayInfo?.size }}
    </div>
    <div class="col-3">
      Object ID:
    </div>
    <div class="col-9">
      {{ displayInfo?.id }}
    </div>
    <div class="col-3">
      Created by:
    </div>
    <div class="col-9">
      {{ displayInfo?.createdBy }}
    </div>
    <div class="col-3">
      Creation date:
    </div>
    <div class="col-9">
      {{ formatDateLong(displayInfo?.createdAt) }}
    </div>
    <div class="col-3">
      Updated by:
    </div>
    <div class="col-9">
      {{ displayInfo?.updatedBy }}
    </div>
    <div class="col-3">
      Updated date:
    </div>
    <div class="col-9">
      {{ formatDateLong(displayInfo?.updatedAt) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  font-weight: bold;
}
</style>
