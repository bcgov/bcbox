<script setup lang="ts">
import { differenceInSeconds } from 'date-fns';
import { computed, onMounted, ref } from 'vue';
import { formatDateLong } from '@/utils/formatters';


import { InlineMessage } from '@/lib/primevue';
import { useBucketStore } from '@/store';
import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Types
type Props = { bucketId?: string; };

// Props
const props = withDefaults(defineProps<Props>(), {
  bucketId: '',
});

// Store
const bucketStore = useBucketStore();

// State
const bucket: Ref<Bucket | undefined> = computed(() => bucketStore.getBucket(props.bucketId));
const lastSyncRequestedDate: Ref<string> = ref(bucket.value?.lastSyncRequestedDate || '');
const syncQueueSize: Ref<number> = ref(0);
const message: Ref<string> = ref('');

onMounted(async () => {
  // get queue size from COMS
  syncQueueSize.value = await bucketStore.syncBucketStatus(props.bucketId);
  // trigger bucket sync if last bucket sync > 1 hour
  const last = new Date(lastSyncRequestedDate.value);
  const now = new Date();
  const since = differenceInSeconds(now, last);
  if(since > 3600){
    await bucketStore.syncBucket(props.bucketId, false );
    message.value =  '<strong>Sync in progress.</strong> <a href="">refresh page</a>';
  }
  else if(syncQueueSize.value > 0){
    message.value =  `<strong>Sync in progress.</strong> ${syncQueueSize.value} files
    remaining. <a href="">refresh page</a>`;
  }
  else {
    message.value = `Last synced: ${formatDateLong(lastSyncRequestedDate.value)}`;
  }
});
</script>
<template>
  <div class="bucket-sync-status">
    <InlineMessage severity="info">
      <!-- eslint-disable vue/no-v-html -->
      <div v-html="message" />
      <!--eslint-enable-->
    </InlineMessage>
  </div>
</template>
<style scoped lang="scss">
</style>
