<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useBucketStore, useUserStore } from '@/store';
import type { User } from '@/interfaces';
import { Permissions } from '@/utils/constants';

// props
const props = defineProps<{
  bucketId: string;
}>();

// stores
const bucketStore = useBucketStore();
const { loading, permissions } = storeToRefs(useBucketStore());

const userStore = useUserStore();
const { userSearch } = storeToRefs(useUserStore());

// mounted
onMounted(() => {
  bucketStore.getBucketPermissions(props.bucketId);
  resetBucketPermissionUsers();
});

//variables and methods
const isShowAddUserBtn: any = ref(true);
const isAddBPUBtnDisabled: any = ref(true);
const showUserExistError: any = ref(false);

const selectedUser = ref();
const onAddBucketPermissionUser = () => {
  if(selectedUser.value !== null && !ifUserExist()) {
    permissions.value.push(
      {
        userId: selectedUser.value.userId,
        elevatedRights: true,
        fullName: selectedUser.value.fullName,
        create: false,
        read: false,
        update: false,
        delete: false,
        manage: false
      }
    );
    resetBucketPermissionUsers();
  }
};
const onCancelBPU = () => {
  isShowAddUserBtn.value = true;
  isAddBPUBtnDisabled.value = true;
  resetBucketPermissionUsers();
};
const onDropdownInput = async (event: any) => {
  checkIfUserExistShowError();
  var inputValue = event.target.value;
  if(inputValue.length > 0) {
    await userStore.searchUsers({ search: event.target.value }); //TO DO: look at the bug with 'ma', 'sa'...
  }
  if(inputValue.length < 1) {
    resetBucketPermissionUsers();
  }
  if (selectedUser.value !== null && selectedUser.value.fullName == undefined) {
    isAddBPUBtnDisabled.value = true;
  }
};
const onDropdownChange = () => {
  checkIfUserExistShowError();
  isAddBPUBtnDisabled.value = selectedUser.value === null || ifUserExist();
};
const resetBucketPermissionUsers = () => {
  userSearch.value = ([] as User[]);
  selectedUser.value = null;
};
const checkIfUserExistShowError = () => {
  if(ifUserExist()) {
    showUserExistError.value = true;
  } else {
    showUserExistError.value = false;
  }
};
const ifUserExist = () => {
  return permissions.value.some(e => e.fullName === selectedUser.value.fullName);
};

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
  <div>
    <Button
      v-if="isShowAddUserBtn"
      class="mt-1 mb-4"
      @click="isShowAddUserBtn = false"
    >
      <font-awesome-icon
        icon="fa-solid fa-user-plus"
        class="mr-1"
      /> Add user
    </Button>
    <div
      v-if="!isShowAddUserBtn"
    >
      <Dropdown
        v-model="selectedUser"
        :options="userSearch"
        option-label="fullName"
        :editable="true"
        placeholder="enter full name"
        class="mt-1 mb-4"
        :class="showUserExistError ? 'p-invalid' : ''"
        @input="onDropdownInput"
        @change="onDropdownChange"
      />
      <Button
        label="Add"
        class="mt-1 mb-4 ml-3"
        icon="pi pi-check"
        :disabled="isAddBPUBtnDisabled"
        @click="onAddBucketPermissionUser"
      />
      <Button
        label="Cancel"
        class="p-button-text mt-1 mb-4 ml-3"
        icon="pi pi-times"
        @click="onCancelBPU"
      />
    </div>

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

.p-dropdown {
  width: 60%;
}

</style>
