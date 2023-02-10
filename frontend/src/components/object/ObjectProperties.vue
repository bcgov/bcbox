<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useBucketStore, useUserStore } from '@/store';
import GridRow from '@/components/form/GridRow.vue';
import { RouteNames } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Bucket } from '@/interfaces';

const bucketStore = useBucketStore();
const userStore = useUserStore();

const { userSearch } = storeToRefs(userStore);

const props = defineProps({
  objectProperties: {
    type: Object,
    default: undefined
  },
  fullView: {
    type: Boolean,
    default: true
  }
});

const bucket: Ref<Bucket | undefined > = ref(undefined);
const createdBy = ref();
const updatedBy = ref();

async function getBucketData() {
  // Get some associated bucket information
  bucket.value = await bucketStore.getBucketInfo(props.objectProperties?.bucketId);
}

async function getUserData() {
  await userStore.searchUsers({userId:[props.objectProperties?.createdBy, props.objectProperties?.updatedBy]});
  createdBy.value = userSearch.value.find( x => x.userId === props.objectProperties?.createdBy );
  updatedBy.value = userSearch.value.find( x => x.userId === props.objectProperties?.updatedBy );
}

onMounted(() => {
  getBucketData();
  getUserData();
});

watch( props, async () => {
  await getBucketData();
  await getUserData();
});

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2 class="font-bold">
        Properties
      </h2>
    </div>

    <GridRow
      label="Name"
      :value="objectProperties?.name"
    />
    <GridRow
      v-if="fullView"
      label="Bucket"
      :value="bucket?.bucketName"
      :link="{ name: RouteNames.ListObjects, query: { bucketId: bucket?.bucketId } }"
    />
    <GridRow
      v-if="fullView"
      label="Bucket ID"
      :value="objectProperties?.bucketId"
    />
    <GridRow
      label="Object ID"
      :value="objectProperties?.id"
    />
    <GridRow
      v-if="fullView"
      label="Created by"
      :value="userSearch.find( x => x.userId === objectProperties?.createdBy)?.fullName"
    />
    <GridRow
      v-if="fullView"
      label="Creation date"
      :value="formatDateLong(objectProperties?.createdAt)"
    />
    <GridRow
      label="Updated by"
      :value="userSearch.find( x => x.userId === objectProperties?.updatedBy)?.fullName"
    />
    <GridRow
      label="Updated date"
      :value="formatDateLong(objectProperties?.updatedAt)"
    />
  </div>
</template>
