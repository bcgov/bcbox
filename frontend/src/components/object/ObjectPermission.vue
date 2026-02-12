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
const { getMappedObjectAndBucketToUserPermissions } = storeToRefs(permissionStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const showSearchUsers: Ref<boolean> = ref(false);
const object: Ref<COMSObject | undefined> = computed(() => {
  return objectStore.getObject(props.objectId);
});

// combine bucket and object permissions, showing bucket permissions as disabled when they apply
const aggregatePermissionData = computed(() => {
  const data = getMappedObjectAndBucketToUserPermissions.value;
  const PERMS = ['create', 'read', 'update', 'delete', 'manage'];
  const transform = (data: any[]) =>
    Object.values(
      data.reduce((acc, item) => {
        const baseUser = acc[item.userId] ?? {
          idpName: item.idpName,
          elevatedRights: item.elevatedRights,
          fullName: item.fullName,
          resource: 'object',
          userId: item.userId,
          ...Object.fromEntries(PERMS.map((p) => [p, { value: false, disabled: false }]))
        };

        const nextPerms = Object.fromEntries(
          PERMS.map((p) => {
            const current = baseUser[p];
            // If bucket exists AND permission is true → override + disable
            if (item.resource === 'bucket' && item[p] === true) {
              return [p, { value: true, disabled: true }];
            }
            // If we haven't already disabled it, use file value when present
            if (!current.disabled && item.resource === 'object') {
              return [p, { value: item[p], disabled: false }];
            }
            // Otherwise keep what we already have
            return [p, current];
          })
        );
        return {
          ...acc,
          [item.userId]: { ...baseUser, ...nextPerms }
        };
      }, {})
    );
  return transform(data);
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
  if (object.value) permissionStore.mapBucketToUserPermissions(object.value.bucketId);
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

      <h3 class="my-2">User Permissions</h3>

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
        :value="aggregatePermissionData"
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
            <span
              v-tooltip="
                data.read.disabled ? 'This permission is inherited from the folder and cannot be changed here' : ''
              "
            >
              <Checkbox
                v-model="data.read.value"
                input-id="read"
                aria-label="read"
                :binary="true"
                :disabled="data.read.value"
                @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.READ)"
              />
            </span>
          </template>
        </Column>
        <Column
          header="Update"
          header-class="header-center"
          body-class="content-center"
        >
          <template #body="{ data }">
            <span
              v-tooltip="
                data.update.disabled ? 'This permission is inherited from the folder and cannot be changed here' : ''
              "
            >
              <Checkbox
                v-model="data.update.value"
                :disabled="data.update.disabled"
                input-id="update"
                aria-label="update"
                :binary="true"
                @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.UPDATE)"
              />
            </span>
          </template>
        </Column>
        <Column
          header="Delete"
          header-class="header-center"
          body-class="content-center"
        >
          <template #body="{ data }">
            <span
              v-tooltip="
                data.delete.disabled ? 'This permission is inherited from the folder and cannot be changed here' : ''
              "
            >
              <Checkbox
                v-model="data.delete.value"
                :disabled="data.delete.disabled"
                input-id="delete"
                aria-label="delete"
                :binary="true"
                @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.DELETE)"
              />
            </span>
          </template>
        </Column>
        <Column
          header="Manage"
          header-class="header-center"
          body-class="content-center"
        >
          <template #body="{ data }">
            <span
              v-tooltip="
                data.manage.disabled ? 'This permission is inherited from the folder and cannot be changed here' : ''
              "
            >
              <Checkbox
                v-model="data.manage.value"
                :disabled="data.manage.disabled"
                input-id="manage"
                aria-label="manage"
                :binary="true"
                @update:model-value="(value: boolean) => updateObjectPermission(value, data.userId, Permissions.MANAGE)"
              />
            </span>
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
.p-tabview {
  margin-top: 1rem;
}
:deep(.p-tabview-panels) {
  .p-tabview-panel {
    padding-top: 1rem;
  }
  padding-left: 0;
}
:deep(.p-button.p-button-lg) {
  padding: 0;
  margin-left: 1rem;
}
</style>
