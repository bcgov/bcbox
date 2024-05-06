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
const title: Ref<string> = ref('');
const detail: Ref<string> = ref('');

// Actions
const toast = useToast();

const setErrorMessage = (errorCode: number): void => {
  switch (errorCode) {
    case 401:
      title.value = 'Unauthorized';
      detail.value = 'Invalid authorization credentials';
      break;
    case 403:
      title.value = 'Forbidden';
      detail.value = 'The person who sent you the link may have restricted it to another email address';
      break;
    case 404:
      title.value = 'Not found';
      detail.value = 'Invitation not found or has expired';
      break;
    case 409:
      title.value = 'Not found';
      detail.value = 'Invalid object or folder';
      break;
    case 410:
      title.value = 'Gone';
      detail.value = 'Invitation has expired';
      break;
    default:
      title.value = 'Invalid Invite';
      detail.value = 'This invite link is not valid or has expired';
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
      if (errData.status) {
        toast.error(errData.status, errData.detail);
        setErrorMessage(errData.status);
      }
      invalidInvite.value = true;
    });
});
</script>

<template>
  <div>
    <div v-if="invalidInvite">
      <Message
        v-if="getConfig?.notificationBanner"
        severity="warn"
      >
        {{ getConfig?.notificationBanner }}
      </Message>
      <h1>{{ title }}</h1>
      <div>{{ detail }}</div>
      <div class="text-center">
        <router-link :to="{ name: RouteNames.LIST_BUCKETS }">
          <Button class="text-center mt-5">
            {{ 'Go to my files' }}
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
