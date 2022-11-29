<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import BucketPermission from './BucketPermission.vue';

import { useBucketStore } from '@/store/bucketStore';
import { RouteNames } from '@/utils/constants';

const { loading, buckets } = storeToRefs(useBucketStore());

const permissionsVisible = ref(true);

const emit = defineEmits(['show-info']);

const showInfo = async (id: number) => {
  emit('show-info', id);
};
</script>

<template>
  <DataTable
    :loading="loading"
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
      <div v-if="!loading" class="flex justify-content-center">
        <h3>There are no buckets associated with your account.</h3>
      </div>
    </template>
    <Column headerStyle="width: 1%">
      <template #body>
        <font-awesome-icon icon="fa-solid fa-box-open" />
      </template>
    </Column>
    <Column field="name" header="Bucket Name" bodyClass="truncate">
      <template #body="{ data }">
        <div v-if="data.bucketName.length > 150" v-tooltip.bottom="{ value: data.bucketName }">
          <router-link :to="{ name: RouteNames.ListObjects, query: { bucketId: data.bucketId } }"> {{ data.bucketName }}</router-link>
        </div>
        <div v-else>
          <router-link :to="{ name: RouteNames.ListObjects, query: { bucketId: data.bucketId } }"> {{ data.bucketName }}</router-link>
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

  <Dialog v-model:visible="permissionsVisible" :draggable="false">
    <template #header>
      <div class="flex align-items-start">
        <font-awesome-icon icon="fa-solid fa-gear" style="font-size: 2rem" />
        <div>
          <h1>Bucket Permissions</h1>
          <h3>bucketname</h3>
        </div>
      </div>
    </template>

    <BucketPermission />
  </Dialog>
</template>

<style lang="scss" scoped>
// :deep(.p-dialog-header) {
//   align-items: flex-start;
// }

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
