<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ObjectList } from '@/components/object';
import { useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore, usePermissionStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket, BucketPermission } from '@/types';

// Props
type Props = {
  bucketId?: string
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const bucketStore = useBucketStore();
const permissionStore = usePermissionStore();
const { getUserId } = storeToRefs(useAuthStore());

// State
const ready: Ref<boolean> = ref(false);
const bucket: Ref< Bucket | undefined > = ref(undefined);

// Actions
async function getBucketName() {
  bucket.value = props.bucketId ? await bucketStore.findBucketById(props.bucketId) : undefined;
}

onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.add({ severity: 'error', summary: 'Unable to load bucket information.', detail: e.message, life: 5000 });
});

onBeforeMount( async () => {
  const router = useRouter();

  const permResponse = await permissionStore.fetchBucketPermissions({ userId: getUserId.value, objectPerms: true });
  if( !permResponse.some( (x: BucketPermission) => x.bucketId === props.bucketId ) ) {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
  else {
    ready.value = true;
  }
});

onMounted( () => {
  getBucketName();
});
</script>

<template>
  <div v-if="ready">
    <h1>
      Files
    </h1>
    <h2
      v-if="bucket"
      class="pb-3"
    >
      <font-awesome-icon
        icon="fa-solid fa-box-open"
        class="mr-1"
      />
      {{ bucket.bucketName }}
    </h2>
    <ObjectList :bucket-id="props.bucketId" />
  </div>
</template>
