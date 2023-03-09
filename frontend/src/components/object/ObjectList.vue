<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectSidebar,
  ObjectTable,
  ObjectUpload
} from '@/components/object';
import { Button } from '@/lib/primevue';
import {
  useAuthStore,
  useBucketStore,
  useMetadataStore,
  useObjectStore,
  usePermissionStore
} from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

type Props = {
  bucketId?: string
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const bucketStore = useBucketStore();
const metadataStore = useMetadataStore();
//const navStore = useNavStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();

const { getObjects, getSelectedObjects } = storeToRefs(objectStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const objectInfoId: Ref<string | undefined> = ref(undefined);
const displayUpload = ref(false);

// Actions
const showObjectInfo = async (objectId: string | undefined) => {
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
//     const bucket = await bucketStore.getBucketInfo(props.bucketId as string);
//     navStore.replace('__listObjectsDynamic', bucket?.bucketName ?? 'Unknown bucket');
//   } catch (error: any) {
//     toast.add({ severity: 'error', summary: 'Unable to load bucket information.', detail: error, life: 5000 });
//   }
// };

// Download
const selectedObjectIds = computed(() => {
  return getSelectedObjects.value.map((o) => o.id);
});

onMounted(async () => {
  // Removed for now
  // updateBreadcrumb();

  await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
  await objectStore.fetchObjects({ bucketId: props.bucketId });
});

watch( getObjects, () => {
  // Watch for object changes to get associated metadata
  metadataStore.fetchMetadata({objId: getObjects.value.map( (x: COMSObject) => x.id )});
});

</script>

<template>
  <div>
    <div
      v-if="displayUpload"
      class="mb-4"
    >
      <ObjectUpload
        :bucket-id="props.bucketId"
        :close-callback="closeUpload"
      />
    </div>
    <div>
      <Button
        v-if="permissionStore.isBucketActionAllowed(props.bucketId as string, getUserId, Permissions.CREATE )"
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
        :ids="selectedObjectIds"
      />
      <DeleteObjectButton
        :mode="ButtonMode.BUTTON"
        :ids="selectedObjectIds"
      />
    </div>

    <div class="flex mt-4">
      <div class="flex-grow-1">
        <ObjectTable
          :bucket-id="props.bucketId"
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
