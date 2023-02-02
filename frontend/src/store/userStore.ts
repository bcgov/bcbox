import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { userService } from '@/services';
import { useAuthStore, useConfigStore } from '@/store';

import type { Ref } from 'vue';
import type { IdentityProvider, User } from '@/interfaces';

export const useUserStore = defineStore('user', () => {
  const { getIdentityId } = useAuthStore();
  const { getKeycloak } = storeToRefs(useAuthStore());
  const { config } = storeToRefs(useConfigStore());

  // State
  const currentUser: Ref<User | null> = ref(null);
  const idps: Ref<Array<IdentityProvider>> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const userSearch: Ref<Array<User>> = ref([]);

  async function init() {
    await getUser();
  }

  // Hydrates the logged in users info from the COMS database
  async function getUser() {
    if (!currentUser.value && getKeycloak.value.authenticated) {
      if (getIdentityId()) {
        await searchUsers({ identityId: getIdentityId() });

        if (userSearch.value.length) {
          currentUser.value = userSearch.value[0];
          currentUser.value.elevatedRights = config.value.idpList.find((idp: any) => {
            return idp.idp === userSearch.value[0].idp;
          })?.elevatedRights;
        }
      }
    }

    return currentUser.value ?? undefined;
  }

  async function listIdps() {
    try {
      loading.value = true;
      idps.value = (await userService.listIdps()).data;
    } catch (error) {
      console.error(`listIdps error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function searchUsers(params: Object) {
    try {
      loading.value = true;
      const response = (await userService.searchForUsers(params)).data;

      // Filter out any user without an IDP
      userSearch.value = response.filter((x: User) => x.identityId !== null);
    } catch (error) {
      console.error(`searchUsers error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function clearSearch() {
    userSearch.value = [];
  }

  return { idps, loading, currentUser, userSearch, clearSearch, init, listIdps, searchUsers };
});
