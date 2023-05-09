import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { bucketService } from '@/services';
import { useAppStore, useBucketStore, usePermissionStore } from '@/store';
import { StorageKey } from '@/utils/constants';

import type { StoreGeneric } from 'pinia';
import type { SpyInstance } from 'vitest';
import type { Bucket } from '@/types';

const bucket: Bucket = {
  active: true,
  accessKeyId: 'foo',
  bucket: 'bcbox',
  bucketId: '000',
  bucketName: 'unit',
  endpoint: 'https://not.a.url',
  key: 'test',
  region: 'us-east-1',
  secretAccessKey: '123',
};

const bucket2: Bucket = {
  active: true,
  accessKeyId: 'bar',
  bucket: 'bcbox',
  bucketId: '111',
  bucketName: 'unit2',
  endpoint: 'https://not.a.url',
  key: 'test',
  region: 'us-east-1',
  secretAccessKey: '456',
};

const readPerm = {
  bucketId: '000',
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

describe('Bucket Store', () => {

  let appStore: StoreGeneric;
  let bucketStore: StoreGeneric;
  let permissionStore: StoreGeneric;

  let beginIndeterminateLoadingSpy: SpyInstance;
  let endIndeterminateLoadingSpy: SpyInstance;
  let fetchBucketPermissionsSpy: SpyInstance;

  let createBucketSpy: SpyInstance;
  let searchBucketsSpy: SpyInstance;
  let updateBucketSpy: SpyInstance;

  beforeEach(() => {
    appStore = useAppStore();
    bucketStore = useBucketStore();
    permissionStore = usePermissionStore();

    beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
    endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
    fetchBucketPermissionsSpy = vi.spyOn(permissionStore, 'fetchBucketPermissions');

    createBucketSpy = vi.spyOn(bucketService, 'createBucket');
    searchBucketsSpy = vi.spyOn(bucketService, 'searchBuckets');
    updateBucketSpy = vi.spyOn(bucketService, 'updateBucket');
  });


  describe('createBucket', () => {
    it('calls the service', async () => {
      createBucketSpy.mockReturnValue({ data: {} } as any);

      await bucketStore.createBucket(bucket);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(createBucketSpy).toHaveBeenCalledTimes(1);
      expect(createBucketSpy).toHaveBeenCalledWith(bucket);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('fetchBuckets', () => {
    it('gets the bucket list', async () => {
      permissionStore.bucketPermissions = [
        readPerm
      ];

      searchBucketsSpy.mockReturnValue({ data: [bucket] } as any);
      fetchBucketPermissionsSpy.mockReturnValue([readPerm] as any);

      await bucketStore.fetchBuckets({ userId: '123', objectPerms: true });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toBeCalledWith({ userId: '123', objectPerms: true });
      expect(searchBucketsSpy).toHaveBeenCalledTimes(1);
      expect(searchBucketsSpy).toBeCalledWith({ bucketId: ['000'] });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(bucketStore.getBuckets).toStrictEqual([bucket]);
    });

    it('does not change state on error', async () => {
      permissionStore.bucketPermissions = [
        readPerm
      ];

      searchBucketsSpy.mockImplementation(() => {
        throw new Error();
      });
      fetchBucketPermissionsSpy.mockReturnValue([readPerm] as any);

      await bucketStore.fetchBuckets({ userId: '123', objectPerms: true });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toBeCalledWith({ userId: '123', objectPerms: true });
      expect(searchBucketsSpy).toHaveBeenCalledTimes(1);
      expect(searchBucketsSpy).toBeCalledWith({ bucketId: ['000'] });
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith('Fetching buckets', new Error);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(bucketStore.getBuckets).toStrictEqual([]);
    });
  });


  describe('findBucketById', () => {
    it('returns a matching bucket', () => {
      bucketStore.buckets = [bucket];

      const result = bucketStore.findBucketById('000');

      expect(result).toStrictEqual(bucket);
    });

    it('returns undefined when no matching bucket is found', () => {
      bucketStore.buckets = [bucket];

      const result = bucketStore.findBucketById('foo');

      expect(result).toStrictEqual(undefined);
    });
  });


  describe('updateBucket', () => {
    it('updates the bucket', async () => {
      updateBucketSpy.mockReturnValue({ data: {} } as any);

      await bucketStore.updateBucket('111', bucket2);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(updateBucketSpy).toHaveBeenCalledTimes(1);
      expect(updateBucketSpy).toHaveBeenCalledWith('111', bucket2);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });
});
