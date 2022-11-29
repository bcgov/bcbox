import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import Keycloak from 'keycloak-js';
import { useConfigStore } from './configStore';

export const useAuthStore = defineStore('auth', () => {
  const configStore = useConfigStore();

  // State
  // Is this typescript ok...? Come back to later?
  const $keycloak: Ref<Keycloak> = ref(new Keycloak());
  const ready = ref(false);

  // Getters
  const getKeycloak = computed(() => $keycloak.value);
  // const getAuthenticated = computed((): boolean => (ready.value ? !!$keycloak.value.authenticated : false));
  // const getLoginUrl = computed(() => (ready.value ? $keycloak.value.createLoginUrl() : ''));
  // const getToken = computed(() => (ready.value ? $keycloak.value.token : ''));
  // const getTokenParsed = computed((): Object | undefined => (ready.value ? $keycloak.value.tokenParsed : {}));

  // Actions
  function login() {
    window.location.replace($keycloak.value.createLoginUrl());
  }

  function logout() {
    if (ready.value) {
      window.location.replace(
        $keycloak.value.createLogoutUrl({
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
      // console.log($keycloak.value.token);
    };

    await kc
      .init({ onLoad: 'check-sso', pkceMethod: 'S256' })
      .then(() => {
        // Set the state field to the inited keycloak instance
        $keycloak.value = kc;

        // Token Refresh
        // Check token validity every 10s and, if necessary, update the token.
        // Refresh token if it's valid for less then 70 seconds
        setInterval(() => {
          kc.updateToken(70) // If the token expires within 70 seconds from now get a refreshed
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
        }, 10000); // Check every 10s
      })
      .catch((err) => {
        console.error(`Authenticated Failed ${JSON.stringify(err)}`);
      });
  }

  return { login, logout, init, getKeycloak, ready };
});
