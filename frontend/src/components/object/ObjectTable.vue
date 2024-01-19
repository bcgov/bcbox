<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onUnmounted, onMounted, ref } from 'vue';

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
import { useAuthStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';
import { objectService } from '@/services';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

type COMSObjectDataSource = {
  lastUpdatedDate?: string;
} & COMSObject;

type DataTableObjectSource = {
  [key: string]: any;
};

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
const { getUserId } = storeToRefs(useAuthStore());

// State
const selectAll = ref(false);
const permissionsVisible = ref(false);
const permissionsObjectId = ref('');
const permissionsObjectName: Ref<string | undefined> = ref('');
const tableData: Ref<Array<COMSObjectDataSource>> = ref([]);

const loading = ref(false);
const lazyParams: Ref<DataTableObjectSource> = ref({});
const totalRecords = ref(0);
const first = ref(0);
const selectedObjects: any = ref();

// Actions
const toast = useToast();

function clearSelected() {
  selectAll.value = false;
  objectStore.setSelectedObjects([]);
}

const formatShortUuid = (uuid: string) => uuid?.slice(0, 8) ?? uuid;
const onDeletedSuccess = () => {
  toast.success('File deleted');
  loadLazyData();
};

function selectCurrentPage() {
  objectStore.setSelectedObjects(
    tableData.value.filter((object) => {
      return Array.from(document.querySelectorAll('[data-objectId]'))
        .map((x) => x.getAttribute('data-objectId'))
        .includes(object.id);
    })
  );
}

const showInfo = (id: string) => emit('show-object-info', id);

async function showPermissions(objectId: string) {
  await permissionStore.fetchObjectPermissions({ objectId });

  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = objectStore.findObjectById(objectId)?.name;
}
onMounted(() => {
  loading.value = true;
  lazyParams.value = {
    first: 0,
    rows: 10,
    sortField: null,
    sortOrder: null,
    filters: filters.value
  };
  loadLazyData();
});

const loadLazyData = (event?: any) => {
  lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };
  objectService
    .searchObjects({
      bucketId: props.bucketId ? [props.bucketId] : undefined,
      deleteMarker: false,
      latest: true,
      permissions: true,
      page: lazyParams.value.page ? lazyParams.value.page + 1 : 1,
      limit: lazyParams.value.rows
    })
    .then((r: any) => {
      tableData.value = r.data;
      totalRecords.value = +r?.headers['x-total-rows'];
      loading.value = false;
    });
};
const onPage = (event: any) => {
  lazyParams.value = event;
  loadLazyData(event);
};
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
      v-model:selection="selectedObjects"
      v-model:filters="filters"
      lazy
      :loading="loading"
      v-model:value="tableData"
      :total-records="totalRecords"
      data-key="id"
      class="p-datatable-sm"
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="lastUpdatedDate"
      :sort-order="-1"
      :global-filter-fields="['name']"
      :select-all="selectAll"
      @select-all-change="
        (e) => {
          selectAll = e.checked;
          if (e.checked) {
            selectCurrentPage();
          } else {
            objectStore.setSelectedObjects([]);
          }
        }
      "
      @page="onPage($event)"
      @update:sort-order="clearSelected"
      @update:sort-field="clearSelected"
      @update:rows="clearSelected"
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
              @input="clearSelected()"
            />
            <Button
              v-show="filters['global'].value !== null"
              v-tooltip.bottom="'Clear'"
              class="ml-2 p-input-icon-clear-right"
              icon="pi pi-times"
              outlined
              aria-label="Clear"
              @click="
                () => {
                  filters['global'].value = null;
                  clearSelected();
                }
              "
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
          v-if="!loading"
          class="flex justify-content-center"
        >
          <h3>There are no objects associated with your account in this bucket.</h3>
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
        header-style="min-width: 25%"
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
          <div
            v-tooltip.bottom="{ value: data.id }"
            :data-objectId="data.id"
          >
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
          {{ formatDateLong(data.updatedAt ?? data.createdAt) }}
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
        header-style="min-width: 270px"
        header-class="header-right"
        body-class="action-buttons"
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
      class="bcbox-info-dialog"
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
