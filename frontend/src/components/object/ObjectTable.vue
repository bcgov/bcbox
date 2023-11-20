<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onUnmounted, ref, watch } from 'vue';

import { Spinner } from '@/components/layout';
import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectFilters,
  ObjectPermission,
  ObjectPublicToggle
} from '@/components/object';
import { SyncButton } from '@/components/common';
import { ShareObjectButton } from '@/components/object/share';
import { Button, Column, DataTable, Dialog, FilterMatchMode, InputText, useToast } from '@/lib/primevue';
import { useAuthStore, useAppStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

type COMSObjectDataSource = {
  lastUpdatedDate?: string;
} & COMSObject;

// Props
type Props = {
  bucketId?: string;
  objectInfoId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined,
  objectInfoId: undefined
});

// Emits
const emit = defineEmits(['show-object-info']);

// Store
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const { getObjects } = storeToRefs(objectStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const permissionsVisible = ref(false);
const permissionsObjectId = ref('');
const permissionsObjectName: Ref<string | undefined> = ref('');
const tableData: Ref<Array<COMSObjectDataSource>> = ref([]);

// Actions
const toast = useToast();

const formatShortUuid = (uuid: string) => {
  return uuid?.slice(0, 8) ?? uuid;
};

const showInfo = async (id: string) => {
  emit('show-object-info', id);
};

const showPermissions = async (objectId: string) => {
  await permissionStore.fetchObjectPermissions({ objectId });

  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = objectStore.findObjectById(objectId)?.name;
};

function onDeletedSuccess() {
  toast.success('File deleted');
}

watch(getObjects, async () => {
  // Filter object cache to this specific bucket
  const objs: Array<COMSObjectDataSource> = getObjects.value.filter(
    (x: COMSObject) => x.bucketId === props.bucketId
  ) as COMSObjectDataSource[];

  tableData.value = objs.map((x: COMSObjectDataSource) => {
    x.lastUpdatedDate = x.updatedAt ?? x.createdAt;
    return x;
  });
});

// Clear selections when navigating away
onUnmounted(() => {
  objectStore.setSelectedObjects([]);
});

// Datatable filter(s)
const filters = ref({
  // Need this till PrimeVue gets it together to un-break this again
  // TODO: Revisit with PrimeVue 2.37+
  // @ts-ignore
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
</script>

<template>
  <div class="object-table">
    <DataTable
      v-model:selection="objectStore.selectedObjects"
      v-model:filters="filters"
      :loading="useAppStore().getIsLoading"
      :value="tableData"
      data-key="id"
      class="p-datatable-sm"
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="lastUpdatedDate"
      :sort-order="-1"
      :global-filter-fields="['name']"
    >
      <template #header>
        <div class="flex justify-content-end">
          <ObjectFilters :bucket-id="props.bucketId" />

          <span class="p-input-icon-left ml-4">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              class="searchInput"
              placeholder="Search File Names"
            />
            <Button
              v-show="filters['global'].value !== null"
              v-tooltip.bottom="'Clear'"
              class="ml-2 p-input-icon-clear-right"
              icon="pi pi-times"
              outlined
              aria-label="Clear"
              @click="filters['global'].value = null"
            />
          </span>

          <Button
            v-tooltip.bottom="'Refresh'"
            class="ml-2"
            icon="pi pi-refresh"
            outlined
            rounded
            aria-label="Filter"
            @click="objectStore.fetchObjects({ bucketId: props.bucketId, userId: getUserId, bucketPerms: true })"
          />
        </div>
      </template>
      <template #empty>
        <div
          v-if="!useAppStore().getIsLoading"
          class="flex justify-content-center"
        >
          <h4>There are no objects associated with your account in this bucket.</h4>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>
      <Column
        selection-mode="multiple"
        header-style="width: 3rem"
      />
      <Column
        field="name"
        :sortable="true"
        header="Name"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div v-tooltip.bottom="{ value: data.name }">
            {{ data.name }}
          </div>
        </template>
      </Column>
      <Column
        field="id"
        :sortable="true"
        header="Object ID"
        style="width: 150px"
      >
        <template #body="{ data }">
          <div v-tooltip.bottom="{ value: data.id }">
            {{ formatShortUuid(data.id) }}
          </div>
        </template>
      </Column>
      <Column
        field="lastUpdatedDate"
        header="Updated date"
        style="width: 300px"
        :sortable="true"
        :hidden="props.objectInfoId ? true : false"
      >
        <template #body="{ data }">
          {{ formatDateLong(data.lastUpdatedDate) }}
        </template>
      </Column>
      <Column
        field="publicSharing"
        header="Public"
        style="width: 100px"
      >
        <template #body="{ data }">
          <ObjectPublicToggle
            v-if="props.bucketId && getUserId"
            :bucket-id="props.bucketId"
            :object-id="data.id"
            :object-public="data.public"
            :user-id="getUserId"
          />
        </template>
      </Column>
      <Column
        header="Actions"
        style="width: 250px"
        header-class="header-right flex justify-content-end"
        body-class="content-right action-buttons justify-content-end"
      >
        <template #body="{ data }">
          <ShareObjectButton :id="data.id" />
          <DownloadObjectButton
            v-if="
              data.public ||
              permissionStore.isObjectActionAllowed(data.id, getUserId, Permissions.READ, props.bucketId as string)
            "
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
          />
          <Button
            v-if="
              permissionStore.isObjectActionAllowed(data.id, getUserId, Permissions.MANAGE, props.bucketId as string)
            "
            v-tooltip.bottom="'Object permissions'"
            class="p-button-lg p-button-text"
            aria-label="Object permissions"
            @click="showPermissions(data.id)"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <SyncButton
            label-text="Synchronize file"
            :object-id="data.id"
          />
          <Button
            v-if="
              data.public ||
              permissionStore.isObjectActionAllowed(data.id, getUserId, Permissions.READ, props.bucketId as string)
            "
            v-tooltip.bottom="'Object details'"
            class="p-button-lg p-button-rounded p-button-text"
            aria-label="Object details"
            @click="showInfo(data.id)"
          >
            <font-awesome-icon icon="fa-solid fa-circle-info" />
          </Button>
          <DeleteObjectButton
            v-if="
              permissionStore.isObjectActionAllowed(data.id, getUserId, Permissions.DELETE, props.bucketId as string)
            "
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
            @on-deleted-success="onDeletedSuccess"
          />
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
        <span class="p-dialog-title">Object Permissions</span>
      </template>

      <h3 class="bcbox-info-dialog-subhead">
        {{ permissionsObjectName }}
      </h3>

      <ObjectPermission :object-id="permissionsObjectId" />
    </Dialog>
  </div>
</template>
<style lang="scss" scoped>
:deep(.searchInput.p-inputtext) {
  padding-right: 2.5rem;
}
</style>
