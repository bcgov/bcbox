import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { userService } from '@/services';
import { useAppStore, useUserStore } from '@/store';

import type { StoreGeneric } from 'pinia';
import type { SpyInstance } from 'vitest';
import type { User } from '@/types';

const user: User = {
  active: true,
  email: 'foo@bar.com',
  firstName: 'foo',
  fullName: 'foo bar',
  identityId: 'someId',
  idp: 'someIdp',
  lastName: 'bar',
  userId: '000',
  username: 'foobar',
  elevatedRights: true
};

const user2: User = {
  active: true,
  email: 'test@dev.com',
  firstName: 'baz',
  fullName: 'baz bam',
  identityId: 'someId',
  idp: 'someIdp',
  lastName: 'bam',
  userId: '111',
  username: 'bazbam',
  elevatedRights: true
};

const noIdUser: User = {
  active: true,
  email: 'foo@bar.com',
  firstName: 'foo',
  fullName: 'foo bar',
  identityId: null,
  idp: '',
  lastName: 'bar',
  userId: '000',
  username: 'foobar',
  elevatedRights: true
};

const mockToast = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  useToastSpy.mockImplementation(() => ({ error: mockToast, info: mockToast, success: mockToast, warn: mockToast }));
});

afterEach(() => {
  sessionStorage.clear();
});

describe('User Store', () => {
  let appStore: StoreGeneric;
  let userStore: StoreGeneric;

  let beginIndeterminateLoadingSpy: SpyInstance;
  let endIndeterminateLoadingSpy: SpyInstance;

  let searchForUsersSpy: SpyInstance;

  beforeEach(() => {
    appStore = useAppStore();
    userStore = useUserStore();

    beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
    endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

    searchForUsersSpy = vi.spyOn(userService, 'searchForUsers');
  });

  describe('fetchUsers', () => {
    it('sets the state from the search results', async () => {
      searchForUsersSpy.mockReturnValue({ data: [user] } as any);

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([user]);
    });

    it('filters out users without an IDP', async () => {
      searchForUsersSpy.mockReturnValue({ data: [noIdUser] } as any);

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([]);
    });

    it('displays toast on error', async () => {
      searchForUsersSpy.mockImplementation(() => {
        throw new Error();
      });

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(useToastSpy).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith('Searching users', new Error(), { life: 0 });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([]);
    });
  });

  describe('clearSearch', () => {
    it('empties the search state', async () => {
      userStore.userSearch = [user];

      expect(userStore.getUsers(['000'])).toStrictEqual([user]);
      userStore.clearSearch();
      expect(userStore.getUsers()).toStrictEqual([]);
    });
  });

  describe('getUsers', () => {
    it('returns the correct subset', async () => {
      userStore.userSearch = [user, user2];

      const result = userStore.getUsers(['000']);
      expect(result).toStrictEqual([user]);
    });
  });
});
