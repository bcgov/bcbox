<template>
  <div>
    Debugging: config <br />
    {{ config }}
  </div>
</template>

<script setup lang="ts">
// State
import { useConfigStore } from '@/store/configStore';
import { storeToRefs } from 'pinia';
const configStore = useConfigStore();
const { config } = storeToRefs(useConfigStore());

// Get the config on setup of the main app view
await configStore.load();
</script>
