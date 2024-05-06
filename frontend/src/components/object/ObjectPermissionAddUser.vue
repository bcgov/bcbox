<script setup lang="ts">
import SearchUsers from '@/components/form/SearchUsers.vue';
import { usePermissionStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { User } from '@/types';

// Props
type Props = {
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const permissionStore = usePermissionStore();

// Actions
const onAdd = async (selectedUser: User) => {
  if (props.objectId) await permissionStore.addObjectPermission(props.objectId, selectedUser.userId, Permissions.READ);
};
</script>

<template>
  <SearchUsers
    :permissions="permissionStore.getMappedObjectToUserPermissions"
    @add-user="onAdd"
  />
</template>
