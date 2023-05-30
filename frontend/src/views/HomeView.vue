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
    <div class="flex justify-content-center mb-8 text-xl">
      <ul>
        <li>
          Contact <a
            href="https://apps.nrs.gov.bc.ca/int/jira/servicedesk/customer/portal/1/create/701"
            target="_blank"
          >NRIDS Optimization</a> or your ministry's service desk. You will need a bucket to get started.
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
          It is your responsibility to comply with the <a
            href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96165_03#part3"
            target="_blank"
          >Freedom of Information and Protection of Privacy Act</a>
          governing the collection, use and disclosure of personally identifiable information
        </li>
        <li>
          Access to this tool does not inherently grant permission to collect,
          use or disclose any personally identifiable information
        </li>
        <li>
          It is your responsibility to provide a Collection Notice to individuals before collecting personally
          identifiable information, as required by law
        </li>
        <li>
          Before uploading and distributing files you are required to discuss your privacy intentions with your
          <a
            href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/resources/privacy-officers"
            target="_blank"
          >Ministry Privacy Officer</a>
          and to complete assessments as required
        </li>
        <li>
          If you intend to advise users to access with BCeID, please send an email to the
          <a href="mailto:IDIM.Consulting@gov.bc.ca">Provincial Identity Information Management Program</a>
          indicating your BCeID-related intentions
        </li>
        <li>
          All other inquiries around getting or using buckets should be directed to <a
            href="https://apps.nrs.gov.bc.ca/int/jira/servicedesk/customer/portal/1/create/701"
            target="_blank"
          >NRIDS Optimization</a>
          (Natural Resource ministries) or your ministry's service desk
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
