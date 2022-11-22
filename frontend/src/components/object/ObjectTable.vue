<script setup lang="ts">
// Vue
import { storeToRefs } from 'pinia';
// PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
// State
import { useObjectStore } from '@/store/objectStore';
// Other
import { formatDateLong } from '@/utils/formatters';

const { loading, objectList } = storeToRefs(useObjectStore());

// const emit = defineEmits(['show-info']);

// const showInfo = async (id: number) => {
//   emit('show-info', id);
// };
</script>

<template>
  <DataTable
    :loading="loading"
    :value="objectList"
    dataKey="id"
    class="p-datatable-sm"
    stripedRows
    responsiveLayout="scroll"
    :paginator="true"
    :rows="10"
    paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
    currentPageReportTemplate="{first}-{last} of {totalRecords}"
    :rowsPerPageOptions="[10, 20, 50]"
  >
    <template #empty>
      <div v-if="!loading" class="flex justify-content-center">
        <h3>There are no objects associated with your account in this bucket.</h3>
      </div>
    </template>
    <Column field="path" header="Path" />
    <Column field="public" header="Public" />
    <Column field="createdAt" header="Created">
      <template #body="{ data }">
        {{ formatDateLong(data.createdAt) }}
      </template>
    </Column>
    <Column field="updatedAt" header="Updated">
      <template #body="{ data }">
        {{ formatDateLong(data.updatedAt) }}
      </template>
    </Column>
  </DataTable>
</template>

<style lang="scss" scoped>
:deep(.p-datatable-thead > tr > th) {
  background-color: transparent;
}

:deep(.p-column-title) {
  font-weight: bold;
}

:deep(.p-paginator) {
  justify-content: right;
}

:deep(.header-right .p-column-header-content) {
  justify-content: right;
}

:deep(.content-right) {
  text-align: right !important;
}

:deep(.p-button.p-button-lg) {
  padding: 0;
  margin-left: 1rem;
}

:deep(.truncate) {
  max-width: 1px;
  white-space: nowrap;

  > div {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
