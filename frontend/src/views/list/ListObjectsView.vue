<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ObjectList } from '@/components/object';
import { useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Props
type Props = {
  bucketId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());

// State
const ready: Ref<boolean> = ref(false);
const bucket: Ref<Bucket | undefined> = ref(undefined);

onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.error('Loading folder', e.message);
});

onBeforeMount(async () => {
  const router = useRouter();

  // fetch buckets (which is already scoped by cur user's permissions) and populates bucket and permissions in store
  const bucketResponse = await bucketStore.fetchBuckets({
    bucketId: props.bucketId,
    userId: getUserId.value,
    objectPerms: true
  });
  if (bucketResponse?.length) {
    bucket.value = bucketResponse[0];
    ready.value = true;
  } else {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
});
</script>

<template>
  <div v-if="ready">
    <h2
      v-if="bucket"
      class="mb-3 flex overflow-hidden"
    >
      <font-awesome-icon
        icon="fa-solid fa-folder"
        class="mr-2 mt-2"
      />
      <span class="wrap-block w-11">{{ bucket.bucketName }}</span>
    </h2>
    <ObjectList :bucket-id="props.bucketId" />
  </div>
</template>

<style scoped lang="scss">
h2 svg {
  color: $bcbox-primary;
}
</style>
