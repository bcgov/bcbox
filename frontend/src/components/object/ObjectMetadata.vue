<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useMetadataStore } from '@/store';

import type { Ref } from 'vue';
import type { Metadata } from '@/interfaces';

const metadataStore = useMetadataStore();

const props = defineProps<{
  objectInfoId: string;
}>();

const objectMetadata: Ref<Metadata | undefined> = ref(undefined);

async function load() {
  await metadataStore.fetchMetadata({objId: props.objectInfoId});
  objectMetadata.value = metadataStore.getMetadataByObjectId(props.objectInfoId);
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
        Metadata
      </h2>
    </div>
    <div>
      <DataTable
        v-if="objectMetadata"
        :value="objectMetadata.metadata"
        striped-rows
        responsive-layout="scroll"
      >
        <Column
          field="key"
          header="Key"
        />
        <Column
          field="value"
          header="Value"
        />
      </DataTable>
    </div>
  </div>
</template>
