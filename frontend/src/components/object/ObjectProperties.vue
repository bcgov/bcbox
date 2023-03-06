<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import GridRow from '@/components/form/GridRow.vue';
import { useBucketStore, useMetadataStore, useObjectStore, useUserStore } from '@/store';
import { RouteNames } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Bucket, COMSObject, Metadata } from '@/types';

// Props
type Props = {
  objectInfoId: string;
  fullView: boolean;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const bucketStore = useBucketStore();
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const userStore = useUserStore();
const { getUserSearch } = storeToRefs(userStore);

// State
const bucket: Ref<Bucket | undefined> = ref(undefined);
const object: Ref<COMSObject | undefined> = ref(undefined);
const objectMetadata: Ref<Metadata | undefined> = ref(undefined);
const createdBy: Ref<string | undefined> = ref(undefined);
const updatedBy: Ref<string | undefined> = ref(undefined);

// Actions
async function load() {
  if( props.fullView ) {
    await objectStore.fetchObjects({objId: props.objectInfoId});
    await metadataStore.fetchMetadata({objId: props.objectInfoId});
  }
  object.value = objectStore.getObjectById(props.objectInfoId);
  objectMetadata.value = metadataStore.getMetadataByObjectId(object.value?.id as string);
  bucket.value = bucketStore.getBucketById(object.value?.bucketId as string);

  await userStore.searchUsers({userId:[object.value?.createdBy, object.value?.updatedBy]});
  createdBy.value = getUserSearch.value.find( x => x.userId === object.value?.createdBy )?.fullName;
  updatedBy.value = getUserSearch.value.find( x => x.userId === object.value?.updatedBy )?.fullName;
}

onMounted(() => {
  load();
});

watch( props, () => {
  load();
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
      :value="objectMetadata?.metadata.find(x => x.key === 'name')?.value"
    />
    <GridRow
      v-if="fullView"
      label="Bucket"
      :value="bucket?.bucketName"
      :link="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: bucket?.bucketId } }"
    />
    <GridRow
      v-if="fullView"
      label="Bucket ID"
      :value="object?.bucketId"
    />
    <GridRow
      label="Object ID"
      :value="object?.id"
    />
    <GridRow
      v-if="fullView"
      label="Created by"
      :value="createdBy"
    />
    <GridRow
      v-if="fullView"
      label="Creation date"
      :value="formatDateLong(object?.createdAt as string)"
    />
    <GridRow
      label="Updated by"
      :value="updatedBy"
    />
    <GridRow
      label="Updated date"
      :value="formatDateLong(object?.updatedAt as string)"
    />
  </div>
</template>
