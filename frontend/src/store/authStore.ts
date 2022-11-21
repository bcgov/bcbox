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
  const getAuthenticated = computed((): boolean => (ready.value ? !!$keycloak.value.authenticated : false));
  const getLoginUrl = computed(() => (ready.value ? $keycloak.value.createLoginUrl() : ''));
  const getToken = computed(() => (ready.value ? $keycloak.value.token : ''));
  const getTokenParsed = computed((): Object | undefined => (ready.value ? $keycloak.value.tokenParsed : {}));
  const isLoggedIn = ref(false);

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

    kc.onReady = function (authenticated) {
      ready.value = true;
    };

    kc.init({ onLoad: 'check-sso', pkceMethod: 'S256' })
      .then(() => {
        // Set the state field to the inited keycloak instance
        $keycloak.value = kc;

        //Token Refresh
        setInterval(() => {
          $keycloak.value
            .updateToken(70)
            .then((refreshed: Boolean) => {
              if (refreshed) {
                console.log('Token refreshed' + refreshed);
              } else {
                console.warn('Token not refreshed');
              }
            })
            .catch(() => {
              console.error('Failed to refresh token');
            });
        }, 6000);
      })
      .catch((err) => {
        console.error(`Authenticated Failed ${JSON.stringify(err)}`);
      });
  }

  return { isLoggedIn, login, logout, init, $keycloak, getLoginUrl, ready, getToken, getAuthenticated, getTokenParsed };
});
