<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import {
  ObjectMetadata,
  ObjectProperties,
  ObjectTag
} from '@/components/object';
import { Button } from '@/lib/primevue';
import { useAuthStore, useObjectStore, usePermissionStore, useTagStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';

// Props
type Props = {
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['close-object-info']);

// Store
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const tagStore = useTagStore();
const { getUserId } = storeToRefs(useAuthStore());

// Actions
const closeObjectInfo = async () => {
  emit('close-object-info');
};

watch( props, () => {
  const obj = objectStore.findObjectById(props.objectId);
  if( obj &&
     (obj.public || permissionStore.isObjectActionAllowed(obj.id, getUserId.value, Permissions.READ, obj.bucketId)))
  {
    tagStore.fetchTagging({objectId: props.objectId});
  }
}, { immediate: true });
</script>

<template>
  <div class="flex justify-content-start">
    <div class="flex col align-items-center heading">
      <font-awesome-icon
        icon="fa-solid fa-circle-info"
        style="font-size: 2rem"
      />
      <h1>File details</h1>
    </div>
    <div>
      <Button
        class="black"
        icon="pi pi-times"
        text
        rounded
        @click="closeObjectInfo"
      />
    </div>
  </div>
  <div class="pl-2 sidebar">
    <ObjectProperties
      :object-id="props.objectId"
      :full-view="false"
    />
    <ObjectMetadata
      :editable="false"
      :object-id="props.objectId"
    />
    <ObjectTag
      :editable="false"
      :object-id="props.objectId"
    />
    <div class="col-12 pl-0">
      <router-link
        v-slot="{ navigate }"
        custom
        :to="{ name: RouteNames.DETAIL_OBJECTS, query: { objectId: props.objectId } }"
      >
        <Button
          label="Primary"
          class="p-button-outlined"
          @click="navigate"
        >
          <font-awesome-icon icon="file-contract" />
          View all details
        </Button>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  padding-left: 1rem;
  font-weight: bold;
}

h2 {
  font-weight: bold;
}

.black {
  color: black;
}

button {
  margin-top: 15px;
  text-indent: 10px;
}
.heading svg{
  color: $bcbox-primary;
}
</style>
