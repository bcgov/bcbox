<script setup lang="ts">
import { storeToRefs } from 'pinia';

import CopyToClipboard from '@/components/form/CopyToClipboard.vue';
import { Button, ProgressSpinner,useToast } from '@/lib/primevue';
import { useAppStore, useAuthStore, useConfigStore, useUserStore } from '@/store';
import { ButtonMode } from '@/utils/enums';

// Store
const userStore = useUserStore();
const { getAccessToken, getProfile } = storeToRefs(useAuthStore());
const { getConfig } = storeToRefs(useConfigStore());
const { getIsLoading } = storeToRefs(useAppStore());
const { getIdps } = storeToRefs(userStore);

// Actions
const toast = useToast();

const getIdpList = async () => {
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
      :loading="getIsLoading"
      @click="getIdpList"
    />
    <div v-if="getIsLoading">
      <ProgressSpinner />
    </div>
    <div v-else>
      <span v-if="getIdps.length">{{ getIdps }}</span>
    </div>

    <h3>Config</h3>
    {{ getConfig }}

    <div class="flex mt-3">
      <h3>Token</h3>
      <CopyToClipboard
        :mode="ButtonMode.ICON"
        :to-copy="getAccessToken"
      />
    </div>
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
