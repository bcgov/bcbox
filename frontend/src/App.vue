<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onBeforeUnmount, onErrorCaptured, ref } from 'vue';
import { RouterView } from 'vue-router';
import { AppLayout, Navbar, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Toast, useToast } from '@/lib/primevue';
import { useAppStore, useAuthStore, useConfigStore } from '@/store';

import type { Ref } from 'vue';

const appStore = useAppStore();
const { getIsLoading, getIsUploading } = storeToRefs(appStore);

const ready: Ref<boolean> = ref(false);

const preventNav = (event: any) => {
  if (getIsUploading.value) {
    event.preventDefault();

    // Chrome requires returnValue to be set
    event.returnValue = '';
  }
};

onBeforeMount(async () => {
  appStore.beginDeterminateLoading();
  await useConfigStore().init();
  await useAuthStore().init();
  appStore.endDeterminateLoading();
  ready.value = true;

  window.addEventListener('beforeunload', preventNav);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', preventNav);
});

// Top level error handler
onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.error('Error', e.message);
});
</script>

<template>
  <div class="container">
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
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}
</style>
