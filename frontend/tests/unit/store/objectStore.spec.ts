import { setActivePinia, createPinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as primevue from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, useObjectStore, usePermissionStore } from '@/store';
import { StorageKey } from '@/utils/constants';

import type { COMSObject } from '@/types';

const obj: COMSObject = {
  active: true,
  bucketId: '000',
  id: '000',
  path: 'dev/test',
  public: false,
};

const obj2: COMSObject = {
  active: true,
  bucketId: '000',
  id: '111',
  path: 'dev/test',
  public: false,
};

const readPerm = {
  objectId: '000',
  id: '0',
  permCode: 'READ',
  userId: '123'
};

const mockAdd = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast').mockImplementation(() => ({ add: mockAdd }));

beforeEach(() => {
  setActivePinia(createPinia());

  sessionStorage.setItem(StorageKey.CONFIG, JSON.stringify(
    {
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    }
  ));

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('Object Store', () => {

  describe('createObject', () => {
    it('creates the object', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

      const blob: any = {
        some: 'data'
      };

      const createObjectSpy = vi.spyOn(objectService, 'createObject')
        .mockReturnValueOnce({} as any);

      await objectStore.createObject(blob, '000', { timeout: 0 });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(createObjectSpy).toHaveBeenCalledTimes(1);
      expect(createObjectSpy).toHaveBeenCalledWith(blob, '000', { timeout: 0 });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('deleteObjects', () => {
    // TODO: Figure out why we can't mock fetchObjects here
    // This test shouldn't be diving into other calls
    it('deletes the objects', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

      const deleteObjectSpy = vi.spyOn(objectService, 'deleteObject');

      objectStore.objects = [obj, obj2];

      await objectStore.deleteObjects([obj.id, obj2.id]);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(3);
      expect(deleteObjectSpy).toHaveBeenCalledTimes(2);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(3);
    });
  });


  describe('downloadObject', () => {
    it('gets the most recent object', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

      const getObjectSpy = vi.spyOn(objectService, 'getObject')
        .mockReturnValueOnce({} as any);

      await objectStore.downloadObject(obj.id);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledWith(obj.id, undefined);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });

    it('gets the object by version', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

      const getObjectSpy = vi.spyOn(objectService, 'getObject')
        .mockReturnValueOnce({} as any);

      await objectStore.downloadObject(obj.id, '1');

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledWith(obj.id, '1');
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });

    // TODO: Why is useToastSpy being called twice?
    it.skip('displays a toast on error', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

      const getObjectSpy = vi.spyOn(objectService, 'getObject')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      await objectStore.downloadObject(obj.id);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledWith(obj.id, undefined);
      expect(useToastSpy).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.anything());
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('fetchObjects', () => {
    it('gets the object list', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();
      const permissionStore = usePermissionStore();
      permissionStore.objectPermissions = [
        readPerm
      ];

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const searchObjectsSpy = vi.spyOn(objectService, 'searchObjects')
        .mockReturnValueOnce({ data: [obj] } as any);
      const fetchObjectPermissionsSpy = vi.spyOn(permissionStore, 'fetchObjectPermissions')
        .mockReturnValueOnce([readPerm] as any);

      await objectStore.fetchObjects({ bucketId: '000', userId: '123', bucketPerms: true });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(fetchObjectPermissionsSpy).toHaveBeenCalledTimes(1);
      expect(fetchObjectPermissionsSpy).toBeCalledWith({ bucketId: '000', userId: '123', bucketPerms: true });
      expect(searchObjectsSpy).toHaveBeenCalledTimes(1);
      expect(searchObjectsSpy).toBeCalledWith({
        bucketId: ['000'],
        objectId: ['000'],
        deleteMarker: false,
        latest: true
      });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(objectStore.getObjects).toStrictEqual([obj]);
    });

    // TODO: Why is useToastSpy being called twice?
    it.skip('does not change state on error', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();
      const permissionStore = usePermissionStore();
      permissionStore.objectPermissions = [
        readPerm
      ];

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const searchObjectsSpy = vi.spyOn(objectService, 'searchObjects')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      const fetchObjectPermissionsSpy = vi.spyOn(permissionStore, 'fetchObjectPermissions')
        .mockReturnValueOnce([readPerm] as any);

      await objectStore.fetchObjects({ bucketId: '000', userId: '123', bucketPerms: true });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(fetchObjectPermissionsSpy).toHaveBeenCalledTimes(1);
      expect(fetchObjectPermissionsSpy).toBeCalledWith({ bucketId: '000', userId: '123', bucketPerms: true });
      expect(searchObjectsSpy).toHaveBeenCalledTimes(1);
      expect(searchObjectsSpy).toBeCalledWith({
        bucketId: ['000'],
        objectId: ['000'],
        deleteMarker: false,
        latest: true
      });
      expect(useToastSpy).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.anything());
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(objectStore.getObjects).toStrictEqual([obj]);
    });
  });


  describe('findObjectById', () => {
    it('returns a matching bucket', () => {
      const objectStore = useObjectStore();
      objectStore.objects = [obj];

      const result = objectStore.findObjectById('000');

      expect(result).toStrictEqual(obj);
    });

    it('returns undefined when no matching bucket is found', () => {
      const objectStore = useObjectStore();
      objectStore.objects = [obj];

      const result = objectStore.findObjectById('foo');

      expect(result).toStrictEqual(undefined);
    });
  });


  describe('headObject', () => {
    it('calls the service', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

      const headObjectSpy = vi.spyOn(objectService, 'headObject');

      await objectStore.headObject('000');

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(headObjectSpy).toHaveBeenCalledTimes(1);
      expect(headObjectSpy).toHaveBeenLastCalledWith('000');
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('setSelectedObjects', () => {
    it('sets the state', () => {
      const objectStore = useObjectStore();

      objectStore.setSelectedObjects([obj, obj2]);

      expect(objectStore.getSelectedObjects).toStrictEqual([obj, obj2]);
    });
  });


  describe('togglePublic', () => {
    it('calls the service', async () => {
      const appStore = useAppStore();
      const objectStore = useObjectStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

      const togglePublicSpy = vi.spyOn(objectService, 'togglePublic');

      await objectStore.togglePublic('000', true);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(togglePublicSpy).toHaveBeenCalledTimes(1);
      expect(togglePublicSpy).toHaveBeenLastCalledWith('000', true);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });
});
