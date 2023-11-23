<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import { BucketPermission, BucketTableBucketName } from '@/components/bucket';
import { Spinner } from '@/components/layout';
import { SyncButton } from '@/components/common';
import { Button, Column, Dialog, TreeTable, useConfirm } from '@/lib/primevue';
import { useAppStore, useAuthStore, useBucketStore, usePermissionStore } from '@/store';
import { DELIMITER, Permissions } from '@/utils/constants';
import { joinPath } from '@/utils/utils';

import type { TreeTableExpandedKeys } from 'primevue/treetable';
import type { Ref } from 'vue';
import type { Bucket, BucketTreeNode } from '@/types';

// Store
const bucketStore = useBucketStore();
const permissionStore = usePermissionStore();
const { getIsLoading } = storeToRefs(useAppStore());
const { getUserId } = storeToRefs(useAuthStore());
const { getBuckets } = storeToRefs(bucketStore);

// State
const expandedKeys: Ref<TreeTableExpandedKeys> = ref({});
const permissionsVisible: Ref<boolean> = ref(false);
const permissionsBucketId: Ref<string> = ref('');
const permissionBucketName: Ref<string> = ref('');
const treeData: Ref<Array<BucketTreeNode>> = ref([]);

const emit = defineEmits(['show-bucket-config', 'show-sidebar-info']);

// Actions
const bucketTreeNodeMap = new Map<string, BucketTreeNode>();
const confirm = useConfirm();
const endpointMap = new Map<string, Array<Bucket>>();

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

/** Returns a full canonical path to a Bucket or fake tree data */
function getBucketPath(bucket: Bucket): string {
  return `${bucket.endpoint}/${bucket.bucket}/${bucket.key}`;
}

/** Get the full path to the first part of its key */
function getFirstKeyPartPath(node: BucketTreeNode): string {
  const parts = node.data.key.split(DELIMITER).filter((part) => part);

  return `${node.data.endpoint}/${node.data.bucket}/${parts[0]}`;
}

/**
 * Finds the nearest indirect path to node \
 * Assumes the endpointMap paths have been pre sorted
 */
