<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectPermission
} from '@/components/object';
import { ShareObjectButton } from '@/components/object/share';
import { Button, Column, DataTable, Dialog, FilterMatchMode, InputText, InputSwitch, useToast } from '@/lib/primevue';
import { useAuthStore, useAppStore, useMetadataStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

type COMSObjectDataSource = {
  name?: string;
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
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const { getObjects } = storeToRefs(objectStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const permissionsVisible = ref(false);
const permissionsObjectId = ref('');
const permissionsObjectName = ref('');
const selectedObjects: Ref<Array<COMSObject>> = ref([]);
const tableData: Ref<Array<COMSObjectDataSource>> = ref([]);

// Actions
const toast = useToast();

const formatShortUuid = (uuid: string) => {
  return uuid?.slice(0,8) ?? uuid;
};

const showInfo = async (id: string) => {
  emit('show-object-info', id);
};

const showPermissions = async (objectId: string) => {
  await permissionStore.fetchObjectPermissions({objectId});

  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = metadataStore.findValue(objectId, 'coms-name') || '';
};

const togglePublic = async (objectId: string, isPublic: boolean) => {
  await objectStore.togglePublic(objectId, isPublic);
};

function onDeletedSuccess() {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'File deleted',
    life: 3000
  });
}

watch( getObjects, async () => {
  // Filter object cache to this specific bucket
  const objs: Array<COMSObjectDataSource> = getObjects.value
    .filter( (x: COMSObject) => x.bucketId === props.bucketId ) as COMSObjectDataSource[];

  // Update metadata store with metadata user has access to
  const objIds: Array<string> = [];
  objs.forEach( (x: COMSObject) => {
    if( x.public || permissionStore.isObjectActionAllowed(
      x.id, getUserId.value, Permissions.READ, props.bucketId as string))
    {
      objIds.push(x.id);
    }
  });
  await metadataStore.fetchMetadata({objectId: objIds});

  tableData.value = objs.map( (x: COMSObjectDataSource) => {
    x.name = metadataStore.findValue(x.id, 'coms-name');
    x.lastUpdatedDate = x.updatedAt ?? x.createdAt;
    return x;
  });
});

watch( selectedObjects, () => {
  objectStore.setSelectedObjects(selectedObjects.value);
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
  <div>
    <DataTable
      v-model:selection="selectedObjects"
      v-model:filters="filters"
      :value="tableData"
      data-key="id"
      class="p-datatable-sm"
      striped-rows
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="name"
      :sort-order="1"
      :global-filter-fields="['name']"
    >
      <template #header>
        <div class="flex justify-content-end">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Search File Names"
            />
          </span>

          <Button
            class="ml-2"
            icon="pi pi-refresh"
            outlined
            rounded
            aria-label="Filter"
            @click="objectStore.fetchObjects({ bucketId: props.bucketId })"
          />
        </div>
      </template>
      <template #empty>
        <div
          v-if="!useAppStore().getIsLoading"
          class="flex justify-content-center"
        >
          <h3>
            There are no objects associated with your account in this bucket.
          </h3>
        </div>
      </template>
      <Column
        selection-mode="multiple"
        header-style="width: 3rem"
      />
      <Column
        field="name"
        :sortable="true"
        header="Name"
        header-style="width: 25%"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div
            v-tooltip.bottom="{ value: data.name }"
          >
            {{ data.name }}
          </div>
        </template>
      </Column>
      <Column
        field="id"
        :sortable="true"
        header="Object ID"
      >
        <template #body="{ data }">
          <div
            v-tooltip.bottom="{ value: data.id }"
          >
            {{ formatShortUuid(data.id) }}
          </div>
        </template>
      </Column>
      <Column
        field="lastUpdatedDate"
        header="Updated date"
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
      >
        <template #body="{ data }">
          <InputSwitch
            v-model="data.public"
            :disabled="!permissionStore.isObjectActionAllowed(
              data.id, getUserId, Permissions.MANAGE, props.bucketId as string)"
            @change="togglePublic(data.id, data.public)"
          />
        </template>
      </Column>
      <Column
        header="Actions"
        header-style="width: 220px"
        header-class="header-right"
        body-class="content-right action-buttons"
      >
        <template #body="{ data }">
          <ShareObjectButton
            :id="data.id"
          />
          <DownloadObjectButton
            v-if="data.public || permissionStore.isObjectActionAllowed(
              data.id, getUserId, Permissions.READ, props.bucketId as string)"
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
          />
          <Button
            v-if="permissionStore.isObjectActionAllowed(
              data.id, getUserId, Permissions.MANAGE, props.bucketId as string)"
            class="p-button-lg p-button-text"
            @click="showPermissions(data.id)"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <Button
            v-if="data.public || permissionStore.isObjectActionAllowed(
              data.id, getUserId, Permissions.READ, props.bucketId as string)"
            class="p-button-lg p-button-rounded p-button-text"
            @click="showInfo(data.id)"
          >
            <font-awesome-icon icon="fa-solid fa-circle-info" />
          </Button>
          <DeleteObjectButton
            v-if="permissionStore.isObjectActionAllowed(
              data.id, getUserId, Permissions.DELETE, props.bucketId as string)"
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
