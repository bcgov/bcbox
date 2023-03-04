import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { AuthService, ConfigService, userService } from '@/services';

import type { IdTokenClaims, User } from 'oidc-client-ts';
import type { Ref } from 'vue';

import type { IdentityProvider } from '@/types';

export type AuthStoreState = {
  accessToken: Ref<string | undefined>,
  expiresAt: Ref<number | undefined>,
  identityId: Ref<string | undefined>,
  idToken: Ref<string | undefined>,
  isAuthenticated: Ref<boolean>,
  profile: Ref<IdTokenClaims | undefined>,
  refreshToken: Ref<string | undefined>,
  scope: Ref<string | undefined>,
  user: Ref<User | null>,
  userId: Ref<string | undefined>
}

export const useAuthStore = defineStore('auth', () => {
  const configService = new ConfigService();
  const authService = new AuthService();
  const userManager = authService.getUserManager();

  // State
  const state: AuthStoreState = {
    accessToken: ref(undefined),
    expiresAt: ref(0),
    identityId: ref(undefined),
    idToken: ref(undefined),
    isAuthenticated: ref(false),
    profile: ref(undefined),
    refreshToken: ref(undefined),
    scope: ref(undefined),
    user: ref(null),
    userId: ref(undefined)
  };

  // Getters
  const getters = {
    getAccessToken: computed(() => state.accessToken.value),
    getExpiresAt: computed(() => state.expiresAt.value),
    getIdentityId: computed(() => state.identityId.value),
    getIdToken: computed(() => state.idToken.value),
    getIsAuthenticated: computed(() => state.isAuthenticated.value),
    getProfile: computed(() => state.profile.value),
    getRefreshToken: computed(() => state.refreshToken.value),
    getScope: computed(() => state.scope.value),
    getUser: computed(() => state.user.value),
    getUserId: computed(() => state.userId.value)
  };

  // Actions
  function _registerEvents() {
    userManager.events.addAccessTokenExpired(_updateState);
    userManager.events.addAccessTokenExpiring(_updateState);
    userManager.events.addSilentRenewError(_updateState);
    userManager.events.addUserLoaded(_updateState);
    userManager.events.addUserSessionChanged(_updateState);
    userManager.events.addUserSignedIn(_updateState);
    userManager.events.addUserSignedOut(_updateState);
    userManager.events.addUserUnloaded(_updateState);
  }

  async function _updateState() {
    const user = await authService.getUser();
    const profile = user?.profile;
    const isAuthenticated = !!user && !user.expired;
    const identityId = configService.getConfig().idpList
      .map((provider: IdentityProvider) => profile
        ? profile[provider.identityKey]
        : undefined)
      .filter((item?: string) => item)[0];

    state.accessToken.value = user?.access_token;
    state.expiresAt.value = user?.expires_at;
    state.identityId.value = identityId;
    state.idToken.value = user?.id_token;
    state.isAuthenticated.value = isAuthenticated;
    state.profile.value = profile;
    state.refreshToken.value = user?.refresh_token;
    state.scope.value = user?.scope;
    state.user.value = user;
    state.userId.value = (isAuthenticated && identityId)
      ? (await userService.searchForUsers({ identityId: identityId })).data[0].userId
      : undefined;
  }

  async function init() {
    await AuthService.init();
    _registerEvents();
    await _updateState();
  }

  async function login() {
    return authService.login();
  }

  async function loginCallback() {
    return authService.loginCallback();
  }

  async function logout() {
    return authService.logout();
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    _registerEvents,
    _updateState,
    init,
    login,
    loginCallback,
    logout
  };
});

export default useAuthStore;
