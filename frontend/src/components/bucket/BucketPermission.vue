<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useBucketStore } from '@/store/bucketStore';
import { Permissions } from '@/utils/constants';

const props = defineProps<{
  bucketId: string;
}>();

const bucketStore = useBucketStore();
const { loading, permissions } = storeToRefs(useBucketStore());

onMounted(() => {
  bucketStore.getBucketPermissions(props.bucketId);
});

const updateBucketPermission = (value: any, userId: string, permCode: string) => {
  if (value) {
    bucketStore.addBucketPermission(props.bucketId, userId, permCode);
  } else {
    bucketStore.deleteBucketPermission(props.bucketId, userId, permCode);
  }
};

const removeBucketUser = (userId: string) => {
  bucketStore.removeBucketUser(props.bucketId, userId);
};
</script>

<template>
  <Button class="mt-1 mb-4"> <font-awesome-icon icon="fa-solid fa-user-plus" class="mr-1" /> Add user </Button>

  <DataTable
    :loading="loading"
    :value="permissions"
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
    <Column field="fullName" header="Name" />
    <Column header="Upload" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox
          inputId="create"
          v-model="data.create"
          :binary="true"
          @input="(value) => updateBucketPermission(value, data.userId, Permissions.CREATE)"
        />
      </template>
    </Column>
    <Column header="Read" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox
          inputId="read"
          v-model="data.read"
          :binary="true"
          @input="(value) => updateBucketPermission(value, data.userId, Permissions.READ)"
        />
      </template>
    </Column>
    <Column header="Update" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox
          inputId="update"
          v-model="data.update"
          :binary="true"
          @input="(value) => updateBucketPermission(value, data.userId, Permissions.UPDATE)"
        />
      </template>
    </Column>
    <Column header="Delete" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox
          inputId="delete"
          v-model="data.delete"
          :binary="true"
          @input="(value) => updateBucketPermission(value, data.userId, Permissions.DELETE)"
        />
      </template>
    </Column>
    <Column header="Manage" bodyClass="content-center">
      <template #body="{ data }">
        <Checkbox
          inputId="manage"
          v-model="data.manage"
          :binary="true"
          @input="(value) => updateBucketPermission(value, data.userId, Permissions.MANAGE)"
        />
      </template>
    </Column>
    <Column header="Remove">
      <template #body="{ data }">
        <Button class="p-button-lg p-button-text" style="color: red" @click="removeBucketUser(data.userId)">
          <font-awesome-icon icon="fa-solid fa-user-xmark" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>

<style lang="scss" scoped>
:deep(.content-center) {
  text-align: center !important;
}

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
