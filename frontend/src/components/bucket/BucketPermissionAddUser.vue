<script setup lang="ts">
import SearchUsers from '@/components/form/SearchUsers.vue';
import { Permissions } from '@/utils/constants';
import { usePermissionStore } from '@/store';

import type { User } from '@/types';

type Props = {
  bucketId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();

// Actions
const onAdd = (selectedUser: User) => {
  permissionStore.addBucketPermission(props.bucketId, selectedUser.userId, Permissions.READ);
};
</script>

<template>
  <SearchUsers
    :permissions="permissionStore.getMappedBucketToUserPermissions"
    @add-user="onAdd"
  />
</template>
