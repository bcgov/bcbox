<script setup lang="ts">
import { storeToRefs } from 'pinia';

import SearchUsers from '@/components/form/SearchUsers.vue';
import { useBucketStore, useConfigStore } from '@/store';

import type { User } from '@/interfaces';

// Store
const { getConfig } = useConfigStore();
const { permissions } = storeToRefs(useBucketStore());

// Functions
const onAdd = (selectedUser: User) => {
  const idp = getConfig.value.idpList.find((idp: any) => idp.idp === selectedUser?.idp);

  permissions.value.push({
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
    :permissions="permissions"
    @add-user="onAdd"
  />
</template>
