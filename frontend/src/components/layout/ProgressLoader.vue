<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { ProgressBar } from '@/lib/primevue';
import { useAppStore } from '@/store';

// Store
const appStore = useAppStore();
const { getLoadingMode, getLoadingValue } = storeToRefs(appStore);
</script>

<template>
  <div class="app-loader">
    <ProgressBar
      :mode="getLoadingMode"
      :show-value="false"
      :value="getLoadingValue"
    />
  </div>
</template>

<style lang="scss" scoped>
.app-loader {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;

  .p-progressbar {
    height: 0.15rem;
    pointer-events: none;
  }
}
</style>
