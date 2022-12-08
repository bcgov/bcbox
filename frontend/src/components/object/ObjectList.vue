<script setup lang="ts">
// Vue
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
// PrimeVue
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
// State
import { useObjectStore } from '@/store/objectStore';
// Components
import ObjectSidebar from './ObjectSidebar.vue';
import ObjectTable from './ObjectTable.vue';
import UploadObjectButton from './UploadObjectButton.vue';

const confirm = useConfirm();
const objectStore = useObjectStore();
const route = useRoute();
const toast = useToast();

const displayInfo: any = ref(null);

const showInfo = async (objId: any) => {
  displayInfo.value = await objectStore.getObjectInfo(objId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

const listObjects = async () => {
  try {
    await objectStore.listObjects({ bucketId: route.params.bucketId });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load Objects.', detail: error, life: 5000 });
  }
};

const confirmDelete = () => {
  confirm.require({
    message: 'Please confirm that you want to delete the selected file(s)?',
    header: 'Delete items',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => {
      // TODO: Delete items
    },
    reject: () => {
      // Intentionally left empty
    },
  });
};

// Get the user's list of objects
onMounted(() => {
  listObjects();
});
</script>

<template>
  <div>
    <UploadObjectButton :bucketId="route.params.bucketId as string" />
    <Button class="p-button-outlined mr-2"> <font-awesome-icon icon="fa-solid fa-download" class="mr-1" /> Download </Button>
    <Button class="p-button-outlined p-button-danger mr-2" @click="confirmDelete()">
      <font-awesome-icon icon="fa-solid fa-trash" class="mr-1" /> Delete
    </Button>
  </div>

  <div class="flex mt-4">
    <div class="flex-grow-1">
      <ObjectTable @show-info="showInfo" :displayInfo="displayInfo" :confirmDelete="confirmDelete" />
    </div>
    <div v-if="displayInfo" class="flex-shrink-0 ml-3" style="max-width: 33%; min-width: 33%">
      <ObjectSidebar :displayInfo="displayInfo" @close-info="closeInfo" />
    </div>
  </div>
</template>

<style scoped></style>
