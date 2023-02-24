<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';

import { useAuthStore, useConfigStore, useUserStore } from '@/store';

const { getAccessToken, getProfile } = useAuthStore();
const { getConfig } = useConfigStore();
const { listIdps } = useUserStore();
const { loading, idps } = storeToRefs(useUserStore());

const toast = useToast();

const getIdps = async () => {
  try {
    await listIdps();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error calling list IDPs endpoint example', detail: error, life: 3000 });
  }
};
</script>

<template>
  <h2>Developer</h2>
  <div>
    <h3>Temp for testing API call to COMS</h3>
    <Button
      label="Call COMS"
      :loading="loading"
      @click="getIdps"
    />
    <div v-if="loading">
      <ProgressSpinner />
    </div>
    <div v-else>
      <span v-if="idps.length">{{ idps }}</span>
    </div>

    <h3>Config</h3>
    {{ getConfig }}

    <h3>Token</h3>
    {{ getAccessToken }}

    <h3>Profile</h3>
    {{ getProfile }}
  </div>
</template>

<style lang="scss" scoped>
h3 {
  margin-top: 1em;
}
</style>
