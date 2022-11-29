<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useBucketStore } from '@/store/bucketStore';

const bucketStore = useBucketStore();

const temp = ref([
  {
    name: 'Person',
    idir: 'pson',
    create: true,
    read: true,
    update: true,
    delete: true,
    manage: true,
  },
]);
</script>

<template>
  <DataTable
    :value="temp"
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
        <h3>There are no users associated with this bucket.</h3>
      </div>
    </template>
    <Column field="name" header="Name" />
    <Column field="idir" header="Username" />
    <Column header="Create" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox inputId="create" v-model="data.create" :binary="true" />
      </template>
    </Column>
    <Column header="Read" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox inputId="read" v-model="data.read" :binary="true" />
      </template>
    </Column>
    <Column header="Update" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox inputId="update" v-model="data.update" :binary="true" />
      </template>
    </Column>
    <Column header="Delete" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox inputId="delete" v-model="data.delete" :binary="true" />
      </template>
    </Column>
    <Column header="Manage" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox inputId="manage" v-model="data.manage" :binary="true" />
      </template>
    </Column>
    <Column header="Remove">
      <template #body="{ data }">
        <Button class="p-button-lg p-button-text" style="color: red"><font-awesome-icon icon="fa-solid fa-user-xmark" /></Button>
      </template>
    </Column>
  </DataTable>
</template>

<style lang="scss" scoped>
:deep(.content-center) {
  text-align: center !important;
}
</style>
