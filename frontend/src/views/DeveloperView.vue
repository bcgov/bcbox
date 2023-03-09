<script setup lang="ts">
import { storeToRefs } from 'pinia';

import CopyToClipboard from '@/components/form/CopyToClipboard.vue';
import { useAuthStore, useConfigStore } from '@/store';
import { ButtonMode } from '@/utils/enums';

// Store
const { getAccessToken, getProfile } = storeToRefs(useAuthStore());
const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <h2>Developer</h2>
  <div>
    <div class="flex mt-3">
      <h3>Config</h3>
      <CopyToClipboard
        :mode="ButtonMode.ICON"
        :to-copy="JSON.stringify(getConfig)"
      />
    </div>
    {{ getConfig }}

    <div class="flex mt-3">
      <h3>Token</h3>
      <CopyToClipboard
        :mode="ButtonMode.ICON"
        :to-copy="getAccessToken"
      />
    </div>
    {{ getAccessToken }}

    <div class="flex mt-3">
      <h3>Profile</h3>
      <CopyToClipboard
        :mode="ButtonMode.ICON"
        :to-copy="JSON.stringify(getProfile)"
      />
    </div>
    {{ getProfile }}
  </div>
</template>

<style lang="scss" scoped>
h3 {
  margin-top: 1em;
}
</style>
