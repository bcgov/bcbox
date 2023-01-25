<script setup lang="ts">
import { storeToRefs } from 'pinia';

import SearchUsers from '@/components/form/SearchUsers.vue';
import { useBucketStore, useConfigStore } from '@/store';

import type { User } from '@/interfaces';

// Store
const { permissions } = storeToRefs(useBucketStore());
const { config } = storeToRefs(useConfigStore());

// Functions
const onAdd = (selectedUser: User) => {
  const idp = config.value.idpList.find((idp: any) => idp.idp === selectedUser?.idp);

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
  <SearchUsers @add-user="onAdd" />
</template>
