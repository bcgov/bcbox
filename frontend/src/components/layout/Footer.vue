<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useConfigStore } from '@/store';

// Store
const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <div class="gov-footer flex justify-content-between">
    <div>
      <a
        href="https://www.gov.bc.ca/"
        target="_blank"
      >
        Home
      </a>
      <a
        href="https://www2.gov.bc.ca/gov/content/about-gov-bc-ca"
        target="_blank"
      >
        About gov.bc.ca
      </a>
      <a
        href="http://gov.bc.ca/disclaimer"
        target="_blank"
      >
        Disclaimer
      </a>
      <a
        href="http://gov.bc.ca/privacy"
        target="_blank"
      >
        Privacy
      </a>
      <a
        href="http://gov.bc.ca/webaccessibility"
        target="_blank"
      >
        Accessibility
      </a>
      <a
        href="http://gov.bc.ca/copyright"
        target="_blank"
      >
        Copyright
      </a>
      <a
        href="https://www2.gov.bc.ca/gov/content/home/contact-us"
        target="_blank"
      >
        Contact Us
      </a>
    </div>
    <div
      v-if="getConfig"
      class="version px-3 py-2"
    >
      v{{ getConfig.version }}{{ getConfig.gitRev ? '-' + getConfig.gitRev.substring(0, 8) : '' }}
    </div>
  </div>
</template>
