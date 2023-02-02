<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

import ObjectPermissionAddUser from '@/components/object/ObjectPermissionAddUser.vue';
import { useToaster } from '@/composables/useToaster';
import { useObjectStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { Ref } from 'vue';

// Props
const props = defineProps<{
  objectId: string;
}>();

// State
const showSearchUsers: Ref<boolean> = ref(false);

const objectStore = useObjectStore();
const { loading, selectedObjectPermissions } = storeToRefs(useObjectStore());

onMounted(() => {
  fetchPermissions();
});

const cancelSearchUsers = () => {
  showSearchUsers.value = false;
};

const fetchPermissions = () => {
  useToaster(() => objectStore.getObjectPermissions(props.objectId), { summary: 'Unable to load permissions.' });
};

const updateObjectPermission = (value: any, userId: string, permCode: string) => {
  if (value) {
    objectStore.addObjectPermission(props.objectId, userId, permCode);
  } else {
    objectStore.deleteObjectPermission(props.objectId, userId, permCode);
  }
};

const removeObjectUser = async (userId: string) => {
  await objectStore.removeObjectUser(props.objectId, userId);
  fetchPermissions();
};
</script>

<template>
  <div>
    <div v-if="!showSearchUsers">
      <Button
        class="mt-1 mb-4"
        @click="showSearchUsers = true"
      >
        <font-awesome-icon
          icon="fa-solid fa-user-plus"
          class="mr-1"
        /> Add user
      </Button>
    </div>
    <div v-else>
      <ObjectPermissionAddUser
        @cancel-search-users="cancelSearchUsers"
      />
    </div>

    <DataTable
      :loading="loading"
      :value="selectedObjectPermissions"
      data-key="userId"
      class="p-datatable-sm"
      striped-rows
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink"
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
    >
      <template #empty>
        <div class="flex justify-content-center">
          <h3>There are no users associated with this object.</h3>
        </div>
      </template>
      <Column
        field="fullName"
        header="Name"
      />
      <Column
        field="idpName"
        header="Provider"
      />
      <Column
        header="Read"
        header-class="header-center"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.read"
            input-id="read"
            :binary="true"
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.READ)"
          />
        </template>
      </Column>
      <Column
        header="Update"
        header-class="header-center"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.update"
            input-id="update"
            :binary="true"
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.UPDATE)"
          />
        </template>
      </Column>
      <Column
        header="Delete"
        header-class="header-center"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.delete"
            input-id="delete"
            :binary="true"
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.DELETE)"
          />
        </template>
      </Column>
      <Column
        header="Manage"
        header-class="header-center"
        body-class="content-center"
      >
        <template #body="{ data }">
          <Checkbox
            v-model="data.manage"
            input-id="manage"
            :binary="true"
            @input="(value) => updateObjectPermission(value, data.userId, Permissions.MANAGE)"
          />
        </template>
      </Column>
      <Column header="Remove">
        <template #body="{ data }">
          <Button
            class="p-button-lg p-button-text"
            style="color: red"
            @click="removeObjectUser(data.userId)"
          >
            <font-awesome-icon icon="fa-solid fa-user-xmark" />
          </Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style lang="scss" scoped>
:deep(.p-button.p-button-lg) {
  padding: 0;
  margin-left: 1rem;
}
</style>
