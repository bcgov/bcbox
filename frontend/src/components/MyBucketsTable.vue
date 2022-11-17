<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

import { useBucketStore } from '@/store/bucketStore';

const { buckets } = storeToRefs(useBucketStore());

const emit = defineEmits(['show-info']);

const showInfo = async (id: number) => {
  emit('show-info', id);
};
</script>

<template>
  <DataTable
    :value="buckets"
    dataKey="bucketId"
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
      <div class="flex justify-content-center">
        <h3>There are no buckets associated with your account.</h3>
      </div>
    </template>
    <template #loading> Loading bucket data. Please wait.</template>
    <Column headerStyle="width: 1%">
      <template #body>
        <font-awesome-icon icon="fa-solid fa-box-open" />
      </template>
    </Column>
    <Column field="name" header="Bucket Name" bodyClass="truncate">
      <template #body="{ data }">
        <div v-if="data.bucketName.length > 150" v-tooltip.bottom="{ value: data.bucketName }">
          <router-link :to="{ name: 'home' }"> {{ data.bucketName }}</router-link>
        </div>
        <div v-else>
          <router-link :to="{ name: 'home' }"> {{ data.bucketName }}</router-link>
        </div>
      </template>
    </Column>
    <Column header="Actions" headerStyle="width: 12%" headerClass="header-right" bodyClass="content-right">
      <template #body="{ data }">
        <Button class="p-button-lg p-button-rounded p-button-text"><font-awesome-icon icon="fa-solid fa-gear" /></Button>
        <Button class="p-button-lg p-button-rounded p-button-text" @click="showInfo(data.bucketId)">
          <font-awesome-icon icon="fa-solid fa-circle-info" />
        </Button>
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
