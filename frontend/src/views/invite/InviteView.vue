<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { Button, Message, useToast } from '@/lib/primevue';
import { inviteService } from '@/services';
import { useConfigStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';

// Types
interface ErrorType {
  [key: string]: {
    title: string;
    detail: string;
  };
}

// Props
type Props = {
  token: string;
};

const props = withDefaults(defineProps<Props>(), {
  token: undefined
});

const router = useRouter();

// Store
const { getConfig } = storeToRefs(useConfigStore());

// State
const invalidInvite: Ref<boolean> = ref(false);
const title: Ref<string> = ref('Invalid Invite');
const detail: Ref<string> = ref('Please check your link again');

// Actions
const toast = useToast();

const errorMessage: ErrorType = {
  401: {
    title: 'Unauthorized',
    detail: 'Invalid authorization credentials'
  },
  403: {
    // wrong email
    title: 'Forbidden',
    detail: 'The person who sent you the link may have restricted it to another email address'
  },
  404: {
    // invitation not found/expired
    title: 'Not found',
    detail: 'Invitation not found or has expired'
  },
  409: {
    // bucket/object not found
    // TODO: display specifically object or bucket
    title: 'Not found',
    detail: 'Invalid object or bucket'
  }
};

onMounted(() => {
  inviteService
    .getInvite(props.token)
    .then((response: any): void => {
      if (response.data.type === 'bucketId') {
        router.replace({
          name: RouteNames.LIST_OBJECTS,
          query: {
            bucketId: response.data.resource
          }
        });
      } else if (response.data.type === 'objectId') {
        router.replace({
          name: RouteNames.DETAIL_OBJECTS,
          query: {
            objectId: response.data.resource
          }
        });
      }
    })
    .catch((error: any) => {
      const errData = error?.response?.data;
      if (errData) {
        toast.error(errData.status, errData.detail);
        title.value = errorMessage[errData.status]['title'];
        detail.value = errorMessage[errData.status]['detail'];
      }

      invalidInvite.value = true;
    });
});
</script>

<template>
  <div>
    <Message
      v-if="getConfig?.notificationBanner"
      severity="warn"
    >
      {{ getConfig?.notificationBanner }}
    </Message>

    <div v-if="invalidInvite">
      <h1>{{ title }}</h1>
      <div>{{ detail }}</div>
      <div class="text-center">
        <router-link :to="{ name: RouteNames.LIST_BUCKETS }">
          <Button class="text-center mt-5">
            {{ 'Go to My Buckets' }}
          </Button>
        </router-link>
      </div>
    </div>
    <div v-else>
      <h1 class="text-center mt-8">Processing...</h1>
      <Spinner />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.p-progress-spinner {
  display: flex;
  margin-top: 4rem;
  position: relative;
}
</style>
