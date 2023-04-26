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
  elevatedRights: true,
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
  elevatedRights: true,
};

const mockAdd = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  useToastSpy.mockImplementation(() => ({ add: mockAdd }));
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
      searchForUsersSpy.mockReturnValueOnce({ data: [user] } as any);

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([user]);
    });

    it('filters out users without an IDP', async () => {
      searchForUsersSpy.mockReturnValueOnce({ data: [noIdUser] } as any);

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([]);
    });

    it('displays toast on error', async () => {
      searchForUsersSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(useToastSpy).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.anything());
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([]);
    });
  });


  describe('clearSearch', () => {
    it('empties the search state', async () => {
      userStore.userSearch = [user];

      expect(userStore.getUserSearch).toStrictEqual([user]);
      userStore.clearSearch();
      expect(userStore.getUserSearch).toStrictEqual([]);
    });
  });
});
