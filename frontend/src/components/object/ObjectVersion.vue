<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import {
  DeleteObjectButton,
  DownloadObjectButton
} from '@/components/object';
import { Button, Column, DataTable, useToast } from '@/lib/primevue';
import { useAppStore, useAuthStore, usePermissionStore, useUserStore, useVersionStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { User, Version } from '@/types';

type VersionDataSource = {
  createdByName?: string;
} & Version;

// Props
type Props = {
  bucketId: string;
  objectId: string;
  versionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();
const userStore = useUserStore();
const versionStore = useVersionStore();
const { getUserId } = storeToRefs(useAuthStore());
const { getUserSearch } = storeToRefs(userStore);

// State
const tableData: Ref<Array<VersionDataSource>> = ref([]);

// Actions
const toast = useToast();

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const showInfo = async (id: string) => {
  // emit('show-object-info', id);
};

function onDeletedSuccess() {
  toast.success('File deleted');
}

async function load() {
  await versionStore.fetchVersions({ objectId: props.objectId });
  const versions = versionStore.findVersionsByObjectId(props.objectId);
  await userStore.fetchUsers({ userId: versions.map( (x: Version) => x.createdBy) });

  tableData.value = versions.map( (v: Version) => ({
    ...v,
    createdByName: getUserSearch.value.find( (u: User) => u.userId === v.createdBy )?.fullName
  }));
}

onMounted(() => {
  load();
});

watch( [props], () => {
  load();
});
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div class="col-12">
      <h2 class="font-bold">
        Versions
      </h2>
    </div>
    <div class="col-12">
      <DataTable
        :value="tableData"
        data-key="id"
        class="p-datatable-sm"
        striped-rows
        responsive-layout="scroll"
        :paginator="true"
        :rows="5"
        paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
        current-page-report-template="{first}-{last} of {totalRecords}"
        :rows-per-page-options="[5, 10, 20]"
      >
        <template #empty>
          <div
            v-if="!useAppStore().getIsLoading"
            class="flex justify-content-center"
          >
            <h3>
              There are no versions associated with this object.
            </h3>
          </div>
        </template>
        <Column
          field="updatedAt"
          header="Version"
          header-style="width: 33%"
        >
          <template #body="{ data }">
            <div>
              <router-link
                v-if="data.id !== props.versionId"
                :to="{ name: RouteNames.DETAIL_OBJECTS,
                       query: { objectId: props.objectId, versionId: data.id } }"
              >
                {{ data.updatedAt ? formatDateLong(data.updatedAt) : formatDateLong(data.createdAt) }}
              </router-link>
              <span v-else>
                {{ data.updatedAt ? formatDateLong(data.updatedAt) : formatDateLong(data.createdAt) }}
              </span>
            </div>
          </template>
        </Column>
        <Column
          field="createdBy"
          header="Updated by"
          header-style="width: 33%"
        >
          <template #body="{ data }">
            <div>
              {{ data.createdByName }}
            </div>
          </template>
        </Column>
        <Column
          header="Actions"
          header-style="width: 34%"
          header-class="header-right"
          body-class="content-right action-buttons"
        >
          <template #body="{ data }">
            <DownloadObjectButton
              v-if="data.public || permissionStore.isObjectActionAllowed(
                data.id, getUserId, Permissions.READ, props.bucketId as string)"
              :mode="ButtonMode.ICON"
              :ids="['TODO']"
              :disabled="true"
            />
            <Button
              v-if="data.public || permissionStore.isObjectActionAllowed(
                data.id, getUserId, Permissions.READ, props.bucketId as string)"
              class="p-button-lg p-button-rounded p-button-text"
              :disabled="true"
              @click="showInfo('TODO')"
            >
              <font-awesome-icon icon="fa-solid fa-circle-info" />
            </Button>
            <DeleteObjectButton
              v-if="permissionStore.isObjectActionAllowed(
                data.id, getUserId, Permissions.DELETE, props.bucketId as string)"
              :mode="ButtonMode.ICON"
              :ids="['TODO']"
              :disabled="true"
              @on-deleted-success="onDeletedSuccess"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>