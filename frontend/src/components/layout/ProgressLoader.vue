<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ProgressBar from 'primevue/progressbar';

import { useAppStore } from '@/store';

const appStore = useAppStore();
const { getLoadingMode, getLoadingValue } = storeToRefs(appStore);
</script>

<template>
  <ProgressBar
    :mode="getLoadingMode"
    :showValue="false"
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
