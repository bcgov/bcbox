<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { ObjectPermissionAddUser, ObjectPublicToggle } from '@/components/object';
import { BulkPermission } from '@/components/common';
import { Button, Checkbox, Column, DataTable, TabPanel, TabView } from '@/lib/primevue';

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
const object: Ref<COMSObject | undefined> = computed(() => {
  return objectStore.getObject(props.objectId);
});

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
});
</script>

<template>
  <TabView>
    <TabPanel header="Manage permissions">
      <div class="flex flex-row pb-3">
        <div class="flex-grow-1">
          <h3 class="pb-1">Set to public</h3>
          <p>
            Setting a file to
            <strong>public</strong>
            allows anyone to access it without needing to authenticate.
          </p>
        </div>
        <ObjectPublicToggle
          v-if="object && getUserId"
          class=""
          :bucket-id="object.bucketId"
          :object-id="object.id"
          :object-name="object.name"
          :object-public="object.public"
          :user-id="getUserId"
        />
      </div>

      <h3 class="mt-1 mb-2">User Permissions</h3>

      <div v-if="!showSearchUsers">
        <Button
          class="mt-1 mb-4"
          @click="showSearchUsers = true"
          @keyup.enter="showSearchUsers = true"
        >
          <font-awesome-icon
            icon="fa-solid fa-user-plus"
            class="mr-1"
          />
          Add user
        </Button>
      </div>
      <div v-else>
        <ObjectPermissionAddUser
          :object-id="object?.id!"
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
        aria-label="File Permissions"
        :sort-order="1"
      >
        <template #empty>
          <div class="flex justify-content-center">
            <div>
              <h3>There are no users associated specifically with this file.</h3>
              <span>Permissions at the folder level still apply but aren't shown here.</span>
            </div>
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
              aria-label="read"
              :binary="true"
              :disabled="data.read"
              @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.READ)"
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
              aria-label="update"
              :binary="true"
              @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.UPDATE)"
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
              aria-label="delete"
              :binary="true"
              @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.DELETE)"
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
              aria-label="manage"
              :binary="true"
              @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.MANAGE)"
            />
          </template>
        </Column>
        <Column header="Remove">
          <template #body="{ data }">
            <Button
              class="p-button-lg p-button-text"
              severity="danger"
              aria-label="remove"
              @click="removeObjectUser(data.userId)"
              @keyup.enter="removeObjectUser(data.userId)"
            >
              <font-awesome-icon icon="fa-solid fa-user-xmark" />
            </Button>
          </template>
        </Column>
      </DataTable>
    </TabPanel>
    <TabPanel header="Bulk add/remove">
      <BulkPermission
        resource-type="object"
        :resource="object"
      />
    </TabPanel>
  </TabView>
</template>

<style lang="scss" scoped>
:deep(.p-button.p-button-lg) {
  padding: 0;
  margin-left: 1rem;
}
</style>
