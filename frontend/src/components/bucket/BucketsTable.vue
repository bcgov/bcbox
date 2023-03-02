<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import { ref } from 'vue';

import BucketPermission from './BucketPermission.vue';
import { useBucketStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';

import type { Bucket, Permission } from '@/interfaces';

const { loading, buckets } = storeToRefs(useBucketStore());

const permissionsVisible = ref(false);
const permissionsBucketId = ref('');
const permissionBucketName = ref('');

const emit = defineEmits(['show-bucket-config', 'show-info']);

const showInfo = async (id: number) => {
  emit('show-info', id);
};

const showBucketConfig = async (bucket: Bucket) => {
  emit('show-bucket-config', bucket);
};

const showPermissions = async (bucketId: string, bucketName: string) => {
  permissionsVisible.value = true;
  permissionsBucketId.value = bucketId;
  permissionBucketName.value = bucketName;
};

const displayPermissionsIcon = (bucket: Bucket) => {
  return bucket.userPermissions?.find( (x: Permission) => x.permCode === Permissions.MANAGE);
};
</script>

<template>
  <div>
    <DataTable
      :loading="loading"
      :value="buckets"
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
          v-if="!loading"
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
            class="p-button-lg p-button-text"
            @click="showBucketConfig(data)"
          >
            <font-awesome-icon icon="fas fa-cog" />
          </Button>
          <Button
            v-if="displayPermissionsIcon(data)"
            class="p-button-lg p-button-text"
            @click="showPermissions(data.bucketId, data.bucketName)"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <Button
            class="p-button-lg p-button-rounded p-button-text"
            @click="showInfo(data.bucketId)"
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
