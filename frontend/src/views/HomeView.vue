<script setup lang="ts">
import { Message } from '@/lib/primevue';
import { storeToRefs } from 'pinia';

import { Button } from '@/lib/primevue';
import { useAuthStore, useConfigStore } from '@/store';
import { RouteNames } from '@/utils/constants';

// Store
const { getIsAuthenticated } = storeToRefs(useAuthStore());
const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <Message
    v-if="getConfig?.notificationBanner"
    severity="warn"
  >
    {{ getConfig?.notificationBanner }}
  </Message>

  <div class="flex flex-column mr-8 ml-8">
    <div class="flex justify-content-center mb-5">
      <h1 class="font-bold">
        Store and share files in BCBox
      </h1>
    </div>
    <div class="flex justify-content-center mb-5">
      <p class="text-xl text-center">
        This website uses the <a href="https://bcgov.github.io/common-service-showcase/services/coms.html">Common Object Management Service</a> so
        <a href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/id-services/idir">IDIR</a> and <a href="https://www.bceid.ca/">BCeID</a>
        users can <br /> upload and share files.
      </p>
    </div>
    <div class="flex justify-content-center mb-5">
      <router-link
        :to="{ name: RouteNames.LIST_BUCKETS }"
        class="no-underline"
      >
        <Button>
          {{ getIsAuthenticated ? 'Go to My Buckets' : 'Log in to get started' }}
        </Button>
      </router-link>
    </div>
    <div class="flex justify-content-center mb-8">
      <img
        src="@/assets/images/home_1.png"
        class="border-1 drop-shadow"
        width="60%"
      />
    </div>
    <div class="grid mb-8">
      <div class="col-6 pr-5">
        <div class="flex align-items-left mb-2">
          <h1 class="font-bold">
            Upload and download objects
          </h1>
        </div>
        <div class="flex align-items-left">
          <p class="text-xl">
            With BCBox, you can use low-cost object storage for your files,
            images and documents.
          </p>
        </div>
      </div>
      <div class="col-6 pl-5">
        <div class="flex align-items-center">
          <img
            src="@/assets/images/home_2.png"
            class="border-1 drop-shadow"
          />
        </div>
      </div>
    </div>
    <div class="grid mb-8">
      <div class="col-6 pr-5">
        <div class="flex align-items-left mb-2">
          <h1 class="font-bold">
            Manage access and share
          </h1>
        </div>
        <div class="flex align-items-left">
          <p class="text-xl">
            You can assign custom permissions to other users through IDIR or BCeID authentication.<br /><br />
            IDIR users can also choose to share files with public links.
            Contact your organization's privacy and security teams to see if this fits your intended use.
            Make sure you don't upload personal or private information without the consent of your Ministry
            Privacy Officer.
          </p>
        </div>
      </div>
      <div class="col-6 pl-5">
        <div class="flex">
          <img
            src="@/assets/images/home_3.png"
            class="border-1 drop-shadow"
          />
        </div>
      </div>
    </div>
    <div class="flex justify-content-center mb-5">
      <h1 class="font-bold">
        Versioning, metadata, tagging, syncing with existing buckets and more
      </h1>
    </div>
    <div
      class="flex justify-content-center mb-3"
      style="height: 32px"
    >
      <p class="text-xl">
        We continue to expand the features of BCBox. Stay tuned for documentation on our <a
          target="_blank"
          href="https://github.com/bcgov/bcbox/wiki"
        >wiki</a>.<br /><br />
      </p>
    </div>
    <div class="flex justify-content-center mb-8 text-xl">
      <ul>
        <li>
          Need a bucket? Contact <a href="mailto: NRIDS.Optimize@gov.bc.ca">NRIDS Optimization</a>
          (Natural Resource ministries) or your <br /> ministry's service desk
        </li>
        <li>
          See BCBox on
          <a
            href="https://github.com/bcgov/bcbox"
            target="_blank"
          >Github</a>
        </li>
        <li>
          Learn more about the
          <a
            href="https://bcgov.github.io/common-service-showcase/"
            target="_blank"
          >Common Services Showcase Team</a>
        </li>
        <li>
          Email the <a href="mailto: nrm.commonserviceshowcase@gov.bc.ca">Common Services Showcase Team</a>
          with questions or feedback
        </li>
      </ul>
    </div>
    <div class="flex justify-content-center mb-8">
      <router-link
        :to="{ name: RouteNames.LIST_BUCKETS }"
        class="no-underline"
      >
        <Button>
          {{ getIsAuthenticated ? 'Go to My Buckets' : 'Log in to get started' }}
        </Button>
      </router-link>
    </div>
    <div class="flex justify-content-center mb-5">
      <h1 class="font-bold">
        Terms of Use
      </h1>
    </div>
    <div class="flex justify-content-left mb-5 text-xl">
      <ul>
        <li>
          It is your responsibility to comply with Privacy laws governing the collection,
          use and disclosure of personally identifiable information
        </li>
        <li>
          Access to this tool does not inherently grant permission to collect,
          use or disclose any personally identifiable information
        </li>
        <li>
          It is your responsibility to obtain consent to collect information as required by law
        </li>
        <li>
          Before uploading and distributing files you are required to discuss your intention with your <a
            href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/resources/privacy-officers"
            target="_blank"
          >Ministry Privacy Officer</a> and to complete assessments as required.
          If you intend to advise users to access with BCeID, please send an email to the
          <a href="mailto: IDIM.Consulting@gov.bc.ca">Provincial Identity Information Management Program</a>
          indicating your intentions
        </li>
        <li>
          Storage and custodianship of metadata and tags (not the objects themselves in your bucket)
          is maintained by Natural Resource Information & Digital Services
        </li>
        <li>
          You will refer to and adhere to <a
            href="https://www2.gov.bc.ca/gov/content/data/about-data-management/databc"
            target="_blank"
          >DataBC</a> requirements for public file sharing
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
img {
  max-width: 100%;
}
</style>
