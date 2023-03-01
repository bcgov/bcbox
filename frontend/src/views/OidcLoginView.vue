<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import { onMounted } from 'vue';

import { useAuthStore } from '@/store';

const authStore = useAuthStore();

onMounted(() => {
  authStore.login();
});
</script>

<template>
  <h2>Logging in...</h2>
  <ProgressSpinner />
</template>

<style lang="scss" scoped>
h2 {
  margin-top: 10rem;
  text-align: center;
}
.p-progress-spinner {
  display: flex;
  margin-top: 4rem;
  position: relative;
}
</style>
