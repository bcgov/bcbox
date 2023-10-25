import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, useTagStore } from '@/store';

import type { StoreGeneric } from 'pinia';
import type { SpyInstance } from 'vitest';
import type { Tagging } from '@/types';

const mockToast = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');

const tag: Tagging = {
  tagset: [
    { key: 'foo', value: 'bar' },
    { key: 'baz', value: 'bam' }
  ],
  objectId: '000'
};

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  useToastSpy.mockImplementation(() => ({ error: mockToast, info: mockToast, success: mockToast, warn: mockToast }));
});

afterEach(() => {
  sessionStorage.clear();
});

describe('Config Store', () => {
  let appStore: StoreGeneric;
  let tagStore: StoreGeneric;

  let beginIndeterminateLoadingSpy: SpyInstance;
  let endIndeterminateLoadingSpy: SpyInstance;

  let getTaggingSpy: SpyInstance;

  beforeEach(() => {
    appStore = useAppStore();
    tagStore = useTagStore();

    beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
    endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');

    getTaggingSpy = vi.spyOn(objectService, 'getObjectTagging');
  });

  describe('fetchTagging', () => {
    it('fetches the tags', async () => {
      getTaggingSpy.mockReturnValue({ data: [tag] } as any);

      await tagStore.fetchTagging({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledWith({ objectId: '000' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(tagStore.getTagging).toStrictEqual([tag]);
    });

    it('does not change state on error', async () => {
      getTaggingSpy.mockImplementation(() => {
        throw new Error();
      });

      await tagStore.fetchTagging({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledWith({ objectId: '000' });
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith('Fetching tags', new Error());
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(tagStore.getTagging).toStrictEqual([]);
    });
  });

  describe('findTaggingByObjectId', () => {
    it('returns matching metadata', async () => {
      tagStore.tagging = [tag];

      const result = tagStore.findTaggingByObjectId('000');

      expect(result).toStrictEqual(tag);
    });

    it('returns undefined when no match found', async () => {
      tagStore.tagging = [tag];

      const result = tagStore.findTaggingByObjectId('111');

      expect(result).toStrictEqual(undefined);
    });
  });
});
