<script setup lang="ts">
import SearchUsers from '@/components/form/SearchUsers.vue';
import { Permissions } from '@/utils/constants';
import { usePermissionStore } from '@/store';

import type { User } from '@/types';

type Props = {
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();

// Actions
const onAdd = (selectedUser: User) => {
  permissionStore.addObjectPermission(props.objectId, selectedUser.userId, Permissions.READ);
};
</script>

<template>
  <SearchUsers
    :permissions="permissionStore.getMappedObjectToUserPermissions"
    @add-user="onAdd"
  />
</template>
