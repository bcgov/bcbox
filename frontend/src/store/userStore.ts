import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { userService } from '@/services';
import { useAppStore } from '@/store';

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
  async function listIdps() {
    try {
      appStore.beginIndeterminateLoading();
      state.idps.value = (await userService.listIdps()).data;
    } catch (error) {
      console.error(`listIdps error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function searchUsers(params: object) {
    try {
      appStore.beginIndeterminateLoading();
      const response = (await userService.searchForUsers(params)).data;

      // Filter out any user without an IDP
      state.userSearch.value = response.filter((x: User) => x.identityId !== null);
    } catch (error) {
      console.error(`searchUsers error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
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
    listIdps,
    searchUsers
  };
}, { persist: true });

export default useUserStore;
