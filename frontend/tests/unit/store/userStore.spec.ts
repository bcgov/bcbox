import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { userService } from '@/services';
import { useAppStore, useUserStore } from '@/store';

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

const mockAdd = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast').mockImplementation(() => ({ add: mockAdd }));

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('User Store', () => {

  describe('fetchUsers', () => {
    it('sets the state from the search results', async () => {
      const appStore = useAppStore();
      const userStore = useUserStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const searchForUsersSpy = vi.spyOn(userService, 'searchForUsers')
        .mockReturnValueOnce({ data: [user] } as any);

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([user]);
    });

    it('filters out users without an IDP', async () => {
      const appStore = useAppStore();
      const userStore = useUserStore();

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

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const searchForUsersSpy = vi.spyOn(userService, 'searchForUsers')
        .mockReturnValueOnce({ data: [noIdUser] } as any);

      await userStore.fetchUsers({ lastName: 'bar' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchForUsersSpy).toHaveBeenCalledWith({ lastName: 'bar' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(userStore.userSearch).toStrictEqual([]);
    });

    it('displays toast on error', async () => {
      const appStore = useAppStore();
      const userStore = useUserStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const searchForUsersSpy = vi.spyOn(userService, 'searchForUsers')
        .mockImplementationOnce(() => {
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
      const userStore = useUserStore();
      userStore.userSearch = [user];

      expect(userStore.getUserSearch).toStrictEqual([user]);
      userStore.clearSearch();
      expect(userStore.getUserSearch).toStrictEqual([]);
    });
  });
});
