<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';

// Vue
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
// PrimeVue
import { useToast } from 'primevue/usetoast';
// State
import { storeToRefs } from 'pinia';
import { useObjectStore } from '@/store/objectStore';
// Components
import DeleteObjectButton from './DeleteObjectButton.vue';
import DownloadObjectButton from './DownloadObjectButton.vue';
import ObjectSidebar from './ObjectSidebar.vue';
import ObjectTable from './ObjectTable.vue';
import UploadObjectButton from './UploadObjectButton.vue';

const objectStore = useObjectStore();
const { multiSelectedObjects } = storeToRefs(objectStore);
const route = useRoute();
const toast = useToast();

// Info
const displayInfo: any = ref(null);

const showInfo = async (objId: any) => {
  displayInfo.value = await objectStore.getObjectInfo(objId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

// Download
const multiSelectedObjectIds = computed(() => {
  return multiSelectedObjects.value.map((o) => o.id);
});

// Objects List
const listObjects = async () => {
  try {
    await objectStore.listObjects({ bucketId: route.params.bucketId });
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
  <div>
    <UploadObjectButton :bucketId="route.params.bucketId as string" />
    <DownloadObjectButton :mode="ButtonMode.BUTTON" :ids="multiSelectedObjectIds" />
    <DeleteObjectButton class="ml-2" :mode="ButtonMode.BUTTON" :ids="multiSelectedObjectIds" />
  </div>

  <div class="flex mt-4">
    <div class="flex-grow-1">
      <ObjectTable @show-info="showInfo" :displayInfo="displayInfo" />
    </div>
    <div v-if="displayInfo" class="flex-shrink-0 ml-3" style="max-width: 33%; min-width: 33%">
      <ObjectSidebar :displayInfo="displayInfo" @close-info="closeInfo" />
    </div>
  </div>
</template>

<style scoped></style>
