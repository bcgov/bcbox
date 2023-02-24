<script setup lang="ts">
import { storeToRefs } from 'pinia';
import CopyToClipboard from '@/components/form/CopyToClipboard.vue';
import { Button, ProgressSpinner,useToast } from '@/lib/primevue';
import { useAuthStore, useConfigStore, useUserStore } from '@/store';
import { ButtonMode } from '@/utils/enums';

const { getAccessToken, getProfile } = storeToRefs(useAuthStore());
const { getConfig } = storeToRefs(useConfigStore());

const userStore = useUserStore();
const { loading, idps } = storeToRefs(userStore);

// Actions
const toast = useToast();

const getIdps = async () => {
  try {
    await userStore.listIdps();
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
