<script setup lang="ts">
import { onMounted, ref, Ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';

import { useConfigStore, useUserStore } from '@/store';
import { Regex } from '@/utils/constants';
import type { IdentityProvider, User, UserPermissions } from '@/interfaces';

// Props
const props = defineProps<{
  permissions: UserPermissions[];
}>();

// Store
const userStore = useUserStore();
const { config } = storeToRefs(useConfigStore());
const { userSearch } = storeToRefs(useUserStore());

// State
const selectedIDP: Ref<IdentityProvider | null> = ref(null);
const selectedUser: Ref<User | null> = ref(null);
const selectedUserIsInvalid: Ref<boolean> = ref(false);
const userSearchInput: Ref<string | undefined> = ref('');
const userSearchPlaceholder: Ref<string | undefined> = ref('');

// Emits
const emit = defineEmits(['add-user', 'cancel-search-users']);

// Functions
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
  emit('add-user', selectedUser.value);
  onReset();
};

const onCancel = () => {
  onReset();
  emit('cancel-search-users');
};

const onChange = (event: any) => {
  // Duplicate user check
  if( !props.permissions.some(perm => perm.userId === event.value?.userId) ) {
    // Set state
    selectedUser.value = event.value;
  }
  else {
    // Invalid
    selectedUserIsInvalid.value = true;
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

const onReset = () => {
  userStore.clearSearch();

  selectedUser.value = null;
  selectedUserIsInvalid.value = false;
  userSearchInput.value = '';
};

watch(selectedIDP, () => {
  if( selectedIDP.value?.searchable ) {
    userSearchPlaceholder.value = `Enter an existing ${selectedIDP.value?.name} user's name or email address`;
  }
  else {
    userSearchPlaceholder.value = `Enter an existing user's ${selectedIDP.value?.name} email address`;
  }
});

onMounted(() => {
  // Set default IDP
  selectedIDP.value = config.value.idpList[0];

  onReset();
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
          @click="onReset"
        />
        <label :for="idp.idp">{{ idp.name }}</label>
      </div>
    </div>
    <div v-else>
      <Dropdown
        v-model="selectedIDP"
        :options="config.idpList"
        :option-label="(option) => {return `${option.name} (${option.elevatedRights ? 'internal': 'external' })`}"
        class="mt-1"
        @change="onReset"
      />
    </div>

    <Dropdown
      v-model="userSearchInput"
      :options="userSearch"
      :option-label="(option) => getUserDropdownLabel(option)"
      :editable="true"
      :placeholder="userSearchPlaceholder"
      class="mt-1 mb-4"
      :class="selectedUserIsInvalid ? 'p-invalid' : ''"
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
      @click="onCancel"
    />
  </div>
</template>

<style lang="scss" scoped>
.p-dropdown {
  width: 60%;
}
</style>
