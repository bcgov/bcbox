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
  <h1>Developer</h1>
  <div>
    <div class="flex mt-3">
      <h2>Config</h2>
      <CopyToClipboard
        :mode="ButtonMode.ICON"
        :to-copy="JSON.stringify(getConfig)"
      />
    </div>
    {{ getConfig }}

    <div class="flex mt-3">
      <h2>Token</h2>
      <CopyToClipboard
        :mode="ButtonMode.ICON"
        :to-copy="getAccessToken"
      />
    </div>

    <div class="wrap-block">
      {{ getAccessToken }}
    </div>

    <div class="flex mt-3">
      <h2>Profile</h2>
      <CopyToClipboard
        :mode="ButtonMode.ICON"
        :to-copy="JSON.stringify(getProfile)"
      />
    </div>
    {{ getProfile }}
  </div>
</template>
