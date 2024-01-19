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
const dt = ref();
const loading = ref(false);
const lazyParams: Ref<DataTableObjectSource> = ref({});
const totalRecords = ref(0);
const first = ref(0);
const selectedObjects: any = ref();
const filters = ref({
  name: { value: undefined, matchMode: 'contains' },
  tags: { value: undefined, matchMode: 'contains' },
  meta: { value: undefined, matchMode: 'contains' }
});

const loading = ref(false);
const lazyParams: Ref<DataTableObjectSource> = ref({});
const totalRecords = ref(0);
const first = ref(0);
const selectedObjects: any = ref();

// Actions
const toast = useToast();
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
    rows: dt.value.rows,
    sortField: 'updatedAt',
    page: dt.value.page,
    sortOrder: 'desc',
    filters: filters
  };
  loadLazyData();
});

const loadLazyData = (event?: any) => {
  lazyParams.value = { ...lazyParams.value, first: event?.first || first.value, page: event?.page || 0 };
  objectService
    .searchObjects(
      {
        bucketId: props.bucketId ? [props.bucketId] : undefined,
        deleteMarker: false,
        latest: true,
        permissions: true,
        page: lazyParams.value?.page ? ++lazyParams.value.page : 1,
        name: lazyParams.value?.filters?.name.value,
        limit: lazyParams.value.rows,
        sort: lazyParams.value.sortField,
        order: lazyParams.value.sortOrder === 1 ? 'asc' : 'desc',
        tagset: lazyParams.value?.filters?.tags.value
      },
      lazyParams.value?.filters?.meta.value //Header
    )
    .then((r: any) => {
      tableData.value = r.data;
      totalRecords.value = +r?.headers['x-total-rows'];
      loading.value = false;
    });
};
const onPage = (event?: any) => {
  lazyParams.value = event;
  loadLazyData(event);
};
const onSort = (event?: any) => {
  lazyParams.value = event;
  loadLazyData(event);
};
const onFilter = (event?: any) => {
  lazyParams.value.filters = filters;
  // Seems to be a bug as current page is not being reset when filter trigger
  dt.value.resetPage();
  loadLazyData(event);
};
// Clear selections when navigating away
onUnmounted(() => {
  objectStore.setSelectedObjects([]);
});

const selectedFilters = (payload: any) => {
  filters.value.meta.value = payload.metaToSearch
    .flatMap((o: any) => {
      return { [o.key]: o.value };
    })
    .reduce((r: any, c: any) => {
      const key = Object.keys(c)[0];
      const value = c[key];
      r['x-amz-meta-' + key] = value;
      return r;
    }, {});
  filters.value.tags.value = payload.tagSetToSearch
    .flatMap((o: any) => {
      return { [o.key]: o.value };
    })
    .reduce((r: any, c: any) => {
      const key = Object.keys(c)[0];
      const value = c[key];
      r[key] = value;
      return r;
    }, {});
  lazyParams.value.filters = filters;
};
</script>

<template>
  <div class="object-table">
    <DataTable
      ref="dt"
      v-model:selection="selectedObjects"
      v-model:filters="filters"
      lazy
      paginator
      :loading="loading"
      v-model:value="tableData"
      :total-records="totalRecords"
      data-key="id"
      class="p-datatable-sm"
      responsive-layout="scroll"
      :rows="3"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="updatedAt"
      :sort-order="-1"
      filterDisplay="row"
      :global-filter-fields="['name']"
      :first="first"
      update:filters
      update:page
      @page="onPage($event)"
      @sort="onSort($event)"
      @filter="onFilter($event)"
    >
      <template #header>
        <div class="flex justify-content-end">
          <ObjectFilters
            :bucket-id="props.bucketId"
            @selected-filters="selectedFilters"
          />

          <span class="p-input-icon-left ml-4">
            <i class="pi pi-search" />
            <InputText
              v-model="filters.name.value"
              class="searchInput"
              placeholder="Search File Names"
            />
            <Button
              v-show="filters.name.value !== undefined"
              v-tooltip.bottom="'Clear'"
              class="ml-2 p-input-icon-clear-right"
              icon="pi pi-times"
              outlined
              aria-label="Clear"
              @click="
                () => {
                  filters.name.value = undefined;
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
            @click="onFilter()"
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
        sortable
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
        sortable
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
        field="updatedAt"
        header="Updated date"
        style="width: 300px"
        sortable
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
