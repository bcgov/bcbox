<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog';
import ProgressBar from 'primevue/progressbar';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { RouterView } from 'vue-router';

import AppLayout from '@/components/layout/AppLayout.vue';
import Navbar from '@/components/layout/Navbar.vue';
import { useAuthStore, useUserStore } from '@/store';

import type { Ref } from 'vue';

// TODO: Make this pull from appStore as global loading/navigation cue instead
const loading: Ref<boolean> = ref(true);

// TODO: Do we actually need userStore mounting for all pages?
onBeforeMount(async () => {
  await useAuthStore().init();
  await useUserStore().init();
  loading.value = false;
});

const toast = useToast();
// Suspense error captured
onErrorCaptured((e: Error) => {
  toast.add({
    severity: 'error',
    summary: 'Error initializing app',
    detail: e.message, life: 3000
  });
});
</script>

<template>
  <ConfirmDialog />
  <ProgressBar
    v-if="loading"
    mode="indeterminate"
    style="height: 0.2em; position: sticky; top: 0; z-index: 1000"
  />
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
