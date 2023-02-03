<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import ObjectList from '@/components/object/ObjectList.vue';
import { RouteNames } from '@/utils/constants';

import { useBucketStore } from '@/store';

import type { Ref } from 'vue';
import type { Bucket } from '@/interfaces';

const bucketStore = useBucketStore();
const route = useRoute();
const toast = useToast();

const bucket: Ref< Bucket | undefined > = ref(undefined);

const getBucketName = async () => {
  try {
    bucket.value = await bucketStore.getBucketInfo(route.query.bucketId as string);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load bucket information.', detail: error, life: 5000 });
  }
};

getBucketName();

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
      <router-link :to="{ name: RouteNames.ListObjects, query: { bucketId: bucket.bucketId } }">
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
