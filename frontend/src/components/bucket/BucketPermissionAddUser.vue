<script setup lang="ts">
import { storeToRefs } from 'pinia';

import SearchUsers from '@/components/form/SearchUsers.vue';
import { useBucketStore, useConfigStore } from '@/store';

import type { User } from '@/interfaces';

// Store
const { permissions } = storeToRefs(useBucketStore());
const { config } = storeToRefs(useConfigStore());

// Functions
const onAdd = (selectedUser: User | null) => {
  if(selectedUser !== null) {
    permissions.value.push({
      userId: selectedUser.userId,
      elevatedRights: config.value.idpList.find((idp: any) => {
        return idp.idp === selectedUser?.idp;
      })?.elevatedRights,
      fullName: selectedUser.fullName,
      create: false,
      read: false,
      update: false,
      delete: false,
      manage: false
    });
  }
};
</script>

<template>
  <SearchUsers @add-user="onAdd" />
</template>
