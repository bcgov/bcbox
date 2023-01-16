<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useBucketStore } from '@/store';
import { Permissions } from '@/utils/constants';
import BucketPermissionUser from './BucketPermissionUser.vue';

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

const displayBucketPermissionUser : any = ref(false);

const cancelBucketPermissionUser = () => {
  displayBucketPermissionUser.value = false;
};
</script>

<template>
  <div>
    <Button
      v-if="!displayBucketPermissionUser"
      class="mt-1 mb-4"
      @click="displayBucketPermissionUser = true"
    >
      <font-awesome-icon
        icon="fa-solid fa-user-plus"
        class="mr-1"
      /> Add user
    </Button>

    <BucketPermissionUser
      v-if="displayBucketPermissionUser"
      @cancel-bucket-permission-user="cancelBucketPermissionUser"
    />

    <DataTable
      :loading="loading"
      :value="permissions"
      data-key="bucketId"
      class="p-datatable-sm"
      striped-rows
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
    >
      <template #empty>
        <div class="flex justify-content-center">
          <h3>There are no users associated with this bucket.</h3>
        </div>
      </template>
      <Column
        field="fullName"
        header="Name"
      />
      <Column
        header="Upload"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.create"
            input-id="create"
            :binary="true"
            @input="(value) => updateBucketPermission(value, data.userId, Permissions.CREATE)"
          />
        </template>
      </Column>
      <Column
        header="Read"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.read"
            input-id="read"
            :binary="true"
            @input="(value) => updateBucketPermission(value, data.userId, Permissions.READ)"
          />
        </template>
      </Column>
      <Column
        header="Update"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.update"
            input-id="update"
            :binary="true"
            @input="(value) => updateBucketPermission(value, data.userId, Permissions.UPDATE)"
          />
        </template>
      </Column>
      <Column
        header="Delete"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.delete"
            input-id="delete"
            :binary="true"
            @input="(value) => updateBucketPermission(value, data.userId, Permissions.DELETE)"
          />
        </template>
      </Column>
      <Column
        header="Manage"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.manage"
            input-id="manage"
            :binary="true"
            :disabled="!data.elevatedRights"
            @input="(value) => updateBucketPermission(value, data.userId, Permissions.MANAGE)"
          />
        </template>
      </Column>
      <Column header="Remove">
        <template #body="{ data }">
          <Button
            class="p-button-lg p-button-text"
            style="color: red"
            @click="removeBucketUser(data.userId)"
          >
            <font-awesome-icon icon="fa-solid fa-user-xmark" />
          </Button>
        </template>
      </Column>
    </DataTable>
  </div>
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
