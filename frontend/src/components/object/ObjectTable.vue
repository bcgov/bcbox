<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';

// Vue
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
// PrimeVue
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
// State
import { useObjectStore } from '@/store';
// Other
import { formatDateLong } from '@/utils/formatters';
import DeleteObjectButton from './DeleteObjectButton.vue';
import DownloadObjectButton from './DownloadObjectButton.vue';
import ObjectPermission from './ObjectPermission.vue';

defineProps({
  displayInfo: {
    type: Object,
    default: undefined,
  },
});

const { loading, multiSelectedObjects, objectList } = storeToRefs(
  useObjectStore()
);

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
        header="Updated date"
        :hidden="displayInfo ? true : false"
      >
        <template #body="{ data }">
          {{ formatDateLong(data.updatedAt) }}
        </template>
      </Column>
      <Column
        header="Actions"
        header-style="width: 200px"
        header-class="header-right"
        body-class="content-right action-buttons"
      >
        <template #body="{ data }">
          <DownloadObjectButton
            :mode="ButtonMode.ICON"
            :ids="[data.id]"
          />
          <Button
            class="p-button-lg p-button-rounded p-button-text"
            @click="showPermissions(data.id, data.name)"
          >
            <font-awesome-icon icon="fa-solid fa-gear" />
          </Button>
          <Button
            class="p-button-lg p-button-rounded p-button-text"
            @click="showInfo(data.id)"
          >
            <font-awesome-icon icon="fa-solid fa-circle-info" />
          </Button>
          <DeleteObjectButton
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
    >
      <!-- eslint-enable vue/no-v-model-argument -->
      <template #header>
        <div class="flex">
          <font-awesome-icon
            icon="fa-solid fa-gear"
            class="pr-3 pt-2"
            style="font-size: 2rem"
          />
          <div>
            <h1>Object Permissions</h1>
            <h3>{{ permissionsObjectName }}</h3>
          </div>
        </div>
      </template>

      <ObjectPermission :object-id="permissionsObjectId" />
    </Dialog>
  </div>
</template>
