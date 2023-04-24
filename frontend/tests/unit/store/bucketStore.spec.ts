import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { bucketService } from '@/services';
import { useAppStore, useBucketStore, usePermissionStore } from '@/store';
import { StorageKey } from '@/utils/constants';

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

describe('Bucket Store', () => {

  describe('createBucket', () => {
    it('calls the service', async () => {
      const appStore = useAppStore();
      const bucketStore = useBucketStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const createBucketSpy = vi.spyOn(bucketService, 'createBucket')
        .mockReturnValueOnce({ data: {} } as any);

      await bucketStore.createBucket(bucket);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(createBucketSpy).toHaveBeenCalledTimes(1);
      expect(createBucketSpy).toHaveBeenCalledWith(bucket);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });


  describe('fetchBuckets', () => {
    it('gets the bucket list', async () => {
      const readPerm = {
        bucketId: '000',
        id: '0',
        permCode: 'READ',
        userId: '123'
      };

      const appStore = useAppStore();
      const bucketStore = useBucketStore();
      const permissionStore = usePermissionStore();
      permissionStore.bucketPermissions = [
        readPerm
      ];

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const searchBucketsSpy = vi.spyOn(bucketService, 'searchBuckets')
        .mockReturnValueOnce({ data: [bucket] } as any);
      const fetchBucketPermissionsSpy = vi.spyOn(permissionStore, 'fetchBucketPermissions')
        .mockReturnValueOnce([readPerm] as any);

      await bucketStore.fetchBuckets({ userId: '123', objectPerms: true });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toBeCalledWith({ userId: '123', objectPerms: true });
      expect(searchBucketsSpy).toHaveBeenCalledTimes(1);
      expect(searchBucketsSpy).toBeCalledWith({ bucketId: ['000'] });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(bucketStore.getBuckets).toStrictEqual([bucket]);
    });

    // TODO: Why is useToastSpy being called twice?
    it.skip('does not change state on error', async () => {
      const readPerm = {
        bucketId: '000',
        id: '0',
        permCode: 'READ',
        userId: '123'
      };

      const appStore = useAppStore();
      const bucketStore = useBucketStore();
      const permissionStore = usePermissionStore();
      permissionStore.bucketPermissions = [
        readPerm
      ];

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const searchBucketsSpy = vi.spyOn(bucketService, 'searchBuckets')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      const fetchBucketPermissionsSpy = vi.spyOn(permissionStore, 'fetchBucketPermissions')
        .mockReturnValueOnce([readPerm] as any);

      await bucketStore.fetchBuckets({ userId: '123', objectPerms: true });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toHaveBeenCalledTimes(1);
      expect(fetchBucketPermissionsSpy).toBeCalledWith({ userId: '123', objectPerms: true });
      expect(searchBucketsSpy).toHaveBeenCalledTimes(1);
      expect(searchBucketsSpy).toBeCalledWith({ bucketId: ['000'] });
      expect(useToastSpy).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.anything());
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(bucketStore.getBuckets).toStrictEqual([]);
    });
  });


  describe('findBucketById', () => {
    it('returns a matching bucket', () => {
      const bucketStore = useBucketStore();
      bucketStore.buckets = [bucket];

      const result = bucketStore.findBucketById('000');

      expect(result).toStrictEqual(bucket);
    });

    it('returns undefined when no matching bucket is found', () => {
      const bucketStore = useBucketStore();
      bucketStore.buckets = [bucket];

      const result = bucketStore.findBucketById('foo');

      expect(result).toStrictEqual(undefined);
    });
  });


  describe('updateBucket', () => {
    it('updates the bucket', async () => {
      const appStore = useAppStore();
      const bucketStore = useBucketStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const updateBucketSpy = vi.spyOn(bucketService, 'updateBucket')
        .mockReturnValueOnce({ data: {} } as any);

      await bucketStore.updateBucket('111', bucket2);

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(updateBucketSpy).toHaveBeenCalledTimes(1);
      expect(updateBucketSpy).toHaveBeenCalledWith('111', bucket2);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    });
  });
});
