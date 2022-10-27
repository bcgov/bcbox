<script setup lang="ts">
import { RouterView } from 'vue-router';
import BCGovHeader from '@/components/bcgov/BCGovHeader.vue';
import Navbar from '@/components/Navbar.vue';
import { useAuthStore } from '@/store/authStore';
const authStore = useAuthStore();
</script>

<template>
  <div>
    <BCGovHeader />
    <div v-if="authStore.isLoggedIn">
      <Navbar />
    </div>
    <div class="container">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.container {
  padding-top: 20px;
  padding-left: 100px;
  padding-right: 100px;
}
</style>
