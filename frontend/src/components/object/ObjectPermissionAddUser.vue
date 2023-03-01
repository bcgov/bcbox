<script setup lang="ts">
import { storeToRefs } from 'pinia';

import SearchUsers from '@/components/form/SearchUsers.vue';
import { useConfigStore, useObjectStore } from '@/store';

import type { User } from '@/interfaces';

// Store
const { getConfig } = storeToRefs(useConfigStore());
const { selectedObjectPermissions } = storeToRefs(useObjectStore());

// Functions
const onAdd = (selectedUser: User) => {
  const idp = getConfig.value.idpList.find((idp: any) => idp.idp === selectedUser?.idp);

  selectedObjectPermissions.value.push({
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
    :permissions="selectedObjectPermissions"
    @add-user="onAdd"
  />
</template>
