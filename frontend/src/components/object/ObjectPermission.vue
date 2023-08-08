<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import ObjectPermissionAddUser from '@/components/object/ObjectPermissionAddUser.vue';
import { useAlert } from '@/composables/useAlert';
import { Button, Checkbox, Column, DataTable } from '@/lib/primevue';
import { usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { UserPermissions } from '@/types';

// Props
type Props = {
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();
const { getMappedObjectToUserPermissions } = storeToRefs(permissionStore);

// State
const showSearchUsers: Ref<boolean> = ref(false);

// Actions
const removeManageAlert = useAlert('Warning', 'Cannot remove last user with MANAGE permission.');

const cancelSearchUsers = () => {
  showSearchUsers.value = false;
};

const removeObjectUser = (userId: string) => {
  const managers = getMappedObjectToUserPermissions.value.filter( (x: UserPermissions) => x.manage );
  if( managers.length === 1 && managers[0].userId === userId ) {
    removeManageAlert.show();
  }
  else {
    permissionStore.removeObjectUser(props.objectId, userId);
  }
};

const updateObjectPermission = (value: boolean, userId: string, permCode: string) => {
  if (value) {
    permissionStore.addObjectPermission(props.objectId, userId, permCode);
  }
  else {
    const managers = getMappedObjectToUserPermissions.value.filter( (x: UserPermissions) => x.manage );

    const userPerms: UserPermissions = getMappedObjectToUserPermissions.value
      .find( (x: UserPermissions) => x.userId === userId ) as UserPermissions;

    // When READ is unticked check if they are the last remaining user with MANAGE
    const lastManager = () => permCode === Permissions.READ && managers.length === 1 && userPerms.manage;

    // Due to 2-way binding we check if there are no managers left when MANAGE is unticked
    const noManagers = () => permCode === Permissions.MANAGE && !managers.length;

    // Disallow removable of final MANAGE permission
    if( lastManager() || noManagers() ) {
      removeManageAlert.show();

      if( permCode === Permissions.READ ) userPerms.read = true;
      if( permCode === Permissions.MANAGE ) userPerms.manage = true;
    }
    else {
      permissionStore.deleteObjectPermission(props.objectId, userId, permCode);
    }
  }
};

onBeforeMount(() => {
  permissionStore.mapObjectToUserPermissions(props.objectId);
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
      <ObjectPermissionAddUser
        @cancel-search-users="cancelSearchUsers"
      />
    </div>

    <DataTable
      :value="getMappedObjectToUserPermissions"
      data-key="userId"
      class="p-datatable-sm"
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink"
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="fullName"
      :sort-order="1"
    >
      <template #empty>
        <div class="flex justify-content-center">
          <h3>There are no users associated with this object.</h3>
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
        header="Read"
        header-class="header-center"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.read"
            input-id="read"
            :binary="true"
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.READ)"
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
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.UPDATE)"
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
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.DELETE)"
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
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.MANAGE)"
          />
        </template>
      </Column>
      <Column header="Remove">
        <template #body="{ data }">
          <Button
            class="p-button-lg p-button-text"
            severity="danger"
            @click="removeObjectUser(data.userId)"
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
