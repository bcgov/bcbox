<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import BucketPublicToggle from '@/components/bucket/BucketPublicToggle.vue';
import BucketPermissionAddUser from '@/components/bucket/BucketPermissionAddUser.vue';
import { BulkPermission } from '@/components/common';
import { useAlert } from '@/composables/useAlert';
import { Button, Checkbox, Column, DataTable, Message, TabPanel, TabView } from '@/lib/primevue';

import { useAuthStore, useBucketStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket, UserPermissions } from '@/types';

// Props
type Props = {
  bucketId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();
const bucketStore = useBucketStore();
const { getMappedBucketToUserPermissions } = storeToRefs(permissionStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const showSearchUsers: Ref<boolean> = ref(false);
const bucket: Ref<Bucket | undefined> = computed(() => {
  return bucketStore.getBucket(props.bucketId);
});

// Actions
const removeManageAlert = useAlert('Warning', 'Cannot remove last user with MANAGE permission.');

const cancelSearchUsers = () => {
  showSearchUsers.value = false;
};

const removeBucketUser = (userId: string) => {
  const managers = getMappedBucketToUserPermissions.value.filter((x: UserPermissions) => x.manage);
  if (managers.length === 1 && managers[0].userId === userId) {
    removeManageAlert.show();
  } else {
    permissionStore.removeBucketUser(props.bucketId, userId);
  }
};

const updateBucketPermission = (value: boolean, userId: string, permCode: string) => {
  if (value) {
    permissionStore.addBucketPermission(props.bucketId, userId, permCode);
  } else {
    const managers = getMappedBucketToUserPermissions.value.filter((x: UserPermissions) => x.manage);

    // Disallow removable of final MANAGE permission
    if (permCode === Permissions.MANAGE && !managers.length) {
      removeManageAlert.show();

      // Set the value back as clicking will automatically change it
      const perm: UserPermissions = getMappedBucketToUserPermissions.value.find(
        (x: UserPermissions) => x.userId === userId
      ) as UserPermissions;
      perm.manage = true;
    } else {
      permissionStore.deleteBucketPermission(props.bucketId, userId, permCode);
    }
  }
};

onBeforeMount(async () => {
  // TODO: check for any permissions on parent bucket
  // transform tale data to prevent overriding parent
  await permissionStore.fetchBucketPermissions({ bucketId: props.bucketId });
  await permissionStore.mapBucketToUserPermissions(props.bucketId);
});
</script>

<template>
  <TabView>
    <TabPanel header="Manage permissions">
      <!-- public toggle -->
      <div class="flex pb-3">
        <div class="flex-grow-1">
          <div class="pb-1">
            <h3>Set to public</h3>
            <p>
              Making a folder
              <strong>public</strong>
              means that all files within it, including those in any subfolders, can be accessed by anyone without
              requiring authentication.
            </p>
          </div>
        </div>
        <BucketPublicToggle
          v-if="bucket && getUserId"
          class="flex flex-none"
          :bucket-id="bucket.bucketId"
          :bucket-name="bucket.bucketName"
          :bucket-public="bucket.public"
          :user-id="getUserId"
        />
      </div>
      <h3>User Permissions</h3>
      <!-- user search -->
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
        <BucketPermissionAddUser @cancel-search-users="cancelSearchUsers" />
      </div>
      <Message
        v-if="getMappedBucketToUserPermissions.length"
        severity="info"
        class="mb-4"
        size="small"
      >
        Permission changes apply to all sub-folders and files.
      </Message>

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
        aria-label="Bucket Permissions"
      >
        <template #empty>
          <div class="flex justify-content-center">
            <h3>There are no users associated with this bucket.</h3>
          </div>
        </template>
        <Column
          field="fullName"
          header="Name"
          aria-labelledby="upload_checkbox"
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
              aria-label="upload"
              :binary="true"
              @update:model-value="(value: boolean) => updateBucketPermission(value, data.userId, Permissions.CREATE)"
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
              aria-label="Read"
              :binary="true"
              @update:model-value="(value: boolean) => updateBucketPermission(value, data.userId, Permissions.READ)"
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
              aria-label="Update"
              :binary="true"
              @update:model-value="(value: boolean) => updateBucketPermission(value, data.userId, Permissions.UPDATE)"
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
              @update:model-value="(value: boolean) => updateBucketPermission(value, data.userId, Permissions.DELETE)"
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
              :disabled="!data.elevatedRights"
              @update:model-value="(value: boolean) => updateBucketPermission(value, data.userId, Permissions.MANAGE)"
            />
          </template>
        </Column>
        <Column header="Remove">
          <template #body="{ data }">
            <Button
              class="p-button-lg p-button-text"
              severity="danger"
              aria-label="remove"
              @click="removeBucketUser(data.userId)"
            >
              <font-awesome-icon icon="fa-solid fa-user-xmark" />
            </Button>
          </template>
        </Column>
      </DataTable>
    </TabPanel>
    <TabPanel header="Bulk add/remove">
      <BulkPermission
        resource-type="bucket"
        :resource="bucket"
      />
    </TabPanel>
  </TabView>
</template>

<style lang="scss" scoped>
:deep(.p-message-wrapper) {
  padding: 0.5rem;
}
:deep(.p-button.p-button-lg) {
  padding: 0;
  margin-left: 1rem;
}

.p-tabview {
  margin-top: 1rem;
}
:deep(.p-tabview-panels) {
  padding-left: 0;
  .p-tabview-panel {
    padding-top: 1rem;
  }
}
</style>
