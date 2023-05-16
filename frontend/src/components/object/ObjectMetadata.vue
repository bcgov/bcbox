<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import GridRow from '@/components/form/GridRow.vue';
import { useMetadataStore, useVersionStore } from '@/store';

import type { Ref } from 'vue';
import type { Metadata } from '@/types';

// Props
type Props = {
  objectId: string;
  versionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Store
const metadataStore = useMetadataStore();
const versionStore = useVersionStore();
const { getMetadata: tsGetMetadata } = storeToRefs(metadataStore);
const { getMetadata: vsGetMetadata } = storeToRefs(versionStore);

// State
const objectMetadata: Ref<Metadata | undefined> = ref(undefined);

// Actions
async function load() {
  if( props.versionId ) {
    objectMetadata.value = versionStore.findMetadataByVersionId(props.versionId);
  }
  else {
    objectMetadata.value = metadataStore.findMetadataByObjectId(props.objectId);
  }
}

onMounted(() => {
  load();
});

watch([props, tsGetMetadata,vsGetMetadata] , () => {
  load();
});
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div class="col-12">
      <h2 class="font-bold">
        Metadata
      </h2>
    </div>
    <GridRow
      v-for="meta in objectMetadata?.metadata"
      :key="meta.key + meta.value"
      :label="meta.key"
      :value="meta.value"
    />
  </div>
</template>
