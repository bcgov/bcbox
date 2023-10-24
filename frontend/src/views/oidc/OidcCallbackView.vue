<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { useAuthStore } from '@/store';
import { StorageKey } from '@/utils/constants';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  await authStore.loginCallback();

  // Return user back to original login entrypoint if specified
  const entrypoint = window.sessionStorage.getItem(StorageKey.AUTH);
  if (entrypoint) window.sessionStorage.removeItem(StorageKey.AUTH);
  router.replace(entrypoint || '/');
});
</script>

<template>
  <h1>Authorizing...</h1>
  <Spinner />
</template>

<style lang="scss" scoped>
h1 {
  margin-top: 10rem;
  text-align: center;
}
.p-progress-spinner {
  display: flex;
  margin-top: 4rem;
  position: relative;
}
</style>
