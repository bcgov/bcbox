import { defineStore } from 'pinia';
import { ref } from 'vue';

import { AuthService, ConfigService } from '@/services';
import { generateGetters, isDebugMode } from './utils';

import type { IdTokenClaims, User } from 'oidc-client-ts';
import type { Ref } from 'vue';
import type { IGetterIndex, IStateIndex } from '@/types';
import type { IdentityProvider } from '@/interfaces/IdentityProvider';

export type AuthStateStore = {
  accessToken: Ref<string | undefined>,
  expiresAt: Ref<number | undefined>,
  idToken: Ref<string | undefined>,
  isAuthenticated: Ref<boolean>,
  profile: Ref<IdTokenClaims | undefined>,
  refreshToken: Ref<string | undefined>,
  scope: Ref<string | undefined>,
  user: Ref<User | null>
} & IStateIndex

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
  const getters: IGetterIndex = generateGetters(state);

  function getIdentityId(): string {
    return configService.getConfig().idpList
      .map((provider: IdentityProvider) => state.profile.value ?
        state.profile.value[provider.identityKey] : undefined)
      .filter((item?: string) => item)[0];
  }

  // Actions
  function _registerEvents() {
    console.debug('_registerEvents');

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
    console.debug('_updateState');

    const user = await authService.getUser();
    state.accessToken.value = user?.access_token;
    state.expiresAt.value = user?.expires_at;
    state.idToken.value = user?.id_token;
    state.isAuthenticated.value = !!user;
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
    getIdentityId,
    init,
    login,
    loginCallback,
    logout
  };
});
