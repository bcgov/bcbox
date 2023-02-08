import { Log, UserManager, WebStorageStateStore } from 'oidc-client-ts';

import ConfigService from './configService';

import type { User, UserManagerSettings } from 'oidc-client-ts';

/**
 * @class AuthService
 * A singleton wrapper for managing user authentication
 */
export default class AuthService {
  private static _instance: AuthService;
  private _userManager: UserManager;

  /**
   * @constructor
   */
  constructor() {
    if (!AuthService._instance) {
      AuthService._instance = this;
    }

    Log.setLogger(console);
    Log.setLevel(Log.INFO);
    this._userManager = new UserManager(this.getOidcSettings());

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
      redirect_uri: `${window.location.protocol}//${window.location.host}`,
      loadUserInfo: true,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
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
    return this._userManager.getUser();
  }

  /**
   * @function login
   * Performs the OIDC user login flow
   * @returns {Promise<void>}
   */
  public async login(): Promise<void> {
    return this._userManager.signinRedirect({
      redirectMethod: 'assign',
      redirect_uri: window.location.href
    });
  }

  /**
   * @function loginCallback
   * Handles the OIDC callback user login flow
   * @returns {Promise<User>} Returns the user object
   */
  public async loginCallback(): Promise<User> {
    return this._userManager.signinRedirectCallback().then(authedUser => {
      return this._userManager.storeUser(authedUser).then(() => {
        return authedUser;
      });
    });
  }

  /**
   * @function logout
   * Performs the OIDC user logout flow
   * @returns {Promise<void>}
   */
  public async logout(): Promise<void> {
    return this._userManager.signoutRedirect();
  }
}
