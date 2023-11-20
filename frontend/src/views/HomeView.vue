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
  <div class="grid">
    <div class="text-center col-12 lg:col-10 lg:col-offset-1">
      <Message
        v-if="getConfig?.notificationBanner"
        severity="warn"
      >
        {{ getConfig?.notificationBanner }}
      </Message>
      <h1 class="mb-4">Store and share files in BCBox</h1>
      <p class="text-xl">
        This website uses the
        <a href="https://bcgov.github.io/common-service-showcase/services/coms.html">
          Common Object Management Service
        </a>
        so
        <a
          href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/id-services/idir"
        >
          IDIR
        </a>
        and
        <a href="https://www.bceid.ca/">BCeID</a>
        users can upload and share files.
        <br />
        <br />
        You will need access to a bucket – a file storage container – before you can use BCBox. If you are new to
        buckets and don't know a bucket manager, contact
        <a href="https://apps.nrs.gov.bc.ca/int/jira/servicedesk/customer/portal/1/create/701">NRIDS Optimization</a>
        (NRM only) or your ministry's service desk to get credentials for a bucket. Then come back, log in, and add it
        in BCBox.
        <br />
        <br />
        If you already have a bucket from outside of BCBox, you can't yet work on existing files from that bucket in
        BCBox, but we are currently working to make this possible through synchronization.
      </p>

      <div class="flex flex-column justify-content-center align-items-center mb-4">
        <router-link :to="{ name: RouteNames.LIST_BUCKETS }">
          <Button>
            {{ getIsAuthenticated ? 'Go to My Buckets' : 'Log in to get started' }}
          </Button>
        </router-link>

        <img
          src="@/assets/images/home_1.png"
          class="border-1 drop-shadow w-6 sm:col-10 my-6 flex align-items-center"
          alt="Screenshot of BCBox's file list interface:
            a list of example files and possible actions including Upload, Download and Delete."
        />
        <h2 class="mb-4">Ongoing feature enhancements</h2>

        <p class="text-xl">
          BCBox is constantly improving! See BCBox's
          <a href="https://github.com/bcgov/bcbox/wiki">Help</a>
          for more information, a link to our Product Roadmap, and documentation of features as they are implemented.
        </p>
      </div>

      <div class="grid mb-8 text-left">
        <div class="col-6 pr-5">
          <h3 class="mb-3">Upload and download objects</h3>
          <p class="text-xl">With BCBox, you can use low-cost object storage for your files, images and documents.</p>
        </div>

        <div class="col-6">
          <img
            src="@/assets/images/home_2.png"
            class="border-1 drop-shadow"
            alt="Screenshot of BCBox's upload interface: a drag-and-drop area,
                possible actions including Choose, Start Upload and Close."
          />
        </div>
      </div>

      <div class="grid mb-4 text-left">
        <div class="col-6">
          <h3 class="mb-3">Manage access and share</h3>
          <p class="text-xl">
            You can assign custom permissions to other users through IDIR or BCeID authentication.
            <br />
            <br />
            IDIR users can also choose to share files with public links. Contact your organization's privacy and
            security teams to see if this fits your intended use. Make sure you don't upload personal or private
            information without the consent of your Ministry Privacy Officer.
          </p>
        </div>
        <div class="col-6 pl-5">
          <img
            src="@/assets/images/home_3.png"
            class="border-1 drop-shadow"
            alt="Screenshot of BCBox's share interface,
                    demonstrating a share link and QR code."
          />
        </div>
      </div>

      <div class="flex flex-column justify-content-center align-items-center">
        <h3 class="mb-4">Versioning, metadata, tagging, syncing with existing buckets and more</h3>

        <p class="text-xl">
          Contact
          <a
            href="https://apps.nrs.gov.bc.ca/int/jira/servicedesk/customer/portal/1/create/701"
            target="_blank"
          >
            NRIDS Optimization
          </a>
          or your ministry's service desk. You will need a bucket to get started.
        </p>

        <router-link :to="{ name: RouteNames.LIST_BUCKETS }">
          <Button>
            {{ getIsAuthenticated ? 'Go to My Buckets' : 'Log in to BCBox' }}
          </Button>
        </router-link>

        <h2 class="mt-8 mb-4">Terms of Use</h2>
        <div class="text-left">
          <ul>
            <li>
              It is your responsibility to comply with the
              <a
                href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96165_03#part3"
                target="_blank"
              >
                Freedom of Information and Protection of Privacy Act
              </a>
              governing the collection, use and disclosure of personally identifiable information
            </li>
            <li>
              Access to this tool does not inherently grant permission to collect, use or disclose any personally
              identifiable information
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
              >
                Ministry Privacy Officer
              </a>
              and to complete assessments as required
            </li>
            <li>
              If you intend to advise users to access with BCeID, please send an email to the
              <a href="mailto:IDIM.Consulting@gov.bc.ca">Provincial Identity Information Management Program</a>
              indicating your BCeID-related intentions
            </li>
            <li>
              All other inquiries around getting or using buckets should be directed to
              <a
                href="https://apps.nrs.gov.bc.ca/int/jira/servicedesk/customer/portal/1/create/701"
                target="_blank"
              >
                NRIDS Optimization
              </a>
              (Natural Resource ministries) or your ministry's service desk
            </li>
            <li>
              Storage and custodianship of metadata and tags (not the objects themselves in your bucket) is maintained
              by Natural Resource Information & Digital Services
            </li>
            <li>
              You will refer to and adhere to
              <a
                href="https://www2.gov.bc.ca/gov/content/data/about-data-management/databc"
                target="_blank"
              >
                DataBC
              </a>
              requirements for public file sharing
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
img {
  max-width: 100%;
}
ul li {
  margin-bottom: 1rem;
}
</style>
