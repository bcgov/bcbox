import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { objectService, versionService } from '@/services';
import { useAppStore, useVersionStore } from '@/store';

import type { StoreGeneric } from 'pinia';
import type { SpyInstance } from 'vitest';
import type { Metadata, Tagging, Version } from '@/types';

const meta: Metadata = {
  metadata: [
    { key: 'foo', value: 'bar' },
    { key: 'baz', value: 'bam' }
  ],
  versionId: '000'
};

const tag: Tagging = {
  tagset: [
    { key: 'foo', value: 'bar' },
    { key: 'baz', value: 'bam' }
  ],
  versionId: '000'
};

const version: Version = {
  deleteMarker: false,
  id: '123',
  mimeType: 'image/jpg',
  objectId: '000',
  s3VersionId: 's3123',
  isLatest: true,
  createdAt: '2023-05-01T22:18:12.553Z',
  lastModifiedDate: '2023-05-01T22:18:12.553Z'
};

const versionOld: Version = {
  deleteMarker: false,
  id: '110',
  mimeType: 'image/jpg',
  objectId: '000',
  s3VersionId: 's2000',
  isLatest: false,
  createdAt: '2022-05-01T18:25:42.462Z',
  lastModifiedDate: '2023-05-01T22:18:12.553Z'
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

describe('Version Store', () => {
  let appStore: StoreGeneric;
  let versionStore: StoreGeneric;

  let beginIndeterminateLoadingSpy: SpyInstance;
  let endIndeterminateLoadingSpy: SpyInstance;

  let getMetadataSpy: SpyInstance;
  let getTaggingSpy: SpyInstance;
  let getVersionsSpy: SpyInstance;

  beforeEach(() => {
    appStore = useAppStore();
    versionStore = useVersionStore();

    beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
    endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

    getMetadataSpy = vi.spyOn(versionService, 'getMetadata');
    getTaggingSpy = vi.spyOn(versionService, 'getObjectTagging');
    getVersionsSpy = vi.spyOn(objectService, 'listObjectVersion');
  });

  describe('fetchMetadata', () => {
    it('fetches the metadata', async () => {
      getMetadataSpy.mockReturnValue({ data: [meta] } as any);

      await versionStore.fetchMetadata({ versionId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledWith(null, { versionId: '000' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(versionStore.getMetadata).toStrictEqual([meta]);
    });

    it('does not change state on error', async () => {
      getMetadataSpy.mockImplementation(() => {
        throw new Error();
      });

      await versionStore.fetchMetadata({ versionId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledWith(null, { versionId: '000' });
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith('Fetching metadata', new Error(), { life: 0 });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(versionStore.getMetadata).toStrictEqual([]);
    });
  });

  describe('fetchTagging', () => {
    it('fetches the tags', async () => {
      getTaggingSpy.mockReturnValue({ data: [tag] } as any);

      await versionStore.fetchTagging({ versionId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledWith({ versionId: '000' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(versionStore.getTagging).toStrictEqual([tag]);
    });

    it('does not change state on error', async () => {
      getTaggingSpy.mockImplementation(() => {
        throw new Error();
      });

      await versionStore.fetchTagging({ versionId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledWith({ versionId: '000' });
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith('Fetching tags', new Error(), { life: 0 });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(versionStore.getTagging).toStrictEqual([]);
    });
  });

  describe('fetchVersions', () => {
    it('fetches the versions', async () => {
      getVersionsSpy.mockReturnValue({ data: [version] } as any);

      await versionStore.fetchVersions({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getVersionsSpy).toHaveBeenCalledTimes(1);
      expect(getVersionsSpy).toHaveBeenCalledWith('000');
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(versionStore.getVersions).toStrictEqual([version]);
    });

    it('does not change state on error', async () => {
      getVersionsSpy.mockImplementation(() => {
        throw new Error();
      });

      await versionStore.fetchVersions({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getVersionsSpy).toHaveBeenCalledTimes(1);
      expect(getVersionsSpy).toHaveBeenCalledWith('000');
      expect(mockToast).toHaveBeenCalledTimes(0);
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(versionStore.getTagging).toStrictEqual([]);
    });
  });

  describe('getLatestVersionIdByObjectId', () => {
    it('returns latest version', async () => {
      versionStore.versions = [versionOld, version];

      const result = versionStore.getLatestVersionIdByObjectId('000');

      expect(result).toStrictEqual('123');
    });

    it('returns undefined when no matches found', async () => {
      versionStore.versions = [versionOld, version];

      const result = versionStore.getLatestVersionIdByObjectId('111');

      expect(result).toStrictEqual(undefined);
    });
  });

  describe('getMetadataByVersionId', () => {
    it('returns matching metadata', async () => {
      versionStore.metadata = [meta];

      const result = versionStore.getMetadataByVersionId('000');

      expect(result).toStrictEqual(meta);
    });

    it('returns undefined when no match found', async () => {
      versionStore.metadata = [meta];

      const result = versionStore.getMetadataByVersionId('111');

      expect(result).toStrictEqual(undefined);
    });
  });

  describe('findMetadataValue', () => {
    it('returns matching metadata', async () => {
      versionStore.metadata = [meta];

      const result = versionStore.findMetadataValue('000', 'foo');

      expect(result).toStrictEqual('bar');
    });

    it('returns undefined when no match found', async () => {
      versionStore.metadata = [meta];

      const result = versionStore.findMetadataValue('111', 'foo');

      expect(result).toStrictEqual(undefined);
    });
  });

  describe('getVersion', () => {
    it('returns matching version', async () => {
      versionStore.versions = [version];

      const result = versionStore.getVersion('123');

      expect(result).toStrictEqual(version);
    });

    it('returns undefined when no match found', async () => {
      versionStore.versions = [version];

      const result = versionStore.getVersion('100');

      expect(result).toStrictEqual(undefined);
    });
  });

  describe('getVersionsByObjectId', () => {
    it('returns matching versions', async () => {
      versionStore.versions = [version];

      const result = versionStore.getVersionsByObjectId('000');

      expect(result).toStrictEqual([version]);
    });

    it('returns empty array when no matches found', async () => {
      versionStore.versions = [version];

      const result = versionStore.getVersionsByObjectId('999');

      expect(result).toStrictEqual([]);
    });
  });
});
