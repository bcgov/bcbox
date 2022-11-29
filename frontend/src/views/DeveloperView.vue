<script setup lang="ts">
import { storeToRefs } from 'pinia';
// PrimeVue
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
// State
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';
import { useUserStore } from '@/store/userStore';

const { config } = storeToRefs(useConfigStore());
const { getKeycloak } = storeToRefs(useAuthStore());
const userStore = useUserStore();
const { loading, idps } = storeToRefs(useUserStore());

const toast = useToast();

const getIdps = async () => {
  try {
    await userStore.listIdps();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error calling list IDPs endpoint example', detail: error, life: 3000 });
  }
};

const testBad = async () => {
  try {
    await userStore.testBad();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Intentional error calling COMS', detail: error, life: 3000 });
  }
};
</script>

<template>
  <h2>Developer</h2>
  <div>
    <h3>Temp for testing API call to COMS</h3>
    <Button label="Call COMS" @click="getIdps" :loading="loading" />
    <div v-if="loading">
      <ProgressSpinner />
    </div>
    <div v-else>
      <span v-if="idps.length">{{ idps }}</span>
    </div>

    <h3>Bad call</h3>
    <Button label="Fail in calling COMS - 404" @click="testBad" :loading="loading" />
    <div v-if="loading">
      <ProgressSpinner />
    </div>

    <h3>Config</h3>
    {{ config }}

    <h3>Token</h3>
    {{ getKeycloak.token }}

    <h3>Parsed Token</h3>
    {{ getKeycloak.tokenParsed }}
  </div>
</template>

<style lang="scss" scoped>
h3 {
  margin-top: 1em;
}
</style>
