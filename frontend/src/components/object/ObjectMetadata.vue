<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Column, DataTable } from '@/lib/primevue';
import { useMetadataStore } from '@/store';

import type { Ref } from 'vue';
import type { Metadata } from '@/types';

// Props
type Props = {
  objectInfoId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const metadataStore = useMetadataStore();

// State
const objectMetadata: Ref<Metadata | undefined> = ref(undefined);

// Actions
async function load() {
  objectMetadata.value = metadataStore.findMetadataByObjectId(
    props.objectInfoId
  );
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
    <div>
      <DataTable
        v-if="objectMetadata"
        :value="objectMetadata.metadata"
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
