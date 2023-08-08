<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import BucketPermissionAddUser from '@/components/bucket/BucketPermissionAddUser.vue';
import { useAlert } from '@/composables/useAlert';
import { Button, Checkbox, Column, DataTable } from '@/lib/primevue';
import { usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { UserPermissions } from '@/types';

// Props
type Props = {
  bucketId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();
const { getMappedBucketToUserPermissions } = storeToRefs(permissionStore);

// State
const showSearchUsers: Ref<boolean> = ref(false);

// Actions
const removeManageAlert = useAlert('Warning', 'Cannot remove last user with MANAGE permission.');

const cancelSearchUsers = () => {
  showSearchUsers.value = false;
};

const removeBucketUser = (userId: string) => {
  const managers = getMappedBucketToUserPermissions.value.filter( (x: UserPermissions) => x.manage );
  if( managers.length === 1 && managers[0].userId === userId ) {
    removeManageAlert.show();
  }
  else {
    permissionStore.removeBucketUser(props.bucketId, userId);
  }
};

const updateBucketPermission = (value: boolean, userId: string, permCode: string) => {
  if (value) {
    permissionStore.addBucketPermission(props.bucketId, userId, permCode);
  } else {
    const managers = getMappedBucketToUserPermissions.value.filter( (x: UserPermissions) => x.manage );

    // Disallow removable of final MANAGE permission
    if( permCode === Permissions.MANAGE && !managers.length ) {
      removeManageAlert.show();

      // Set the value back as clicking will automatically change it
      const perm: UserPermissions = getMappedBucketToUserPermissions.value
        .find( (x: UserPermissions) => x.userId === userId ) as UserPermissions;
      perm.manage = true;
    }
    else {
      permissionStore.deleteBucketPermission(props.bucketId, userId, permCode);
    }
  }
};

onBeforeMount( async () => {
  await permissionStore.fetchBucketPermissions({ bucketId: props.bucketId });
  await permissionStore.mapBucketToUserPermissions(props.bucketId);
});
</script>

<template>
  <div>
    <div v-if="!showSearchUsers">
      <Button
        class="mt-1 mb-4"
        @click="showSearchUsers = true"
      >
        <font-awesome-icon
          icon="fa-solid fa-user-plus"
          class="mr-1"
        /> Add user
      </Button>
    </div>
    <div v-else>
      <BucketPermissionAddUser
        @cancel-search-users="cancelSearchUsers"
      />
    </div>

    <DataTable
      :value="getMappedBucketToUserPermissions"
      data-key="bucketId"
      class="p-datatable-sm"
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="fullName"
      :sort-order="1"
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
        field="idpName"
        header="Provider"
      />
      <Column
        header="Upload"
        header-class="header-center"
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
        header-class="header-center"
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
        header-class="header-center"
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
        header-class="header-center"
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
        header-class="header-center"
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
            severity="danger"
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
:deep(.p-button.p-button-lg) {
  padding: 0;
  margin-left: 1rem;
}
</style>
