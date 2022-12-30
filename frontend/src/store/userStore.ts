import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { User } from '@/interfaces';
import { userService } from '@/services';
import { useAuthStore } from '@/store';

export const useUserStore = defineStore('user', () => {
  const { getIdentityId } = useAuthStore();
  const { getKeycloak } = storeToRefs(useAuthStore());

  const userSearch = ref([] as User[]);
  const idps = ref([] as Object[]);
  const loading = ref(false);
  const userId = ref('');

  async function init() {
    await getUserId();
  }

  // Hydrates the logged in users ID from the COMS database
  async function getUserId() {
    if (!userId.value && getKeycloak.value.authenticated) {
      if (getIdentityId()) {
        await searchUsers({ identityId: getIdentityId() });

        if (userSearch.value.length) {
          userId.value = userSearch.value[0].userId;
        }
      }
    }

    return userId.value ?? undefined;
  }

  async function listIdps() {
    try {
      loading.value = true;
      idps.value = (await userService.listIdps()).data;
    } catch (error) {
      console.error(`listIdps error: ${error}`);
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function searchUsers(params: Object) {
    try {
      loading.value = true;
      userSearch.value = (await userService.searchForUsers(params)).data;
    } catch (error) {
      console.error(`searchUsers error: ${error}`);
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return { idps, loading, userId, userSearch, init, listIdps, searchUsers };
});
