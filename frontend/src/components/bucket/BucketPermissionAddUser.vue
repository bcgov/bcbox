<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';

import { useBucketStore, useConfigStore, useUserStore } from '@/store';
import { Regex } from '@/utils/constants';
import type { IdentityProvider, User } from '@/interfaces';

// Store
const userStore = useUserStore();
const { permissions } = storeToRefs(useBucketStore());
const { config } = storeToRefs(useConfigStore());
const { userSearch } = storeToRefs(useUserStore());

// State
const showUserExistError: Ref<boolean> = ref(false);
const selectedUser: Ref<User | null> = ref(null);
const selectedIDP: Ref<IdentityProvider | null> = ref(null);
const userSearchInput: Ref<string | undefined> = ref('');

// Emits
const emit = defineEmits(['cancel-bucket-permission-add-user']);

// Functions
const cancelBucketPermissionAddUser = () => {
  reset();
  emit('cancel-bucket-permission-add-user');
};

const getUserDropdownLabel = (option: User) => {
  if( selectedIDP.value?.idp ) {
    if( selectedIDP.value.searchable ) {
      return `${option.fullName} [${option.email}]`;
    }
    else {
      return option.email;
    }
  }
};

const onAdd = () => {
  if(selectedUser.value !== null) {
    permissions.value.push({
      userId: selectedUser.value.userId,
      elevatedRights: config.value.idpList.find((idp: any) => {
        return idp.idp === selectedUser.value?.idp;
      })?.elevatedRights,
      fullName: selectedUser.value.fullName,
      create: false,
      read: false,
      update: false,
      delete: false,
      manage: false
    });

    reset();
  }
};

const onChange = (event: any) => {
  // Duplicate user check
  if( !permissions.value.some(e => e.userId === event.value?.userId) ) {
  // Set state
    selectedUser.value = event.value;
  }
  else {
    // Invalid
    showUserExistError.value = true;
  }

  // Keeps the search input as the email instead of swapping to the username
  userSearchInput.value = event.value?.email;
};

const onInput = async (event: any) => {
  const input: string = event.target.value;
  if( selectedIDP.value?.idp ) {
    if( selectedIDP.value.searchable ) {
      if( input.length >= 3 ) {
        await userStore.searchUsers({ idp: selectedIDP.value.idp, search: input });
      }
    }
    else {
      if( input.match( Regex.Email ) ) {
        await userStore.searchUsers({ idp: selectedIDP.value.idp, email: input });
      }
    }
  }
};

const reset = () => {
  userStore.clearSearch();
  selectedUser.value = null;
  userSearchInput.value = '';
  showUserExistError.value = false;
};

onMounted(() => {
  // Set default IDP
  selectedIDP.value = config.value.idpList[0];

  reset();
});
</script>

<template>
  <div>
    <div v-if="config.idpList.length <= 3">
      <div
        v-for="idp of config.idpList"
        :key="idp.idp"
        class="field-radiobutton mt-1"
      >
        <RadioButton
          v-model="selectedIDP"
          :input-id="idp.idp"
          name="idp"
          :value="idp"
          @click="reset"
        />
        <label :for="idp.idp">{{ idp.description }}</label>
      </div>
    </div>
    <div v-else>
      <Dropdown
        v-model="selectedIDP"
        :options="config.idpList"
        option-label="description"
        class="mt-1"
        @change="reset"
      />
    </div>

    <Dropdown
      v-model="userSearchInput"
      :options="userSearch"
      :option-label="(option) => getUserDropdownLabel(option)"
      :editable="true"
      :placeholder="selectedIDP?.searchPlaceholder"
      class="mt-1 mb-4"
      :class="showUserExistError ? 'p-invalid' : ''"
      @input="onInput"
      @change="onChange"
    />
    <Button
      label="Add"
      class="mt-1 mb-4 ml-3"
      icon="pi pi-check"
      :disabled="!selectedUser"
      @click="onAdd"
    />
    <Button
      label="Cancel"
      class="p-button-outlined mt-1 mb-4 ml-3"
      icon="pi pi-times"
      @click="cancelBucketPermissionAddUser"
    />
  </div>
</template>

<style lang="scss" scoped>
.p-dropdown {
  width: 60%;
}
</style>
