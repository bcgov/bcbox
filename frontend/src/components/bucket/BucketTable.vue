<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import BucketPermission from '@/components/bucket/BucketPermission.vue';
import { Spinner } from '@/components/layout';
import { SyncButton } from '@/components/common';
import { Button, Column, Dialog, TreeTable, useConfirm } from '@/lib/primevue';
import { useAppStore, useAuthStore, useBucketStore, usePermissionStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Types
type BucketTreeNode = {
  key: string;
  data: Bucket;
  children: Array<BucketTreeNode>;
};

// Store
const bucketStore = useBucketStore();
const permissionStore = usePermissionStore();
const { getIsLoading } = storeToRefs(useAppStore());
const { getUserId } = storeToRefs(useAuthStore());
const { getBuckets } = storeToRefs(bucketStore);

// State
const treeData: Ref<Array<any>> = ref([]);
const permissionsVisible: Ref<boolean> = ref(false);
const permissionsBucketId: Ref<string> = ref('');
const permissionBucketName: Ref<string> = ref('');

const emit = defineEmits(['show-bucket-config', 'show-sidebar-info']);

// Actions
const confirm = useConfirm();

const showSidebarInfo = async (id: number) => {
  emit('show-sidebar-info', id);
};

const showBucketConfig = async (bucket: Bucket) => {
  emit('show-bucket-config', bucket);
};

const showPermissions = async (bucketId: string, bucketName: string) => {
  permissionsVisible.value = true;
  permissionsBucketId.value = bucketId;
  permissionBucketName.value = bucketName;
};

const confirmDeleteBucket = (bucketId: string) => {
  confirm.require({
    message:
      'Are you sure you want to delete this bucket in BCBox? \
      This will drop all related objects and permissions from BCBox, \
      but the files will still remain in the actual bucket.',
    header: 'Delete bucket',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => deleteBucket(bucketId)
  });
};

async function deleteBucket(bucketId: string) {
  await bucketStore.deleteBucket(bucketId);
  await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
}

function getBucketPath(bucket: Bucket): string {
  return `${bucket.bucket}/${bucket.key}`;
}

// Assumes the tree node paths have been pre sorted
function findParent(
  tree: Array<BucketTreeNode> | undefined,
  node: BucketTreeNode | undefined,
  parentPath: string
): BucketTreeNode | undefined {
  if (tree) {
    let parent;
    for (const root of tree) {
      parent = findParent(undefined, root, parentPath);
      if (parent) break;
    }
    return parent;
  }

  if (node) {
    if (getBucketPath(node.data) === parentPath) {
      return node;
    }

    for (const child of node.children) {
      const found = findParent(tree, child, parentPath);
      if (found) return found;
    }

    return undefined;
  }
}

watch(getBuckets, () => {
  // Split buckets into arrays based on endpoint
  const matrix: Array<Array<Bucket>> = [];
  for (const bucket of getBuckets.value) {
    const col = matrix.find((x: Array<Bucket>) => x[0].endpoint === bucket.endpoint);
    if (col) {
      col.push(bucket);
    } else {
      matrix.push(new Array(bucket));
    }
  }

  // Sort arrays by path
  for (const col of matrix) {
    col.sort((a: Bucket, b: Bucket) => {
      if (`${a.bucket}/${a.key}` < `${b.bucket}/${b.key}`) return -1;
      if (`${a.bucket}/${a.key}` > `${b.bucket}/${b.key}`) return 1;
      return 0;
    });
  }

  // Build the tree
  const tree: Array<BucketTreeNode> = [];
  for (const col of matrix) {
    for (const row of col) {
      const path = getBucketPath(row);
      const parentPath = path.substring(0, path.lastIndexOf('/'));
      const parent = findParent(tree, undefined, parentPath);
      const node: BucketTreeNode = {
        key: getBucketPath(row),
        data: row,
        children: new Array()
      };

      if (parent) {
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    }
  }

  // Update state
  treeData.value = tree;
});
</script>

<template>
  <div>
    <TreeTable
      :loading="getIsLoading"
      :value="treeData"
      data-key="bucketId"
      class="p-treetable-sm"
      responsive-layout="scroll"
      :paginator="true"
      :rows="10"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="bucketName"
      :sort-order="1"
    >
      <template #empty>
        <div
          v-if="!getIsLoading"
          class="flex justify-content-center"
        >
          <h3>There are no buckets associated with your account.</h3>
        </div>
      </template>
      <template #loadingicon>
        <Spinner />
      </template>
      <Column
        field="bucketName"
        header="Bucket Name"
        header-style="padding-left: 50px"
        body-class="truncate"
        expander
      >
        <template #body="{ node }">
          <span class="row-head mr-2">
            <font-awesome-icon icon="fa-solid fa-box-open" />
          </span>
          <span
            v-if="node.data.bucketName.length > 150"
            v-tooltip.bottom="{ value: node.data.bucketName }"
          >
            <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: node.data.bucketId } }">
              {{ node.data.bucketName }}
            </router-link>
          </span>
          <span v-else>
            <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: node.data.bucketId } }">
              {{ node.data.bucketName }}
            </router-link>
          </span>
        </template>
      </Column>
      <Column
        header="Actions"
        header-style="width: 250px"
        header-class="header-right"
        body-class="content-right action-buttons"
      >
        <template #body="{ node }">
          <Button
            v-if="permissionStore.isBucketActionAllowed(node.data.bucketId, getUserId, Permissions.UPDATE)"
            v-tooltip.bottom="'Configure bucket'"
            class="p-button-lg p-button-text"
            aria-label="Configure bucket"
            @click="showBucketConfig(node.data)"
          >
            <font-awesome-icon icon="fas fa-cog" />
          </Button>
          <Button
            v-if="permissionStore.isBucketActionAllowed(node.data.bucketId, getUserId, Permissions.MANAGE)"
            v-tooltip.bottom="'Bucket permissions'"
            class="p-button-lg p-button-text"
            aria-label="Bucket permissions"
            @click="showPermissions(node.data.bucketId, node.data.bucketName)"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <SyncButton
            label-text="Synchronize bucket"
            :bucket-id="node.data.bucketId"
          />
          <Button
            v-if="permissionStore.isBucketActionAllowed(node.data.bucketId, getUserId, Permissions.READ)"
            v-tooltip.bottom="'Bucket details'"
            class="p-button-lg p-button-rounded p-button-text"
            aria-label="Bucket details"
            @click="showSidebarInfo(node.data.bucketId)"
          >
            <font-awesome-icon icon="fa-solid fa-circle-info" />
          </Button>
          <Button
            v-if="permissionStore.isBucketActionAllowed(node.data.bucketId, getUserId, Permissions.DELETE)"
            v-tooltip.bottom="'Delete bucket'"
            class="p-button-lg p-button-text p-button-danger"
            aria-label="Delete bucket"
            @click="confirmDeleteBucket(node.data.bucketId)"
          >
            <font-awesome-icon icon="fa-solid fa-trash" />
          </Button>
        </template>
      </Column>
    </TreeTable>

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
        <span class="p-dialog-title">Bucket Permissions</span>
      </template>

      <h3 class="bcbox-info-dialog-subhead">
        {{ permissionBucketName }}
      </h3>

      <BucketPermission :bucket-id="permissionsBucketId" />
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
.row-head {
  color: $bcbox-primary;
}
</style>
