<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { Button } from '@/lib/primevue';
import { useConfigStore } from '@/store';

// Store
const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <div class="gov-footer flex justify-content-between">
    <div>
      <Button
        id="footer-home"
      >
        <a
          href="https://www.gov.bc.ca/"
          target="_blank"
        >Home</a>
      </Button>
      <Button
        id="footer-about"
      >
        <a
          href="https://www2.gov.bc.ca/gov/content/about-gov-bc-ca"
          target="_blank"
        >About gov.bc.ca</a>
      </Button>
      <Button
        id="footer-disclaimer"
      >
        <a
          href="http://gov.bc.ca/disclaimer"
          target="_blank"
        >Disclaimer</a>
      </Button>
      <Button
        id="footer-privacy"
      >
        <a
          href="http://gov.bc.ca/privacy"
          target="_blank"
        >Privacy</a>
      </Button>
      <Button
        id="footer-accessibility"
      >
        <a
          href="http://gov.bc.ca/webaccessibility"
          target="_blank"
        >Accessibility</a>
      </Button>
      <Button
        id="footer-copyright"
      >
        <a
          href="http://gov.bc.ca/copyright"
          target="_blank"
        >Copyright</a>
      </Button>
      <Button
        id="footer-contact"
      >
        <a
          href="https://www2.gov.bc.ca/gov/content/home/contact-us"
          target="_blank"
        >Contact Us</a>
      </Button>
    </div>
    <div
      v-if="getConfig"
      class="flex align-items-center justify-content-center text-white mr-3"
    >
      v{{ getConfig.version }}-{{ getConfig.gitRev.substring(0, 8) }}
    </div>
  </div>
</template>
