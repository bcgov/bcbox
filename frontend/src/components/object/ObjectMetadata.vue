<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import type { Metadata } from '@/interfaces';

defineProps<{
  objectMetadata: Metadata;
}>();
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
