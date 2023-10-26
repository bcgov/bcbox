import { Log, UserManager, WebStorageStateStore } from 'oidc-client-ts';

import ConfigService from './configService';

import type { User, UserManagerSettings } from 'oidc-client-ts';

const isDebugMode: boolean = import.meta.env.MODE.toUpperCase() === 'DEBUG';

/**
 * @class AuthService
 * A singleton wrapper for managing user authentication
 */
export default class AuthService {
  private static _instance: AuthService;
  private static _userManager: UserManager;

  /**
   * @constructor
   */
  constructor() {
    if (!AuthService._instance) {
      AuthService._instance = this;
      AuthService._userManager = new UserManager(this.getOidcSettings());

      Log.setLogger(console);
      Log.setLevel(isDebugMode ? Log.DEBUG : Log.INFO);
    }

    return AuthService._instance;
  }

  /**
   * @function getOidcSettings
   * Acquires OIDC settings from config
   * @returns {UserManagerSettings} Yields OIDC settings
   * @throws If OIDC configuration is missing or incomplete
   */
  public getOidcSettings(): UserManagerSettings {
    const config = new ConfigService().getConfig();

    if (!config?.oidc?.authority || !config?.oidc?.clientId) {
      throw new Error('OIDC is misconfigured');
    }

    return {
      automaticSilentRenew: true,
      authority: config.oidc.authority,
      client_id: config.oidc.clientId,
      redirect_uri: `${window.location.protocol}//${window.location.host}/oidc/callback`,
      loadUserInfo: true,
      post_logout_redirect_uri: `${window.location.protocol}//${window.location.host}/oidc/logout`,
      userStore: new WebStorageStateStore({ store: window.localStorage })
    };
  }

  /**
   * @function init
   * Initializes the AuthService singleton
   * @returns {Promise<AuthService>} An instance of AuthService
   */
  public static async init(): Promise<AuthService> {
    return new Promise((resolve) => {
      const authService = new AuthService();
      resolve(authService);
    });
  }

  /**
   * @function getUser
   * Returns the raw OIDC current user information
   * @returns {Promise<User | null>} Returns a user object if logged in, null otherwise
   */
  public async getUser(): Promise<User | null> {
    return AuthService._userManager.getUser();
  }

  /**
   * @function getUserManager
   * Returns the OIDC user manager
   * @returns {Promise<User | null>} Returns a user object if logged in, null otherwise
   */
  public getUserManager(): UserManager {
    return AuthService._userManager;
  }

  /**
   * @function login
   * Performs the OIDC user login flow
   * @returns {Promise<void>}
   */
  public async login(): Promise<void> {
    return AuthService._userManager.signinRedirect({ redirectMethod: 'replace' });
  }

  /**
   * @function loginCallback
   * Handles the OIDC callback user login flow
   * @returns {Promise<void>} Resolves upon completion
   */
  public async loginCallback(): Promise<void> {
    // Register and store user to local storage
    await AuthService._userManager.signinRedirectCallback();
    // signinRedirectCallback appears to do this already?
    // await AuthService._userManager.storeUser(user);
  }

  /**
   * @function logout
   * Performs the OIDC user logout flow
   * @returns {Promise<void>}
   */
  public async logout(): Promise<void> {
    return AuthService._userManager.signoutRedirect({ redirectMethod: 'replace' });
  }
}
