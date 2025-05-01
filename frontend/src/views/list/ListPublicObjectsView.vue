<script setup lang="ts">
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { useRouter } from 'vue-router';

import { PublicObjectList } from '@/components/object';
import { useToast } from '@/lib/primevue';
import { useBucketStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Props
type Props = {
  bucketId: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const bucketStore = useBucketStore();

// State
const ready: Ref<boolean> = ref(false);
const bucket: Ref<Bucket | undefined> = ref(undefined);

onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.error('Loading folder', e.message);
});

onBeforeMount(async () => {
  const router = useRouter();
  const bucketResponse = await bucketStore.getBucket(props.bucketId);

  console.log('bucketResponse', bucketResponse);

  if (bucketResponse?.public) {
    bucket.value = bucketResponse;
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
    <PublicObjectList :bucket-id="props.bucketId" />
  </div>
</template>

<style scoped lang="scss">
h2 svg {
  color: $bcbox-primary;
}
</style>
