import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { userService } from '@/services';
import { useAppStore } from '@/store';
import { error } from '@/services/toastService';

import type { Ref } from 'vue';
import type { IdentityProvider, User } from '@/types';

export type UserStoreState = {
  currentUser: Ref<User | null>;
  idps: Ref<Array<IdentityProvider>>;
  userSearch: Ref<Array<User>>;
}

export const useUserStore = defineStore('user', () => {
  // Store
  const appStore = useAppStore();

  // State
  const state: UserStoreState = {
    currentUser: ref(null),
    idps: ref([]),
    userSearch: ref([]),
  };

  // Getters
  const getters = {
    getIdps: computed(() => state.idps.value),
    getUserSearch: computed(() => state.userSearch.value),
  };

  // Actions
  async function fetchUsers(params: object) {
    try {
      appStore.beginIndeterminateLoading();
      const response = (await userService.searchForUsers(params)).data;

      // Filter out any user without an IDP
      state.userSearch.value = response.filter((x: User) => !!x.identityId);
    }
    catch (e: any) {
      error('Searching users', e);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  function clearSearch() {
    state.userSearch.value = [];
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    clearSearch,
    fetchUsers
  };
}, { persist: true });

export default useUserStore;
