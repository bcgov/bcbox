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
    <div
      v-if="objectProperties?.name"
      class="col-3"
    >
      Name:
    </div>
    <div
      v-if="objectProperties?.name"
      class="col-9"
    >
      {{ objectProperties?.name }}
    </div>
    <div
      v-if="objectProperties?.id"
      class="col-3"
    >
      Object ID:
    </div>
    <div
      v-if="objectProperties?.id"
      class="col-9"
    >
      {{ objectProperties?.id }}
    </div>
    <div
      v-if="objectProperties?.createdBy"
      class="col-3"
    >
      Created by:
    </div>
    <div
      v-if="objectProperties?.createdBy"
      class="col-9"
    >
      {{ objectProperties?.createdBy }}
    </div>
    <div
      v-if="objectProperties?.createdAt"
      class="col-3"
    >
      Creation date:
    </div>
    <div
      v-if="objectProperties?.createdAt"
      class="col-9"
    >
      {{ formatDateLong(objectProperties?.createdAt) }}
    </div>
    <div
      v-if="objectProperties?.updatedBy"
      class="col-3"
    >
      Updated by:
    </div>
    <div
      v-if="objectProperties?.updatedBy"
      class="col-9"
    >
      {{ objectProperties?.updatedBy }}
    </div>
    <div
      v-if="objectProperties?.updatedAt"
      class="col-3"
    >
      Updated date:
    </div>
    <div
      v-if="objectProperties?.updatedAt"
      class="col-9"
    >
      {{ formatDateLong(objectProperties?.updatedAt) }}
    </div>
  </div>
</template>
