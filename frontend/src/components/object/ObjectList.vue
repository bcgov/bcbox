<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';
// Vue
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
// PrimeVue
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
// State
import { storeToRefs } from 'pinia';
import { useBucketStore } from '@/store';
import { useObjectStore } from '@/store';
// Components
import DeleteObjectButton from './DeleteObjectButton.vue';
import DownloadObjectButton from './DownloadObjectButton.vue';
import ObjectSidebar from './ObjectSidebar.vue';
import ObjectTable from './ObjectTable.vue';
import ObjectUpload from './ObjectUpload.vue';

const bucketStore = useBucketStore();
const objectStore = useObjectStore();
const { multiSelectedObjects } = storeToRefs(objectStore);
const route = useRoute();
const toast = useToast();

const displayInfo: any = ref(null);
const displayUpload = ref(false);

const showInfo = async (objId: any) => {
  displayInfo.value = await objectStore.getObjectInfo(objId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

const showUpload = () => {
  displayUpload.value = true;
};

const closeUpload = () => {
  displayUpload.value = false;
};

const listObjects = async () => {
  try {
    await Promise.all([
      bucketStore.getBucketPermissionsForUser(route.query.bucketId?.toString() || ''),
      objectStore.listObjects({ bucketId: route.query.bucketId })
    ]);
    await objectStore.listObjects({ bucketId: route.query.bucketId });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load Objects.', detail: error, life: 5000 });
  }
};

// Download
const multiSelectedObjectIds = computed(() => {
  return multiSelectedObjects.value.map((o) => o.id);
});

// Get the user's list of objects
onMounted(() => {
  listObjects();
});
</script>

<template>
  <div>
    <ObjectUpload
      v-if="displayUpload"
      class="mb-4"
      :close-callback="closeUpload"
    />
    <Button
      class="mr-2"
      :disabled="displayUpload"
      @click="showUpload"
    >
      <font-awesome-icon
        icon="fa-solid fa-upload"
        class="mr-1"
      /> Upload
    </Button>
    <DownloadObjectButton
      :mode="ButtonMode.BUTTON"
      :ids="multiSelectedObjectIds"
    />
    <DeleteObjectButton
      class="ml-2"
      :mode="ButtonMode.BUTTON"
      :ids="multiSelectedObjectIds"
    />
  </div>

  <div class="flex mt-4">
    <div class="flex-grow-1">
      <ObjectTable
        :display-info="displayInfo"
        @show-info="showInfo"
      />
    </div>
    <div
      v-if="displayInfo"
      class="flex-shrink-0 ml-3"
      style="max-width: 33%; min-width: 33%"
    >
      <ObjectSidebar
        :display-info="displayInfo"
        @close-info="closeInfo"
      />
    </div>
  </div>
</template>

<style scoped></style>
