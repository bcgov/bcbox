import { defineStore } from 'pinia';
import { computed, ref, unref } from 'vue';

import { AuthService, ConfigService } from '@/services';
import { isDebugMode } from './utils';

import type { IdTokenClaims, User } from 'oidc-client-ts';
import type { Ref } from 'vue';
import type { IdentityProvider } from '@/interfaces';

export type AuthStateStore = {
  accessToken: Ref<string | undefined>,
  expiresAt: Ref<number | undefined>,
  idToken: Ref<string | undefined>,
  isAuthenticated: Ref<boolean>,
  profile: Ref<IdTokenClaims | undefined>,
  refreshToken: Ref<string | undefined>,
  scope: Ref<string | undefined>,
  user: Ref<User | null>
}

export const useAuthStore = defineStore('auth', () => {
  const authService = new AuthService();
  const userManager = authService.getUserManager();
  const configService = new ConfigService();

  // State
  const state: AuthStateStore = {
    accessToken: ref(undefined),
    expiresAt: ref(0),
    idToken: ref(undefined),
    isAuthenticated: ref(false),
    profile: ref(undefined),
    refreshToken: ref(undefined),
    scope: ref(undefined),
    user: ref(null)
  };

  // Getters
  const getters = {
    getAccessToken: computed(() => unref(state.accessToken)),
    getExpiresAt: computed(() => unref(state.expiresAt)),
    getIdentityId: computed(() => {
      return configService.getConfig().idpList
        .map((provider: IdentityProvider) => state.profile.value ?
          state.profile.value[provider.identityKey] : undefined)
        .filter((item?: string) => item)[0];
    }),
    getIdToken: computed(() => unref(state.idToken)),
    getIsAuthenticated: computed(() => unref(state.isAuthenticated)),
    getProfile: computed(() => unref(state.profile)),
    getRefreshToken: computed(() => unref(state.refreshToken)),
    getScope: computed(() => unref(state.scope)),
    getUser: computed(() => unref(state.user))
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
    state.accessToken.value = user?.access_token;
    state.expiresAt.value = user?.expires_at;
    state.idToken.value = user?.id_token;
    state.isAuthenticated.value = !!user && !user.expired;
    state.profile.value = user?.profile;
    state.refreshToken.value = user?.refresh_token;
    state.scope.value = user?.scope;
    state.user.value = user;
  }

  async function init() {
    await AuthService.init();
    await _updateState();
    _registerEvents();
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
    ...(isDebugMode && state),
    ...getters,
    _registerEvents,
    _updateState,
    init,
    login,
    loginCallback,
    logout
  };
});
