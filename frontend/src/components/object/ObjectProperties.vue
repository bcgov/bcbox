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
  objectInfo: {
    type: Object,
    default: undefined
  },
  fullView: {
    type: Boolean,
    default: true
  }
});

const bucket: Ref<Bucket | undefined > = ref();
const createdBy: Ref<string | undefined> = ref();
const updatedBy: Ref<string | undefined> = ref();

async function getBucketData() {
  // Get some associated bucket information
  bucket.value = await bucketStore.getBucketInfo(props.objectInfo?.bucketId);
}

async function getUserData() {
  await userStore.searchUsers({userId:[props.objectInfo?.createdBy, props.objectInfo?.updatedBy]});
  createdBy.value = userSearch.value.find( x => x.userId === props.objectInfo?.createdBy )?.fullName;
  updatedBy.value = userSearch.value.find( x => x.userId === props.objectInfo?.updatedBy )?.fullName;
}

onMounted(() => {
  getBucketData();
  getUserData();
});

watch( props, () => {
  getBucketData();
  getUserData();
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
      :value="objectInfo?.name"
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
      :value="objectInfo?.bucketId"
    />
    <GridRow
      label="Object ID"
      :value="objectInfo?.id"
    />
    <GridRow
      v-if="fullView"
      label="Created by"
      :value="createdBy"
    />
    <GridRow
      v-if="fullView"
      label="Creation date"
      :value="formatDateLong(objectInfo?.createdAt)"
    />
    <GridRow
      label="Updated by"
      :value="updatedBy"
    />
    <GridRow
      label="Updated date"
      :value="formatDateLong(objectInfo?.updatedAt)"
    />
  </div>
</template>
