<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { Toolbar } from '@/lib/primevue';
import { useAuthStore } from '@/store';
import { RouteNames } from '@/utils/constants';

const { getIsAuthenticated, getProfile } = storeToRefs(useAuthStore());
</script>

<template>
  <nav class="navigation-main lg:px-7">
    <Toolbar>
      <template #start>
        <ol class="list-none m-0 p-0 flex flex-row align-items-center font-semibold">
          <!-- hide Home nav for non-idir users-->
          <li
            v-if="!getIsAuthenticated || (getIsAuthenticated && getProfile?.identity_provider === 'idir')"
            class="mr-2"
          >
            <router-link :to="{ name: RouteNames.HOME }">Home</router-link>
          </li>
          <li
            v-if="getIsAuthenticated"
            class="mr-2"
          >
            <router-link
              :to="{ name: RouteNames.LIST_BUCKETS }"
              aria-label="My files"
            >
              My Files
            </router-link>
          </li>
          <li
            v-if="getIsAuthenticated"
            class="mr-2"
          >
            <router-link
              :to="{ name: RouteNames.LIST_OBJECTS_DELETED }"
              aria-label="Recycle Bin"
            >
            Recycle Bin
            </router-link>
          </li>
          <li class="mr-2">
            <a
              target="_blank"
              href="https://github.com/bcgov/bcbox/wiki"
              aria-label="BCBox help"
            >
              Help
            </a>
          </li>
        </ol>
      </template>
    </Toolbar>

    <!-- Breadcrumb
         Removed for now -->
    <!-- <div>
      <Breadcrumb
        :home="home"
        :model="items"
        aria-label="breadcrumb"
      />
    </div> -->
  </nav>
</template>

<style lang="scss" scoped>
.navigation-main {
  background-color: #38598a;
  color: #fcba19;
  display: flex;
  width: 100%;
  box-shadow: 0 6px 8px -4px #b3b1b3;
  -webkit-box-shadow: 0 6px 8px -4px #b3b1b3;
  -moz-box-shadow: 0 6px 8px -4px #b3b1b3;
  .p-toolbar {
    background-color: #38598a !important;
    border: none;
    padding: 0;
    ol {
      display: flex;
      flex-direction: row;
      margin: 0;
      color: #ffffff;
      list-style: none;
      li {
        a {
          display: flex;
          font-weight: normal;
          min-height: 2rem;
          color: #ffffff;
          padding: 0.4rem 0.8rem 0.6rem 0.8rem;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
        & ~ li {
          margin-left: -0.6rem;
        }
      }
      .router-link-exact-active {
        background-color: #7ba2cc80;
        border-bottom: 2px solid #fcba19;
        font-weight: bold;
      }
    }
  }
}
</style>
