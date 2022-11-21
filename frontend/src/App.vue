<script setup lang="ts">
// Vue/PrimeVue
import { onErrorCaptured } from 'vue';
import { RouterView } from 'vue-router';
import ProgressBar from 'primevue/progressbar';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
// Components
import AppLayout from '@/components/layout/AppLayout.vue';
import Navbar from '@/components/layout/Navbar.vue';
import InitApp from '@/components/layout/InitApp.vue';

const toast = useToast();
// Suspense error captured
onErrorCaptured((e: Error) => {
  toast.add({ severity: 'error', summary: 'Error initializing app', detail: e.message, life: 3000 });
});
</script>

<template>
  <Toast />
  <Suspense>
    <AppLayout>
      <template #nav><Navbar /></template>
      <template #main> <RouterView /> <InitApp /></template>
    </AppLayout>

    <!-- Loading -->
    <template #fallback>
      <AppLayout>
        <template #nav />
        <template #main><ProgressBar mode="indeterminate" style="height: 0.5em" /></template>
      </AppLayout>
    </template>
  </Suspense>
</template>
