<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputSwitch from 'primevue/inputswitch';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectPermission,
  ShareObjectButton
} from '@/components/object';
import { ButtonMode } from '@/interfaces/common/enums';
import { useAppStore, useObjectStore, usePermissionStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

// Props
defineProps<{
  objectInfoId?: string;
}>();

// Emits
const emit = defineEmits(['show-object-info']);

// Store
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const route = useRoute();
const { getObjects } = storeToRefs(objectStore);
const { currentUser } = storeToRefs(useUserStore());

// State
const permissionsVisible = ref(false);
const permissionsObjectId = ref('');
const permissionsObjectName = ref('');

// Actions
const showInfo = async (id: string) => {
  emit('show-object-info', id);
};

const showPermissions = async (objectId: string, objectName: string) => {
  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = objectName;
};

const togglePublic = async (objectId: string, isPublic: boolean) => {
  await objectStore.togglePublic(objectId, isPublic);
};
</script>

<template>
  <div>
    <DataTable
      v-model:selection="multiSelectedObjects"
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
          v-if="!useAppStore().getLoading"
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
            v-if="data.name?.length > 25"
            v-tooltip.bottom="{ value: data.name }"
          >
            {{ data.name }}
          </div>
          <div v-else>
            {{ data.name }}
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
        :hidden="objectInfoId ? true : false"
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
            :disabled="!objectStore.isActionAllowed(data.permissions, Permissions.MANAGE, currentUser?.userId)"
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
            v-if="objectStore.isActionAllowed(data.permissions, Permissions.MANAGE, currentUser?.userId)"
            :obj="data"
          />
          <DownloadObjectButton
            v-if="permissionStore.getObjectActionAllowed(data.id, route.query.bucketId, currentUser?.userId, Permissions.READ)"
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
          />
          <Button
            v-if="permissionStore.getObjectActionAllowed(data.id, route.query.bucketId, currentUser?.userId, Permissions.MANAGE)"
            class="p-button-lg p-button-text"
            @click="showPermissions(data.id, data.name)"
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
            v-if="permissionStore.getObjectActionAllowed(data.id, route.query.bucketId, currentUser?.userId, Permissions.DELETE)"
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
