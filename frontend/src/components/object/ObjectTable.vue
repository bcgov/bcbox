<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectPermission,
  ShareObjectButton
} from '@/components/object';
import { Button, Column, DataTable, Dialog, InputSwitch } from '@/lib/primevue';
import { useAuthStore, useAppStore, useMetadataStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  objectInfoId?: string;
};

const props = withDefaults(defineProps<Props>(), {
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

// Actions
const route = useRoute();

const showInfo = async (id: string) => {
  emit('show-object-info', id);
};

const showPermissions = async (objectId: string) => {
  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = metadataStore.getValue(objectId, 'name') || '';
};

const togglePublic = async (objectId: string, isPublic: boolean) => {
  await objectStore.togglePublic(objectId, isPublic);
};

watch( selectedObjects, () => {
  objectStore.setSelectedObjects(selectedObjects.value);
});
</script>

<template>
  <div>
    <DataTable
      v-model:selection="selectedObjects"
      :value="getObjects"
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
    >
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
            v-tooltip.bottom="{ value: metadataStore.getValue(data.id, 'name') }"
          >
            {{ metadataStore.getValue(data.id, 'name') }}
          </div>
        </template>
      </Column>
      <Column
        field="id"
        :sortable="true"
        header="Object ID"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div
            v-if="data.id?.length > 15"
            v-tooltip.bottom="{ value: data.id }"
          >
            {{ data.id }}
          </div>
          <div v-else>
            {{ data.id }}
          </div>
        </template>
      </Column>
      <Column
        field="updatedAt"
        header="Updated date"
        :sortable="true"
        :hidden="props.objectInfoId ? true : false"
      >
        <template #body="{ data }">
          {{ formatDateLong(data.updatedAt) }}
        </template>
      </Column>
      <Column
        field="publicSharing"
        header="Public"
      >
        <template #body="{ data }">
          <InputSwitch
            v-model="data.public"
            :disabled="!permissionStore.getIsObjectActionAllowed(
              data.id, getUserId, Permissions.MANAGE, route.query.bucketId as string)"
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
            v-if="permissionStore.getIsObjectActionAllowed(
              data.id, getUserId, Permissions.MANAGE, route.query.bucketId as string)"
            :id="data.id"
          />
          <DownloadObjectButton
            v-if="permissionStore.getIsObjectActionAllowed(
              data.id, getUserId, Permissions.READ, route.query.bucketId as string)"
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
          />
          <Button
            v-if="permissionStore.getIsObjectActionAllowed(
              data.id, getUserId, Permissions.MANAGE, route.query.bucketId as string)"
            class="p-button-lg p-button-text"
            @click="showPermissions(data.id)"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <Button
            class="p-button-lg p-button-rounded p-button-text"
            @click="showInfo(data.id)"
          >
            <font-awesome-icon icon="fa-solid fa-circle-info" />
          </Button>
          <DeleteObjectButton
            v-if="permissionStore.getIsObjectActionAllowed(
              data.id, getUserId, Permissions.DELETE, route.query.bucketId as string)"
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
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
