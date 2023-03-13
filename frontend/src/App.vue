<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { RouterView } from 'vue-router';
import { AppLayout, Navbar, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Toast, useToast }from '@/lib/primevue';
import { useAppStore, useAuthStore, useConfigStore } from '@/store';

import type { Ref } from 'vue';

const appStore = useAppStore();
const { getIsLoading } = storeToRefs(appStore);

const ready: Ref<boolean> = ref(false);

onBeforeMount(async () => {
  appStore.beginDeterminateLoading();
  await useConfigStore().init();
  await useAuthStore().init();
  appStore.endDeterminateLoading();
  ready.value = true;
});

// Top level error handler
onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: e.message, life: 3000
  });
});
</script>

<template>
  <ConfirmDialog />
  <ProgressLoader v-if="getIsLoading" />
  <Toast />
  <AppLayout>
    <template #nav>
      <Navbar />
    </template>
    <template #main>
      <RouterView v-if="ready" />
    </template>
  </AppLayout>
</template>
