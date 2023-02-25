<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Toolbar from 'primevue/toolbar';

import { useAuthStore } from '@/store';
import { RouteNames } from '@/utils/constants';

// const { home, items } = storeToRefs(useNavStore());
const { getIsAuthenticated } = storeToRefs(useAuthStore());
</script>

<template>
  <div v-if="getIsAuthenticated">
    <Toolbar>
      <template #start>
        <ol class="list-none m-0 p-0 flex flex-row align-items-center font-semibold">
          <li class="mr-2">
            <router-link :to="{ name: RouteNames.HOME }">
              Home
            </router-link>
          </li>
          <li class="mr-2">
            <router-link :to="{ name: RouteNames.LISTBUCKETS }">
              My Buckets
            </router-link>
          </li>
          <li class="mr-2">
            <router-link :to="{ name: RouteNames.DEVELOPER }">
              Developer
            </router-link>
          </li>
        </ol>
      </template>
    </Toolbar>

    <!-- Breadcrumb
         Removed for now -->
    <!-- <div>
      <Breadcrumb
        :home="home"
        :model="items"
        aria-label="breadcrumb"
      />
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
.p-toolbar {
  padding: 0px 50px 0px 50px;
}
</style>
