<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onErrorCaptured, onMounted, ref } from 'vue';

import ObjectList from '@/components/object/ObjectList.vue';
import { RouteNames } from '@/utils/constants';

import { useBucketStore } from '@/store';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

type Props = {
  bucketId?: string
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

const bucketStore = useBucketStore();

const bucket: Ref< Bucket | undefined > = ref(undefined);

async function getBucketName() {
  bucket.value = props.bucketId ? await bucketStore.getBucketById(props.bucketId) : undefined;
}

onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.add({ severity: 'error', summary: 'Unable to load bucket information.', detail: e.message, life: 5000 });
});

onMounted(async () => {
  await getBucketName();
});
</script>

<template>
  <div>
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
      <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: bucket.bucketId } }">
        {{ bucket.bucketName }}
      </router-link>
    </h2>
    <ObjectList :bucket-id="props.bucketId" />
  </div>
</template>

<style scoped>
h1 {
  font-weight: bold;
}
</style>
