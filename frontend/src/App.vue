<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured } from 'vue';
import { RouterView } from 'vue-router';
import { AppLayout, Navbar, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Toast, useToast }from '@/lib/primevue';
import { useAppStore, useAuthStore, useConfigStore } from '@/store';

const appStore = useAppStore();
const { getIsLoading } = storeToRefs(appStore);

onBeforeMount(async () => {
  appStore.beginDeterminateLoading();
  await useConfigStore().init();
  await useAuthStore().init();
  appStore.endDeterminateLoading();
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
      <RouterView />
    </template>
  </AppLayout>
</template>
