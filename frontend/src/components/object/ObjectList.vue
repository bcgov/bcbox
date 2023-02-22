<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import Button from 'primevue/button';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectSidebar,
  ObjectTable,
  ObjectUpload
} from '@/components/object';
import { ButtonMode } from '@/interfaces/common/enums';
import { useBucketStore, useObjectStore, usePermissionStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';

// Store
const permissionStore = usePermissionStore();
//const navStore = useNavStore();
const objectStore = useObjectStore();
const { multiSelectedObjects } = storeToRefs(objectStore);
const { currentUser } = storeToRefs(useUserStore());
const route = useRoute();

// State
const objectInfoId: Ref<string | undefined> = ref(undefined);
const displayUpload = ref(false);

// Actions
const showObjectInfo = async (objectId: any) => {
  objectInfoId.value = objectId;
};

const closeObjectInfo = () => {
  objectInfoId.value = undefined;
};

const showUpload = () => {
  displayUpload.value = true;
};

const closeUpload = () => {
  displayUpload.value = false;
};

// const updateBreadcrumb = async () => {
//   try {
//     const bucket = await bucketStore.getBucketInfo(route.query.bucketId as string);
//     navStore.replace('__listObjectsDynamic', bucket?.bucketName ?? 'Unknown bucket');
//   } catch (error: any) {
//     toast.add({ severity: 'error', summary: 'Unable to load bucket information.', detail: error, life: 5000 });
//   }
// };

// Download
const multiSelectedObjectIds = computed(() => {
  return multiSelectedObjects.value.map((o) => o.id);
});


const load = async () => {
  await permissionStore.fetchBucketPermissions();
  await useBucketStore().fetchBuckets();
  await permissionStore.fetchObjectPermissions({
    bucketId: route.query.bucketId,
  });
  await objectStore.fetchObjects({ bucketId: route.query.bucketId });
};

onMounted(() => {
  // Removed for now
  // updateBreadcrumb();
  load();
});
</script>

<template>
  <div>
    <div
      v-if="displayUpload"
      class="mb-4"
    >
      <ObjectUpload
        :close-callback="closeUpload"
      />
    </div>
    <div>
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
      <!-- <DownloadObjectButton
        :mode="ButtonMode.BUTTON"
        :ids="multiSelectedObjectIds"
      />
      <DeleteObjectButton
        class="ml-2"
        :mode="ButtonMode.BUTTON"
        :ids="multiSelectedObjectIds"
      /> -->
    </div>

    <div class="flex mt-4">
      <div class="flex-grow-1">
        <ObjectTable
          :object-info-id="objectInfoId"
          @show-object-info="showObjectInfo"
        />
      </div>
      <div
        v-if="objectInfoId"
        class="flex-shrink-0 ml-3"
        style="max-width: 33%; min-width: 33%"
      >
        <ObjectSidebar
          :object-info-id="objectInfoId"
          @close-object-info="closeObjectInfo"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
