import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import Keycloak, { type KeycloakLoginOptions } from 'keycloak-js';
import { useConfigStore } from './configStore';
import { KEYCLOAK } from '@/utils/constants';

export const useAuthStore = defineStore('auth', () => {
  const configStore = useConfigStore();

  // State
  // Is this typescript ok...? Come back to later?
  const _keycloak: Ref<Keycloak> = ref(new Keycloak());
  const ready = ref(false);
  const refreshJobInterval = ref(0);

  // Getters
  const getKeycloak = computed(() => _keycloak.value);
  // const getAuthenticated = computed((): boolean => (ready.value ? !!_keycloak.value.authenticated : false));
  // const getLoginUrl = computed(() => (ready.value ? _keycloak.value.createLoginUrl() : ''));
  // const getToken = computed(() => (ready.value ? _keycloak.value.token : ''));
  // const getTokenParsed = computed((): Object | undefined => (ready.value ? _keycloak.value.tokenParsed : {}));

  // Actions
  function login(options?: KeycloakLoginOptions) {
    window.location.replace(_keycloak.value.createLoginUrl(options));
  }

  function logout() {
    if (ready.value) {
      window.location.replace(
        _keycloak.value.createLogoutUrl({
          redirectUri: `${location.origin}/`,
        })
      );
    }
  }

  async function init() {
    let initOptions = {
      url: configStore.config.keycloak.serverUrl,
      realm: configStore.config.keycloak.realm,
      clientId: configStore.config.keycloak.clientId,
      onLoad: 'check-sso',
    };

    let kc: Keycloak = new Keycloak(initOptions);

    // Once KC is set up and connected flag it as 'ready'
    kc.onReady = function (authenticated) {
      ready.value = true;
    };

    // After a refresh token fetch success
    kc.onAuthRefreshSuccess = function () {
      // console.log(_keycloak.value.token);
    };

    await kc
      .init({ onLoad: 'check-sso', pkceMethod: 'S256' })
      .then(() => {
        // Set the state field to the inited keycloak instance
        _keycloak.value = kc;

        // Token Refresh
        // Check token validity every 10s and, if necessary, update the token.
        // Refresh token if it's valid for less then 70 seconds
        refreshJobInterval.value = window.setInterval(() => {
          kc.updateToken(KEYCLOAK.MIN_VALID_TIME_SEC) // If the token expires within 70 seconds from now get a refreshed
            .then((refreshed: Boolean) => {
              if (refreshed) {
                console.log('Token refreshed ' + refreshed);
              } else {
                // Don't need to log this unless debugging
                // It's for when the token doesn't need to refresh because not expired enough
                // console.log('Token not refreshed');
              }
            })
            .catch(() => {
              console.error('Failed to refresh token');
            });
        }, KEYCLOAK.REFRESH_TIME_MS); // Check every 10s
      })
      .catch((err) => {
        console.error(`Authenticated Failed ${JSON.stringify(err)}`);
      });
  }

  return { login, logout, init, getKeycloak, ready };
});
