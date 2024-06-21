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
import { SyncButton, ShareButton } from '@/components/common';
import { Button, Column, DataTable, Dialog, InputText, useToast } from '@/lib/primevue';
import { useAuthStore, useObjectStore, useNavStore, usePermissionStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';
import { onDialogHide } from '@/utils/utils';
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

type DataTableFilter = {
  [key: string]: { value: any; matchMode: string };
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
const { focusedElement } = storeToRefs(useNavStore());

// State
const permissionsVisible = ref(false);
const permissionsObjectId = ref('');
const permissionsObjectName: Ref<string | undefined> = ref('');
const tableData: Ref<Array<COMSObjectDataSource>> = ref([]);
const lazyDataTable = ref();
const loading: Ref<boolean> = ref(false);
const lazyParams: Ref<DataTableObjectSource> = ref({});
const totalRecords: Ref<number> = ref(0);
const first: Ref<number> = ref(0);
const filters: Ref<DataTableFilter> = ref({
  name: { value: undefined, matchMode: 'contains' },
  tags: { value: undefined, matchMode: 'contains' },
  meta: { value: undefined, matchMode: 'contains' }
});

// Actions
const toast = useToast();
const formatShortUuid = (uuid: string) => uuid?.slice(0, 8) ?? uuid;
const onDeletedSuccess = () => {
  toast.success('File deleted');
  loadLazyData();
};

const showInfo = (id: string) => {
  emit('show-object-info', id);
  focusedElement.value = document.activeElement;
};

async function showPermissions(objectId: string) {
  await permissionStore.fetchObjectPermissions({ objectId });

  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = objectStore.getObject(objectId)?.name;
  focusedElement.value = document.activeElement;
}

onMounted(() => {
  loading.value = true;
  lazyParams.value = {
    first: 0,
    rows: lazyDataTable.value.rows,
    sortField: 'updatedAt',
    page: lazyDataTable.value.page,
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
        page: lazyParams.value?.page ? ++lazyParams.value.page : 1,
        name: lazyParams.value?.filters?.name.value ? lazyParams.value?.filters?.name.value : undefined,
        limit: lazyParams.value.rows,
        sort: lazyParams.value.sortField,
        order: lazyParams.value.sortOrder === 1 ? 'asc' : 'desc',
        tagset: lazyParams.value?.filters?.tags.value
      },
      lazyParams.value?.filters?.meta.value //Header
    )
    .then((r: any) => {
      tableData.value = r.data.map((item: any) => ({
        ...item,
        updatedAt: item.updatedAt === null ? item.createdAt : item.updatedAt
      }));
      totalRecords.value = +r?.headers['x-total-rows'];
      // add objects to store
      objectStore.setObjects(r.data);
      loading.value = false;
      return r.data;
    })
    // add object permissions to store
    .then((objects: Array<COMSObjectDataSource>) => {
      if (objects.length > 0) {
        permissionStore.fetchObjectPermissions({ objectId: objects.map((o: COMSObject) => o.id) });
      }
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
  lazyDataTable.value.resetPage();
  loadLazyData(event);
};

// Clear selections when navigating away
onUnmounted(() => {
  objectStore.setSelectedObjects([]);
});

const selectedFilters = (payload: any) => {
  filters.value.meta.value = payload.metaToSearch
    .flatMap((o: any) => ({ [o.key]: o.value }))
    .reduce((r: any, c: any) => {
      const key = Object.keys(c)[0];
      const value = c[key];
      r['x-amz-meta-' + key] = value;
      return r;
    }, {});
  filters.value.tags.value = payload.tagSetToSearch
    .flatMap((o: any) => ({ [o.key]: o.value }))
    .reduce((r: any, c: any) => {
      const key = Object.keys(c)[0];
      const value = c[key];
      r[key] = value;
      return r;
    }, {});
  lazyParams.value.filters = filters;
  loadLazyData();
};
</script>

<template>
  <div class="object-table">
    <DataTable
      ref="lazyDataTable"
      v-model:value="tableData"
      v-model:selection="objectStore.selectedObjects"
      v-model:filters="filters"
      lazy
      paginator
      :loading="loading"
      :total-records="totalRecords"
      data-key="id"
      class="p-datatable-sm"
      responsive-layout="scroll"
      :rows="10"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="updatedAt"
      :sort-order="-1"
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

          <span class="ml-4">
            <InputText
              v-model="filters.name.value"
              class="pr-6"
              placeholder="Search File Names"
              @keyup.enter="loadLazyData"
            />
            <Button
              v-show="filters.name.value"
              v-tooltip.bottom="'Clear'"
              class="overlap"
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
            v-tooltip.bottom="'Search'"
            class="ml-2"
            icon="pi pi-search"
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
          <div>
            <router-link :to="{ name: RouteNames.DETAIL_OBJECTS, query: { objectId: data.id } }">
              <span v-tooltip.bottom="'View file details'">
                {{ data.name }}
              </span>
            </router-link>
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
          {{ formatDateLong(data.updatedAt) }}
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
            :object-name="data.name"
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
          <ShareButton
            :object-id="data.id"
            label-text="File"
          />
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
            id="file_permissions"
            v-tooltip.bottom="'File permissions'"
            class="p-button-lg p-button-text"
            aria-label="File permissions"
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
            v-tooltip.bottom="'File details'"
            class="p-button-lg p-button-rounded p-button-text"
            aria-label="File details"
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
      id="permissions_dialog"
      v-model:visible="permissionsVisible"
      :draggable="false"
      :modal="true"
      class="bcbox-info-dialog"
      aria-labelledby="permissions_label"
      aria-describedby="permissions_desc"
      @after-hide="onDialogHide"
    >
      <!-- eslint-enable vue/no-v-model-argument -->
      <template #header>
        <font-awesome-icon
          icon="fas fa-users"
          fixed-width
        />
        <span
          id="permissions_label"
          class="p-dialog-title"
        >
          File Permissions
        </span>
      </template>

      <h3
        id="permissions_desc"
        class="bcbox-info-dialog-subhead"
      >
        {{ permissionsObjectName }}
      </h3>

      <ObjectPermission :object-id="permissionsObjectId" />
    </Dialog>
  </div>
</template>
<style lang="scss" scoped>
.overlap {
  position: absolute;
  right: 3.4rem;
  width: 2.5rem;
  height: 2.4rem;
}
</style>
