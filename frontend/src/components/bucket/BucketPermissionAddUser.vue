<script setup lang="ts">
import { storeToRefs } from 'pinia';

import SearchUsers from '@/components/form/SearchUsers.vue';
import { useConfigStore, usePermissionStore } from '@/store';

import type { User, IdentityProvider } from '@/types';

// Store
const { getConfig } = storeToRefs(useConfigStore());
const permissionStore = usePermissionStore();

// Actions
const onAdd = (selectedUser: User) => {
  const configuredIdp = getConfig.value.idpList.find((idp: IdentityProvider) => idp.idp === selectedUser.idp);
  const idpName = configuredIdp?.name || 'BCSC';
  const idpElevated = configuredIdp?.elevatedRights || false;

  permissionStore.addBucketUser({
    userId: selectedUser.userId,
    idpName: idpName,
    elevatedRights: idpElevated,
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
    :permissions="permissionStore.getMappedBucketToUserPermissions"
    @add-user="onAdd"
  />
</template>