function findNearestNeighbour(node: BucketTreeNode): BucketTreeNode | undefined {
  const prefixParts = getBucketPath(node.data)
    .split(DELIMITER)
    .filter((part) => part);

  for (let i = prefixParts.length; i >= 0; --i) {
    let path = joinPath(...prefixParts.slice(0, i));

    // Fix broken endpoints caused by delimiter splitting
    path = path.replace(/^https?:\//i, (match) => `${match}/`);

    if (bucketTreeNodeMap.has(path)) {
      return bucketTreeNodeMap.get(path);
    }
  }

  // Failed to find anything based on key so check root
  // Double // at end required as the key of a bucket is stored as '/'
  // Undefined if not found
  return bucketTreeNodeMap.get(`${node.data.endpoint}/${node.data.bucket}//`);
}

/**
 * Creates the fake paths necessary between neighbour and node to mimic a folder hierarchy \
 * Returns the final node created
 */
function createDummyNodes(neighbour: BucketTreeNode, node: BucketTreeNode) {
  const neighbourParts = getBucketPath(neighbour.data)
    .split(DELIMITER)
    .filter((part) => part);

  const nodeParts = getBucketPath(node.data)
    .split(DELIMITER)
    .filter((part) => part);

  const dummyNodes = new Array<BucketTreeNode>();

  for (let i = neighbourParts.length + 1; i < nodeParts.length; ++i) {
    let fullPath = joinPath(...nodeParts.slice(0, i));
    let key = joinPath(...nodeParts.slice(2, i));

    // Fix broken endpoints caused by delimiter splitting
    fullPath = fullPath.replace(/^https?:\//i, (match) => `${match}/`);

    dummyNodes.push({
      key: fullPath,
      data: {
        accessKeyId: '',
        active: false,
        bucket: node.data.bucket,
        bucketId: '',
        bucketName: nodeParts[i - 1],
        dummy: true,
        endpoint: node.data.endpoint,
        key: key,
        region: '',
        secretAccessKey: ''
      },
      children: new Array(),
      isRoot: false
    });
  }

  let current = neighbour;
  for (const dummy of dummyNodes) {
    current.children.push(dummy);
    current = dummy;
    bucketTreeNodeMap.set(dummy.key, dummy);
  }

  return current;
}

watch(getBuckets, () => {
  // Make sure everything is clear for a rebuild
  endpointMap.clear();
  bucketTreeNodeMap.clear();
  expandedKeys.value = {};

  // Split buckets into arrays based on endpoint
  for (const bucket of getBuckets.value) {
    if (!endpointMap.has(`${bucket.endpoint}/${bucket.bucket}`)) {
      endpointMap.set(`${bucket.endpoint}/${bucket.bucket}`, new Array<Bucket>());
    }
    endpointMap.get(`${bucket.endpoint}/${bucket.bucket}`)?.push(bucket);
  }

  // Sort arrays by path
  for (const i of endpointMap) {
    i[1].sort((a: Bucket, b: Bucket) => getBucketPath(a).localeCompare(getBucketPath(b)));
  }

  // Build the tree for each endpoint
  // First looks for a direct parent node
  // If not found it looks for the nearest neighbour to build 'dummy' nodes to mimic a folder hierarchy
  // If that somehow fails it adds the node to the root to ensure its still visible
  const tree: Array<BucketTreeNode> = [];
  for (const col of endpointMap) {
    for (const row of col[1]) {
      const path = getBucketPath(row);
      const parentPath = path.substring(0, path.lastIndexOf('/'));
      const parent = bucketTreeNodeMap.get(parentPath);

      const node: BucketTreeNode = {
        key: getBucketPath(row),
        data: { ...row, dummy: false },
        children: new Array(),
        isRoot: false
      };

      if (parent) {
        parent.children.push(node);
      } else {
        const neighbour = findNearestNeighbour(node);
        if (neighbour) {
          createDummyNodes(neighbour, node).children.push(node);
        } else {
          if (node.data.key !== '/') {
            // Top level bucket not at root so create dummy hierarchy to reach it
            const rootFullPath = getFirstKeyPartPath(node);
            const rootKey = node.data.key.split(DELIMITER).filter((part) => part)[0];
            const dummyRootNode: BucketTreeNode = {
              key: rootFullPath,
              data: {
                accessKeyId: '',
                active: false,
                bucket: node.data.bucket,
                bucketId: '',
                bucketName: rootKey,
                dummy: true,
                endpoint: node.data.endpoint,
                key: rootKey,
                region: '',
                secretAccessKey: ''
              },
              children: new Array(),
              isRoot: true
            };
            tree.push(dummyRootNode);
            bucketTreeNodeMap.set(rootFullPath, dummyRootNode);
            createDummyNodes(dummyRootNode, node).children.push(node);
          } else {
            node.isRoot = true;
            tree.push(node);
          }
        }
      }

      bucketTreeNodeMap.set(getBucketPath(node.data), node);
    }
  }

  // Expand all nodes and set tree state
  bucketTreeNodeMap.forEach((_v, k) => (expandedKeys.value[k] = true));
  treeData.value = tree;
});
</script>

<template>
  <TreeTable
    :loading="getIsLoading"
    :value="treeData"
    :expanded-keys="expandedKeys"
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
          <font-awesome-icon
            v-if="!node.data.dummy"
            icon="fa-solid fa-box-open"
          />
          <font-awesome-icon
            v-else
            icon="fa-solid fa-folder"
          />
        </span>
        <span
          v-if="node.data.bucketName.length > 150"
          v-tooltip.bottom="{ value: node.data.bucketName }"
        >
          <BucketTableBucketName :node="node" />
        </span>
        <span v-else>
          <BucketTableBucketName :node="node" />
        </span>
      </template>
    </Column>
    <Column
      header="Actions"
      header-class="text-right"
      body-class="action-buttons"
      style="width: 250px"
    >
      <template #body="{ node }">
        <span v-if="!node.data.dummy">
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
        </span>
      </template>
    </Column>
  </TreeTable>

  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    v-model:visible="permissionsVisible"
    :draggable="false"
    :modal="true"
    class="bcbox-info-dialog"
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
</template>

<style scoped lang="scss">
.row-head {
  color: $bcbox-primary;
}
</style>
