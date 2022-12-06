<script setup lang="ts">
// Vue
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
// PrimeVue
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
// State
import { useObjectStore } from '@/store/objectStore';
// Other
import { formatDateLong } from '@/utils/formatters';

defineProps({
  displayInfo: Object,
  //confirmDelete: Function,
});

const confirm = useConfirm();

const { loading, objectList } = storeToRefs(useObjectStore());

const selectedObjects = ref();

const emit = defineEmits(['show-info']);

const showInfo = async (id: string) => {
  emit('show-info', id);
};

const confirmDelete = () => {
  confirm.require({
    message: 'Please confirm that you want to delete the selected file(s)?',
    header: 'Delete items',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => {
      // TODO: Delete items
    },
    reject: () => {
      // Intentionally left empty
    },
  });
};
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
    v-model:selection="selectedObjects"
  >
    <template #empty>
      <div v-if="!loading" class="flex justify-content-center">
        <h3>There are no objects associated with your account in this bucket.</h3>
      </div>
    </template>
    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
    <Column field="path" header="Name" headerStyle="width: 25%" bodyClass="truncate">
      <template #body="{ data }">
        <div v-if="data.name?.length > 150" v-tooltip.bottom="{ value: data.name }">
          {{ data.name }}
        </div>
        <div v-else>
          {{ data.name }}
        </div>
      </template>
    </Column>
    <Column field="id" header="Object ID" bodyClass="truncate">
      <template #body="{ data }">
        <div v-if="data.id?.length > 150" v-tooltip.bottom="{ value: data.id }">
          {{ data.id }}
        </div>
        <div v-else>
          {{ data.id }}
        </div>
      </template>
    </Column>
    <Column header="Updated date" :hidden="displayInfo ? true : false">
      <template #body="{ data }">
        {{ formatDateLong(data.updatedAt) }}
      </template>
    </Column>
    <Column header="Actions" headerStyle="width: 15%" headerClass="header-right" bodyClass="content-right">
      <template #body="{ data }">
        <Button class="p-button-lg p-button-text">
          <font-awesome-icon icon="fa-solid fa-download" />
        </Button>
        <Button class="p-button-lg p-button-rounded p-button-text">
          <font-awesome-icon icon="fa-solid fa-gear" />
        </Button>
        <Button class="p-button-lg p-button-rounded p-button-text" @click="showInfo(data.id)">
          <font-awesome-icon icon="fa-solid fa-circle-info" />
        </Button>
        <Button class="p-button-lg p-button-text" style="color: red" @click="confirmDelete">
          <font-awesome-icon icon="fa-solid fa-trash" />
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
