<script setup lang="ts">
import { storeToRefs } from 'pinia';
import SearchUsers from '@/components/form/SearchUsers.vue';
import { useConfigStore, usePermissionStore } from '@/store';

import type { User } from '@/interfaces';

// Store
const { getConfig } = storeToRefs(useConfigStore());
const permissionStore = usePermissionStore();

// Actions
const onAdd = (selectedUser: User) => {
  const idp = getConfig.value.idpList.find((idp: any) => idp.idp === selectedUser?.idp);

  permissionStore.addObjectUser({
    userId: selectedUser.userId,
    idpName: idp?.name,
    elevatedRights: idp?.elevatedRights,
    fullName: selectedUser.fullName,
    create: false,
    read: false,
    update: false,
    delete: false,
    manage: false
  });
};
</script>

<template>
  <SearchUsers
    :permissions="permissionStore.getMappedObjectToUserPermissions"
    @add-user="onAdd"
  />
</template>
