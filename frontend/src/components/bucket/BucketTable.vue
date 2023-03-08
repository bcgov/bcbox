<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import BucketPermission from '@/components/bucket/BucketPermission.vue';
import { Button, Column, DataTable, Dialog } from '@/lib/primevue';
import { useAppStore, useAuthStore, useBucketStore, usePermissionStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Store
const permissionStore = usePermissionStore();
const { getIsLoading } = storeToRefs(useAppStore());
const { getUserId } = storeToRefs(useAuthStore());
const { getBuckets } = storeToRefs(useBucketStore());

// State
const permissionsVisible: Ref<boolean> = ref(false);
const permissionsBucketId: Ref<string> = ref('');
const permissionBucketName: Ref<string> = ref('');

const emit = defineEmits(['show-bucket-config', 'show-sidebar-info']);

// Functions
const showSidebarInfo = async (id: number) => {
  emit('show-sidebar-info', id);
};

const showBucketConfig = async (bucket: Bucket) => {
  emit('show-bucket-config', bucket);
};

const showPermissions = async (bucketId: string, bucketName: string) => {
  permissionsVisible.value = true;
  permissionsBucketId.value = bucketId;
  permissionBucketName.value = bucketName;
};

const checkUserManageBucket = (bucket: Bucket) => {
  return permissionStore.isBucketActionAllowed(bucket.bucketId, getUserId.value, Permissions.MANAGE );
};
</script>

<template>
  <div>
    <DataTable
      :loading="getIsLoading"
      :value="getBuckets"
      data-key="bucketId"
      class="p-datatable-sm"
      striped-rows
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="bucketName"
      :sort-order="1"
    >
      <template #empty>
        <div
          v-if="!getIsLoading"
          class="flex justify-content-center"
        >
          <h3>There are no buckets associated with your account.</h3>
        </div>
      </template>
      <Column header-style="width: 1%">
        <template #body>
          <font-awesome-icon icon="fa-solid fa-box-open" />
        </template>
      </Column>
      <Column
        field="bucketName"
        header="Bucket Name"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div
            v-if="data.bucketName.length > 150"
            v-tooltip.bottom="{ value: data.bucketName }"
          >
            <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: data.bucketId } }">
              {{ data.bucketName }}
            </router-link>
          </div>
          <div v-else>
            <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: data.bucketId } }">
              {{ data.bucketName }}
            </router-link>
          </div>
        </template>
      </Column>
      <Column
        header="Actions"
        header-style="width: 200px"
        header-class="header-right"
        body-class="content-right action-buttons"
      >
        <template #body="{ data }">
          <Button
            v-if="checkUserManageBucket(data)"
            class="p-button-lg p-button-text"
            @click="showBucketConfig(data)"
          >
            <font-awesome-icon icon="fas fa-cog" />
          </Button>
          <Button
            v-if="checkUserManageBucket(data)"
            class="p-button-lg p-button-text"
            @click="showPermissions(data.bucketId, data.bucketName)"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <Button
            class="p-button-lg p-button-rounded p-button-text"
            @click="showSidebarInfo(data.bucketId)"
          >
            <font-awesome-icon icon="fa-solid fa-circle-info" />
          </Button>
        </template>
      </Column>
    </DataTable>

    <!-- eslint-disable vue/no-v-model-argument -->
    <Dialog
      v-model:visible="permissionsVisible"
      :draggable="false"
      :modal="true"
      class="bcbox-info-dialog permissions-modal"
    >
      <!-- eslint-enable vue/no-v-model-argument -->
      <template #header>
        <font-awesome-icon
          icon="fas fa-users"
          fixed-width
        />
        <span class="p-dialog-title">Bucket Permissions</span>
      </template>

      <h3 class="bcbox-info-dialog-subhead">
        {{ permissionBucketName }}
      </h3>

      <BucketPermission :bucket-id="permissionsBucketId" />
    </Dialog>
  </div>
</template>
