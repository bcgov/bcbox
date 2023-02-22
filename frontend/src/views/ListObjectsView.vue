<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import ObjectList from '@/components/object/ObjectList.vue';
import { useBucketStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/interfaces';

// Store
const bucketStore = useBucketStore();
const { getBuckets } = storeToRefs(bucketStore);
const route = useRoute();

// State
const bucket: Ref<Bucket | undefined> = ref(undefined);

// Actions
watch( getBuckets, () => {
  bucket.value = bucketStore.getBucketById(route.query.bucketId as string);
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
    <ObjectList />
  </div>
</template>

<style scoped>
h1 {
  font-weight: bold;
}
</style>
