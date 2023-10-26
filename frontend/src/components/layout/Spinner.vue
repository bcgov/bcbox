<script setup lang="ts">
import { ProgressSpinner } from '@/lib/primevue';
</script>

<template>
  <ProgressSpinner
    style="width: 50px; height: 50px"
    stroke-width="4"
  />
</template>

<style lang="scss" scoped>
:deep(.p-progress-spinner-circle) {
  stroke: #00004d !important;
}
</style>
