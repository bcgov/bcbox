<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Column, DataTable } from '@/lib/primevue';
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

watch(props, () => {
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
    <div class="col-12">
      <DataTable
        v-if="objectMetadata"
        :value="objectMetadata.metadata"
        class="p-datatable-sm"
        responsive-layout="scroll"
      >
        <Column
          field="key"
          header="Key"
        >
          <template #body="{ data }">
            <div>
              {{ data.key }}:
            </div>
          </template>
        </Column>

        <Column
          field="value"
          header="Value"
          class="overflow-hidden details-value-column"
        >
          <template #body="{ data }">
            <div class="wrap-block">
              {{ data.value }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
