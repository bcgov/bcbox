<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';

// Vue
import { storeToRefs } from 'pinia';
// PrimeVue
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
// State
import { useObjectStore } from '@/store/objectStore';
// Other
import { formatDateLong } from '@/utils/formatters';
import DeleteObjectButton from './DeleteObjectButton.vue';
import DownloadObjectButton from './DownloadObjectButton.vue';

defineProps({
  displayInfo: Object,
});

const { loading, multiSelectedObjects, objectList } = storeToRefs(useObjectStore());

const emit = defineEmits(['show-info']);

const showInfo = async (id: string) => {
  emit('show-info', id);
};
</script>

<template>
  <DataTable :loading="loading" :value="objectList" dataKey="id" class="p-datatable-sm" stripedRows
    responsiveLayout="scroll" :paginator="true" :rows="10"
    paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
    currentPageReportTemplate="{first}-{last} of {totalRecords}" :rowsPerPageOptions="[10, 20, 50]"
    v-model:selection="multiSelectedObjects">
    <template #empty>
      <div v-if="!loading" class="flex justify-content-center">
        <h3>There are no objects associated with your account in this bucket.</h3>
      </div>
    </template>
    <Column selectionMode="multiple" headerStyle="width: 3rem" />
    <Column field="name" :sortable="true" header="Name" headerStyle="width: 25%" bodyClass="truncate">
      <template #body="{ data }">
        <div v-if="data.name?.length > 25" v-tooltip.bottom="{ value: data.name }">
          {{ data.name }}
        </div>
        <div v-else>
          {{ data.name }}
        </div>
      </template>
    </Column>
    <Column field="id" header="Object ID" bodyClass="truncate">
      <template #body="{ data }">
        <div v-if="data.id?.length > 15" v-tooltip.bottom="{ value: data.id }">
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
    <Column header="Actions" headerStyle="width: 200px" headerClass="header-right"
      bodyClass="content-right action-buttons">
      <template #body="{ data }">
        <DownloadObjectButton :mode="ButtonMode.ICON" :ids="[data.id]" />
        <Button class="p-button-lg p-button-rounded p-button-text">
          <font-awesome-icon icon="fa-solid fa-gear" />
        </Button>
        <Button class="p-button-lg p-button-rounded p-button-text" @click="showInfo(data.id)">
          <font-awesome-icon icon="fa-solid fa-circle-info" />
        </Button>
        <DeleteObjectButton :mode="ButtonMode.ICON" :ids="[data.id]" />
      </template>
    </Column>
  </DataTable>
</template>
