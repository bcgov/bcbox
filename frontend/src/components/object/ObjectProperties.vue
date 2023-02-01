<script setup lang="ts">
import { formatDateLong } from '@/utils/formatters';

defineProps({
  objectProperties: {
    type: Object,
    default: undefined
  }
});

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2 class="font-bold">
        Properties
      </h2>
    </div>
    <div class="col-3">
      Name:
    </div>
    <div class="col-9">
      {{ objectProperties?.name }}
    </div>
    <div class="col-3">
      Size:
    </div>
    <div class="col-9">
      {{ objectProperties?.size }}
    </div>
    <div class="col-3">
      Object ID:
    </div>
    <div class="col-9">
      {{ objectProperties?.id }}
    </div>
    <div class="col-3">
      Created by:
    </div>
    <div class="col-9">
      {{ objectProperties?.createdBy }}
    </div>
    <div class="col-3">
      Creation date:
    </div>
    <div class="col-9">
      {{ formatDateLong(objectProperties?.createdAt) }}
    </div>
    <div class="col-3">
      Updated by:
    </div>
    <div class="col-9">
      {{ objectProperties?.updatedBy }}
    </div>
    <div class="col-3">
      Updated date:
    </div>
    <div class="col-9">
      {{ formatDateLong(objectProperties?.updatedAt) }}
    </div>
  </div>
</template>
