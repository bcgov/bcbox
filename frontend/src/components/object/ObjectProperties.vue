<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import GridRow from '@/components/form/GridRow.vue';
import { useBucketStore, useMetadataStore, useObjectStore, useUserStore, useVersionStore } from '@/store';
import { RouteNames } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Bucket, COMSObject, Metadata, Version } from '@/types';

// Props
type Props = {
  objectId: string;
  versionId?: string;
  fullView: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Store
const bucketStore = useBucketStore();
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const userStore = useUserStore();
const versionStore = useVersionStore();
const { getUserSearch } = storeToRefs(userStore);

// State
const bucket: Ref<Bucket | undefined> = ref(undefined);
const createdBy: Ref<string | undefined> = ref(undefined);
const object: Ref<COMSObject | undefined> = ref(undefined);
const objectMetadata: Ref<Metadata | undefined> = ref(undefined);
const updatedBy: Ref<string | undefined> = ref(undefined);
const version: Ref<Version | undefined> = ref(undefined);

// Actions
async function load() {
  object.value = objectStore.findObjectById(props.objectId);
  await bucketStore.fetchBuckets({ bucketId: object.value?.bucketId });
  bucket.value = bucketStore.findBucketById(object.value?.bucketId as string);

  if( props.fullView ) {
    if( props.versionId ) {
      version.value = versionStore.findVersionById(props.versionId);
      objectMetadata.value = versionStore.findMetadataByVersionId(props.versionId);

      await userStore.fetchUsers({userId:[version.value?.createdBy, version.value?.updatedBy]});
      createdBy.value = getUserSearch.value.find( x => x.userId === version.value?.createdBy )?.fullName;
      updatedBy.value = getUserSearch.value.find( x => x.userId === version.value?.updatedBy )?.fullName;
    }
    else {
      objectMetadata.value = metadataStore.findMetadataByObjectId(object.value?.id as string);

      await userStore.fetchUsers({userId:[object.value?.createdBy, object.value?.updatedBy]});
      createdBy.value = getUserSearch.value.find( x => x.userId === object.value?.createdBy )?.fullName;
      updatedBy.value = getUserSearch.value.find( x => x.userId === object.value?.updatedBy )?.fullName;
    }
  }
}

onMounted(() => {
  load();
});

watch( props, () => {
  load();
});
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div class="col-12">
      <h2 class="font-bold">
        Properties
      </h2>
    </div>

    <GridRow
      class=" overflow-hidden"
      label="Name"
      :value="object?.name"
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
