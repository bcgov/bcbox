<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, computed } from 'vue';

import { DeleteObjectButton, DownloadObjectButton } from '@/components/object';
import { Button, Column, DataTable } from '@/lib/primevue';
import { useAppStore, useAuthStore, usePermissionStore, useUserStore, useVersionStore } from '@/store';
import { Permissions } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Version } from '@/types';

type VersionDataSource = {
  createdByName?: string;
} & Version;

// Props
type Props = {
  bucketId: string;
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['on-deleted-success']);

// Store
const permissionStore = usePermissionStore();
const userStore = useUserStore();
const versionStore = useVersionStore();
// getters
const { getUserId } = storeToRefs(useAuthStore());
const { getUser } = storeToRefs(userStore);
const { getVersionsByObjectId } = storeToRefs(versionStore);

// State
const versionId = defineModel<string>('versionId');
const versions: Ref<Array<Version>> = computed(() => getVersionsByObjectId.value(props.objectId));
const tableData: Ref<Array<VersionDataSource>> = computed(() => {
  return versions.value.map((v: Version, index, arr) => ({
    ...v,
    createdByName: getUser.value(v.createdBy)?.fullName,
    versionNumber: arr.length - index
  }));
});

// Highlight row for currently selected version
const rowClass = (data: any) => [{ 'selected-row': data.id === versionId.value }];

async function onDeletedSuccess() {
  emit('on-deleted-success');
}

const onVersionClick = (e: any) => {
  versionId.value = e.data.id;
};

watch(props, () => {
  userStore.fetchUsers({ userId: versions.value.map((x: Version) => x.createdBy) });
});
</script>

<template>
  <div class="grid grid-nogutter mb-2">
    <div class="col-12">
      <h2>Versions</h2>
    </div>
    <div class="col-12">
      <DataTable
        :value="tableData"
        data-key="id"
        class="versions-table p-datatable-sm"
        responsive-layout="scroll"
        :paginator="true"
        :rows="5"
        :row-class="rowClass"
        paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
        current-page-report-template="{first}-{last} of {totalRecords}"
        :rows-per-page-options="[5, 10, 20]"
        @row-click="onVersionClick"
      >
        <template #empty>
          <div
            v-if="!useAppStore().getIsLoading"
            class="flex justify-content-center"
          >
            <h3>There are no versions associated with this object.</h3>
          </div>
        </template>
        <Column
          field="versionNumber"
          header="Version"
          header-style="width: 5em"
          body-style="text-align: center"
        >
          <template #body="{ data }">
            {{ data.versionNumber }}
          </template>
        </Column>
        <Column
          field="updatedAt"
          header="Creation date"
        >
          <template #body="{ data }">
            <div>
              <span>
                {{ formatDateLong(data.s3VersionId ? data.createdAt : data.createdAt ?? data.updatedAt) }}
              </span>
            </div>
          </template>
        </Column>
        <Column
          field="createdBy"
          header="Created by"
        >
          <template #body="{ data }">
            <div>
              {{ data.createdByName }}
            </div>
          </template>
        </Column>
        <Column
          header="Actions"
          header-class="header-right"
          body-class="action-buttons"
        >
          <template #body="{ data }">
            <DownloadObjectButton
              v-if="
                data.public ||
                permissionStore.isObjectActionAllowed(
                  props.objectId,
                  getUserId,
                  Permissions.READ,
                  props.bucketId as string
                )
              "
              :mode="ButtonMode.ICON"
              :ids="[props.objectId]"
              :version-id="data.id"
            />
            <Button
              v-tooltip.bottom="'Version details'"
              class="p-button-lg p-button-rounded p-button-text"
            >
              <font-awesome-icon icon="fa-solid fa-circle-info" />
            </Button>
            <DeleteObjectButton
              v-if="
                permissionStore.isObjectActionAllowed(
                  props.objectId,
                  getUserId,
                  Permissions.DELETE,
                  props.bucketId as string
                )
              "
              :mode="ButtonMode.ICON"
              :ids="[props.objectId]"
              :version-id="data.id"
              :disabled="tableData.length === 1"
              @on-deleted-success="onDeletedSuccess"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
