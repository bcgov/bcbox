import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, useObjectStore, usePermissionStore } from '@/store';
import { StorageKey } from '@/utils/constants';

import type { StoreGeneric } from 'pinia';
import type { SpyInstance } from 'vitest';
import type { COMSObject } from '@/types';

const obj: COMSObject = {
  active: true,
  bucketId: '000',
  id: '000',
  name: 'object1',
  path: 'dev/test',
  public: false,
};

const obj2: COMSObject = {
  active: true,
  bucketId: '000',
  id: '111',
  name: 'object2',
  path: 'dev/test',
  public: false,
};

const readPerm = {
  objectId: '000',
  id: '0',
  permCode: 'READ',
  userId: '123'
};

const mockToast = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');

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

  useToastSpy.mockImplementation(() => ({ error: mockToast, info: mockToast, success: mockToast, warn: mockToast }));
});

afterEach(() => {
  sessionStorage.clear();
});

describe('Object Store', () => {

  let appStore: StoreGeneric;
  let objectStore: StoreGeneric;
  let permissionStore: StoreGeneric;

  let beginIndeterminateLoadingSpy: SpyInstance;
  let endIndeterminateLoadingSpy: SpyInstance;
  let fetchObjectPermissionsSpy: SpyInstance;

  let createObjectSpy: SpyInstance;
  let deleteObjectSpy: SpyInstance;
  let fetchObjectsSpy: SpyInstance;
  let getObjectSpy: SpyInstance;
  let searchObjectsSpy: SpyInstance;

  beforeEach(() => {
    appStore = useAppStore();
    objectStore = useObjectStore();
    permissionStore = usePermissionStore();

    beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
    endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
    fetchObjectPermissionsSpy = vi.spyOn(permissionStore, 'fetchObjectPermissions');

    createObjectSpy = vi.spyOn(objectService, 'createObject');
    deleteObjectSpy = vi.spyOn(objectService, 'deleteObject');
    fetchObjectsSpy = vi.spyOn(objectStore, 'fetchObjects');
    getObjectSpy = vi.spyOn(objectService, 'getObject');
    searchObjectsSpy = vi.spyOn(objectService, 'searchObjects');
  });

  describe('createObject', () => {
    it('creates the object', async () => {
      const blob: any = {
        some: 'data'
      };

      createObjectSpy.mockReturnValue({} as any);

      await objectStore.createObject(blob, { metadata: [] }, { bucketId: '000', tagset: [] }, { timeout: 0 });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(createObjectSpy).toHaveBeenCalledTimes(1);
      expect(createObjectSpy).toHaveBeenCalledWith(
        blob,
        {
          metadata: []
        },
        {
          bucketId: '000',
          tagset: []
        },
        { timeout: 0 }
      );
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('deleteObjects', () => {
    // TODO: Figure out why we can't mock fetchObjects here
    // TODO: Figure out why endIndeterminateLoadingSpy is only being called twice
    it('deletes the objects', async () => {
      objectStore.objects = [obj, obj2];

      fetchObjectsSpy.mockImplementation(vi.fn());

      await objectStore.deleteObjects([obj.id, obj2.id]);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(3);
      expect(deleteObjectSpy).toHaveBeenCalledTimes(2);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(2);
    });
  });


  describe('downloadObject', () => {
    it('gets the most recent object', async () => {
      getObjectSpy.mockReturnValue({} as any);

      await objectStore.downloadObject(obj.id);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledWith(obj.id, undefined);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });

    it('gets the object by version', async () => {
      getObjectSpy.mockReturnValue({} as any);

      await objectStore.downloadObject(obj.id, '1');

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledWith(obj.id, '1');
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });

    it('displays a toast on error', async () => {
      getObjectSpy.mockImplementation(() => {
        throw new Error();
      });

      await objectStore.downloadObject(obj.id);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledTimes(1);
      expect(getObjectSpy).toHaveBeenCalledWith(obj.id, undefined);
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith('Downloading object', new Error);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('fetchObjects', () => {
    it('gets the object list', async () => {
      permissionStore.objectPermissions = [
        readPerm
      ];

      searchObjectsSpy.mockResolvedValue({ data: [obj] } as any);
      fetchObjectPermissionsSpy.mockReturnValue([readPerm] as any);

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
      }, {});
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(objectStore.getObjects).toStrictEqual([obj]);
    });

    it('does not change state on error', async () => {
      permissionStore.objectPermissions = [
        readPerm
      ];

      searchObjectsSpy.mockImplementation(() => {
        throw new Error();
      });
      fetchObjectPermissionsSpy.mockReturnValue([readPerm] as any);

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
      }, {});
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith('Fetching objects', new Error);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(objectStore.getObjects).toStrictEqual([]);
    });
  });


  describe('findObjectById', () => {
    it('returns a matching bucket', () => {
      objectStore.objects = [obj];

      const result = objectStore.findObjectById('000');

      expect(result).toStrictEqual(obj);
    });

    it('returns undefined when no matching bucket is found', () => {
      objectStore.objects = [obj];

      const result = objectStore.findObjectById('foo');

      expect(result).toStrictEqual(undefined);
    });
  });


  describe('headObject', () => {
    it('calls the service', async () => {
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
      objectStore.setSelectedObjects([obj, obj2]);

      expect(objectStore.getSelectedObjects).toStrictEqual([obj, obj2]);
    });
  });


  describe('togglePublic', () => {
    it('calls the service', async () => {
      const togglePublicSpy = vi.spyOn(objectService, 'togglePublic');

      await objectStore.togglePublic('000', true);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(togglePublicSpy).toHaveBeenCalledTimes(1);
      expect(togglePublicSpy).toHaveBeenLastCalledWith('000', true);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });
});
