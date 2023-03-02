<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { ProgressBar } from '@/lib/primevue';
import { useAppStore } from '@/store';


// Store
const appStore = useAppStore();
const { getLoadingMode, getLoadingValue } = storeToRefs(appStore);
</script>

<template>
  <ProgressBar
    :mode="getLoadingMode"
    :show-value="false"
    :value="getLoadingValue"
  />
</template>

<style lang="scss" scoped>
.p-progressbar {
  left: 0;
  height: 0.1rem;
  pointer-events: none;
  position: sticky;
  top: 0;
  z-index: 1031
}
</style>
