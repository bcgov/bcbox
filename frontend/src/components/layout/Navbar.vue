<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Toolbar from 'primevue/toolbar';

import { useAuthStore } from '@/store/authStore';
import { RouteNames } from '@/utils/constants';

const { getAuthenticated } = storeToRefs(useAuthStore());
const { getKeycloak } = storeToRefs(useAuthStore());
</script>

<template>
  <div v-if="getKeycloak.authenticated">
    <Toolbar>
      <template #start>
        <ol class="list-none m-0 p-0 flex flex-row align-items-center font-semibold">
          <li class="mr-2"><router-link :to="{ name: RouteNames.Home }">Home</router-link></li>
          <li class="mr-2"><router-link :to="{ name: RouteNames.ListBuckets }">My Buckets</router-link></li>
          <li class="mr-2"><router-link :to="{ name: RouteNames.Developer }">Developer</router-link></li>
        </ol>
      </template>
    </Toolbar>
  </div>
</template>

<style lang="scss" scoped>
.p-toolbar {
  padding: 0px 50px 0px 50px;
}
</style>
