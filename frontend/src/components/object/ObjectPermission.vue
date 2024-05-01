<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { ObjectPermissionAddUser, ObjectPublicToggle } from '@/components/object';
import { Button, Checkbox, Column, DataTable } from '@/lib/primevue';
import { useAuthStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const { getMappedObjectToUserPermissions } = storeToRefs(permissionStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const showSearchUsers: Ref<boolean> = ref(false);
const object: Ref<COMSObject | undefined> = ref(undefined);

// Actions
const cancelSearchUsers = () => {
  showSearchUsers.value = false;
};

const removeObjectUser = (userId: string) => {
  permissionStore.removeObjectUser(props.objectId, userId);
};

const updateObjectPermission = (value: boolean, userId: string, permCode: string) => {
  if (value) {
    permissionStore.addObjectPermission(props.objectId, userId, permCode);
  } else {
    permissionStore.deleteObjectPermission(props.objectId, userId, permCode);
  }
};

onBeforeMount(() => {
  permissionStore.mapObjectToUserPermissions(props.objectId);
  object.value = objectStore.getObject(props.objectId);
});
</script>

<template>
  <div>
    <div class="flex flex-row gap-6 pb-3">
      <div>
        <h3 class="pb-1">Public</h3>
        <ul>
          <li>This option toggles the file to be publicly available and accessible to anyone</li>
          <li>To instead set explicit permissions, add users and use the options below</li>
        </ul>
      </div>
      <ObjectPublicToggle
        v-if="object && getUserId"
        class="ml-4"
        :bucket-id="object.bucketId"
        :object-id="object.id"
        :object-public="object.public"
        :user-id="getUserId"
      />
    </div>

    <h3 class="mt-1 mb-2">User Permissions</h3>

    <div v-if="!showSearchUsers">
      <Button
        class="mt-1 mb-4"
        @click="showSearchUsers = true"
      >
        <font-awesome-icon
          icon="fa-solid fa-user-plus"
          class="mr-1"
        />
        Add user
      </Button>
    </div>
    <div v-else>
      <ObjectPermissionAddUser @cancel-search-users="cancelSearchUsers" />
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
            @update:model-value="(value:boolean) => updateObjectPermission(value, data.userId, Permissions.READ)"
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
            @update:model-value="(value:boolean) => updateObjectPermission(value, data.userId, Permissions.UPDATE)"
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
            @update:model-value="(value:boolean) => updateObjectPermission(value, data.userId, Permissions.DELETE)"
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
            @update:model-value="(value:boolean) => updateObjectPermission(value, data.userId, Permissions.MANAGE)"
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
