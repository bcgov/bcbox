<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/authStore';
const { getAuthenticated } = storeToRefs(useAuthStore());
</script>

<template>
  <div v-if="getAuthenticated">
    <Toolbar>
      <template #start>
        <ol class="list-none m-0 p-0 flex flex-row align-items-center font-semibold">
          <li class="mr-2"><router-link :to="{ name: 'home' }">Home</router-link></li>
          <!-- <li class="mr-2"><router-link :to="{ name: 'myObjects' }">My Objects</router-link></li> -->
          <li class="mr-2"><router-link :to="{ name: 'developer' }">Developer</router-link></li>
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
