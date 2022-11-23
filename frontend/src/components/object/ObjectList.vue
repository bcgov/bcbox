<script setup lang="ts">
// Vue
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
// PrimeVue
import { useToast } from 'primevue/usetoast';
// State
import { storeToRefs } from 'pinia';
import { useObjectStore } from '@/store/objectStore';
// Components
import UploadObjectButton from './UploadObjectButton.vue';
import ObjectTable from './ObjectTable.vue';

const { objectList } = storeToRefs(useObjectStore());
const objectStore = useObjectStore();

const route = useRoute();
const toast = useToast();

const listObjects = async () => {
  try {
    await objectStore.listObjects({ bucketId: route.params.bucketId});
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load Objects.', detail: error, life: 5000 });
  }
};

// Get the user's list of objects
onMounted(() => {
  listObjects();
});
</script>

<template>
  <UploadObjectButton :bucketId="route.params.bucketId as string" class="mt-4" />

  <div class="mt-4">List of Objects:</div>

  <ObjectTable />
  <!-- <pre>{{ JSON.stringify(objectList, undefined, 2) }}</pre> -->
</template>

<style scoped></style>
