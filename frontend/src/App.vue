<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured } from 'vue';
import { RouterView } from 'vue-router';
import { AppLayout, Navbar, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Toast, useToast }from '@/lib/primevue';
import { useAppStore, useAuthStore, useUserStore } from '@/store';

const appStore = useAppStore();
const { getIsLoading } = storeToRefs(appStore);

onBeforeMount(async () => {
  appStore.beginDeterminateLoading();
  await useAuthStore().init();
  // TODO: Do we actually need userStore mounting for all pages?
  await useUserStore().init();
  appStore.endDeterminateLoading();
});

// Suspense error captured
onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.add({
    severity: 'error',
    summary: 'Error initializing app',
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
