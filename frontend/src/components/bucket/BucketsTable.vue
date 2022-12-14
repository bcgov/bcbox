<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import BucketPermission from './BucketPermission.vue';
import { useBucketStore } from '@/store';
import { RouteNames } from '@/utils/constants';

const { loading, buckets } = storeToRefs(useBucketStore());

const permissionsVisible = ref(false);
const permissionsBucketId = ref('');
const permissionBucketName = ref('');

const emit = defineEmits(['show-info']);

const showInfo = async (id: number) => {
  emit('show-info', id);
};

const showPermissions = async (bucketId: string, bucketName: string) => {
  permissionsVisible.value = true;
  permissionsBucketId.value = bucketId;
  permissionBucketName.value = bucketName;
};
</script>

<template>
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
      field="name"
      header="Bucket Name"
      body-class="truncate"
    >
      <template #body="{ data }">
        <div
          v-if="data.bucketName.length > 150"
          v-tooltip.bottom="{ value: data.bucketName }"
        >
          <router-link :to="{ name: RouteNames.ListObjects, query: { bucketId: data.bucketId } }">
            {{ data.bucketName }}
          </router-link>
        </div>
        <div v-else>
          <router-link :to="{ name: RouteNames.ListObjects, query: { bucketId: data.bucketId } }">
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
          class="p-button-lg p-button-rounded p-button-text"
          @click="showPermissions(data.bucketId, data.bucketName)"
        >
          <font-awesome-icon icon="fa-solid fa-gear" />
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

  <Dialog
    v-model:visible="permissionsVisible"
    :draggable="false"
    :modal="true"
  >
    <template #header>
      <div class="flex">
        <font-awesome-icon
          icon="fa-solid fa-gear"
          class="pr-2"
          style="font-size: 2rem"
        />
        <div>
          <h1>Bucket Permissions</h1>
          <h3>{{ permissionBucketName }}</h3>
        </div>
      </div>
    </template>

    <BucketPermission :bucket-id="permissionsBucketId" />
  </Dialog>
</template>
