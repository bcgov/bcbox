<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useConfigStore } from '@/store';

const { config } = storeToRefs(useConfigStore());
</script>

<template>
  <div class="footer-line flex justify-content-between flex-wrap">
    <div>This is a footer</div>
    <div v-if="config">
      v{{ config.version }}-{{ config.gitRev.substring(0, 8) }}
    </div>
  </div>
</template>

<style>
.footer-line {
  padding: 0 1em;
  border-top: 1px solid grey;
}
</style>
