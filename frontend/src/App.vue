<script setup lang="ts">
// Vue
import { onErrorCaptured } from 'vue';
import { RouterView } from 'vue-router';
// PrimeVue
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
// Components
import AppLayout from '@/components/layout/AppLayout.vue';
import Navbar from '@/components/layout/Navbar.vue';

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
  <Toast />
  <ConfirmDialog />
  <AppLayout>
    <template #nav>
      <Navbar />
    </template>
    <template #main>
      <RouterView /> <InitApp />
    </template>
  </AppLayout>
</template>
