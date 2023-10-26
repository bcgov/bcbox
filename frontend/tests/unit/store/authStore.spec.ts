import { setActivePinia, createPinia } from 'pinia';

// import { useAuthStore } from '@/store';
// import { AuthService } from '@/services';

describe.skip('Auth Store', () => {
  //const noop = () => { };

  beforeEach(() => {
    // Creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia());
  });

  it('_registerEvents', () => {
    // const p = AuthService.prototype;
    // const o = p.getOidcSettings;
    // const oo = o();
    // const store = useAuthStore();
    // const userManager = AuthService.getUserManager();
    // const addAccessTokenExpiredSpy = jest.spyOn(userManager.events, 'addAccessTokenExpired');
    // const addAccessTokenExpiringSpy = jest.spyOn(userManager.events, 'addAccessTokenExpiring');
    // const addSilentRenewErrorSpy = jest.spyOn(userManager.events, 'addSilentRenewError');
    // const addUserLoadedSpy = jest.spyOn(userManager.events, 'addUserLoaded');
    // const addUserSessionChangedSpy = jest.spyOn(userManager.events, 'addUserSessionChanged');
    // const addUserSignedInSpy = jest.spyOn(userManager.events, 'addUserSignedIn');
    // const addUserSignedOutSpy = jest.spyOn(userManager.events, 'addUserSignedOut');
    // const addUserUnloadedSpy = jest.spyOn(userManager.events, 'addUserUnloaded');
    // addAccessTokenExpiredSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addAccessTokenExpiringSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addSilentRenewErrorSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addUserLoadedSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addUserSessionChangedSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addUserSignedInSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addUserSignedOutSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addUserUnloadedSpy.mockImplementation(() => {
    //   return jest.fn();
    // });
    // addAccessTokenExpiredSpy.mockReturnValue(noop);
    // addAccessTokenExpiringSpy.mockReturnValue(noop);
    // addSilentRenewErrorSpy.mockReturnValue(noop);
    // addUserLoadedSpy.mockReturnValue(noop);
    // addUserSessionChangedSpy.mockReturnValue(noop);
    // addUserSignedInSpy.mockReturnValue(noop);
    // addUserSignedOutSpy.mockReturnValue(noop);
    // addUserUnloadedSpy.mockReturnValue(noop);
    // store._registerEvents();
    // expect(addAccessTokenExpiredSpy).toHaveBeenCalledTimes(1);
    // expect(addAccessTokenExpiringSpy).toHaveBeenCalledTimes(1);
    // expect(addSilentRenewErrorSpy).toHaveBeenCalledTimes(1);
    // expect(addUserLoadedSpy).toHaveBeenCalledTimes(1);
    // expect(addUserSessionChangedSpy).toHaveBeenCalledTimes(1);
    // expect(addUserSignedInSpy).toHaveBeenCalledTimes(1);
    // expect(addUserSignedOutSpy).toHaveBeenCalledTimes(1);
    // expect(addUserUnloadedSpy).toHaveBeenCalledTimes(1);
  });
});
