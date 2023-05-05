<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { RouterView } from 'vue-router';
import { AppLayout, Navbar, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Toast }from '@/lib/primevue';
import { useAppStore, useAuthStore, useConfigStore } from '@/store';
import { error } from '@/services/toastService';

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
  error('Error', e.message);
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
