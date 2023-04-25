import { setActivePinia, createPinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as primevue from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, useTagStore } from '@/store';

import type { Tagging } from '@/types';

const mockAdd = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast').mockImplementation(() => ({ add: mockAdd }));

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('Config Store', () => {

  describe('fetchTagging', () => {
    it('fetches the tags', async () => {
      const appStore = useAppStore();
      const tagStore = useTagStore();

      const tag: Tagging = {
        tagset: [
          { key: 'foo', value: 'bar' },
          { key: 'baz', value: 'bam' }
        ],
        objectId: '000'
      };

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const getTaggingSpy = vi.spyOn(objectService, 'getObjectTagging')
        .mockReturnValueOnce({ data: [tag] } as any);

      await tagStore.fetchTagging({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledWith({ objectId: '000' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(tagStore.getTagging).toStrictEqual([tag]);
    });

    it('does not change state on error', async () => {
      const appStore = useAppStore();
      const tagStore = useTagStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const getTaggingSpy = vi.spyOn(objectService, 'getObjectTagging')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      await tagStore.fetchTagging({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledTimes(1);
      expect(getTaggingSpy).toHaveBeenCalledWith({ objectId: '000' });
      expect(useToastSpy).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.anything());
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(tagStore.getTagging).toStrictEqual([]);
    });
  });


  describe('findTaggingByObjectId', () => {
    it('returns matching metadata', async () => {
      const tag: Tagging = {
        tagset: [
          { key: 'foo', value: 'bar' },
          { key: 'baz', value: 'bam' }
        ],
        objectId: '000'
      };

      const tagStore = useTagStore();
      tagStore.tagging = [tag];

      const result = tagStore.findTaggingByObjectId('000');

      expect(result).toStrictEqual(tag);
    });

    it('returns undefined when no match found', async () => {
      const tag: Tagging = {
        tagset: [
          { key: 'foo', value: 'bar' },
          { key: 'baz', value: 'bam' }
        ],
        objectId: '000'
      };

      const tagStore = useTagStore();
      tagStore.tagging = [tag];

      const result = tagStore.findTaggingByObjectId('111');

      expect(result).toStrictEqual(undefined);
    });
  });
});
