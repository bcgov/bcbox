<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useConfigStore } from '@/store';

const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <div class="footer-line flex justify-content-between flex-wrap">
    <div>This is a footer</div>
    <div v-if="getConfig">
      v{{ getConfig.version }}-{{ getConfig.gitRev.substring(0, 8) }}
    </div>
  </div>
</template>

<style>
.footer-line {
  padding: 0 1em;
  border-top: 1px solid grey;
}
</style>
