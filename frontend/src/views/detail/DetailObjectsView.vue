<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import ObjectFileDetails from '@/components/object/ObjectFileDetails.vue';
import { useAuthStore, useObjectStore, usePermissionStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';

// Props
type Props = {
  objectId: string
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const { getIsAuthenticated, getUserId } = storeToRefs(useAuthStore());

// State
const ready: Ref<boolean> = ref(false);
const isPublic: Ref<boolean> = ref(false);

// Actions
onBeforeMount( async () => {
  const router = useRouter();

  if( props.objId ) {
    const head = await objectStore.headObject(props.objId);
    isPublic.value = head?.status === 204;

    if( isPublic.value && !getIsAuthenticated.value ) {
      ready.value = true;
    }
    else {
      if( !getIsAuthenticated.value ) {
        router.replace({ name: RouteNames.LOGIN });
      }
      else {
        await permissionStore.fetchBucketPermissions({userId: getUserId.value});
        await objectStore.fetchObjects({objId: props.objId, userId: getUserId.value});
        const obj = objectStore.findObjectById(props.objId);
        const bucketId = obj?.bucketId;

        if( !isPublic.value &&
          ( !obj || !permissionStore.isObjectActionAllowed(obj.id, getUserId.value, Permissions.READ, bucketId) ) ) {
          router.replace({ name: RouteNames.FORBIDDEN });
        }
        else {
          ready.value = true;
        }
      }
    }
  }
  else {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
});
</script>

<template>
  <div v-if="ready">
    <div v-if="getIsAuthenticated">
      <ObjectFileDetails
        v-if="objId"
        :obj-id="props.objId"
      />
      <div v-else>
        <h3>No object provided</h3>
      </div>
    </div>
    <div v-else-if="isPublic && !getIsAuthenticated">
      <h3>Public file. COMS API does not currently allow unauthenticated users to fetch data.</h3>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h3 {
  font-weight: bold;
}
</style>
