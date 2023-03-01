<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

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
import { useObjectStore, useUserStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

defineProps({
  displayInfo: {
    type: Object,
    default: undefined,
  },
});

const objectStore = useObjectStore();
const { loading, multiSelectedObjects, objectList } = storeToRefs(objectStore);
const { currentUser } = storeToRefs(useUserStore());

const permissionsVisible = ref(false);
const permissionsObjectId = ref('');
const permissionsObjectName = ref('');

const emit = defineEmits(['show-info']);

const showInfo = async (id: string) => {
  emit('show-info', id);
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
      :loading="loading"
      :value="objectList"
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
          v-if="!loading"
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
        :hidden="displayInfo ? true : false"
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
            v-if="objectStore.isActionAllowed(data.permissions, Permissions.READ, currentUser?.userId)"
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
          />
          <Button
            v-if="objectStore.isActionAllowed(data.permissions, Permissions.MANAGE, currentUser?.userId)"
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
            v-if="objectStore.isActionAllowed(data.permissions, Permissions.DELETE, currentUser?.userId)"
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
      class="bcbox-info-dlg permissions-modal"
    >
      <!-- eslint-enable vue/no-v-model-argument -->
      <template #header>
        <font-awesome-icon
          icon="fas fa-users"
          fixed-width
        />
        <span class="p-dialog-title">Object Permissions</span>
      </template>

      <h3 class="bcbox-info-dlg-subhead">
        {{ permissionsObjectName }}
      </h3>

      <ObjectPermission :object-id="permissionsObjectId" />
    </Dialog>
  </div>
</template>
