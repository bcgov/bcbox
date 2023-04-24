import { setActivePinia, createPinia } from 'pinia';

import * as primevue from '@/lib/primevue';
import { objectService } from '@/services';
import { useAppStore, useMetadataStore } from '@/store';

import type { Metadata } from '@/types';

const meta: Metadata = {
  metadata: [
    { key: 'foo', value: 'bar' },
    { key: 'baz', value: 'bam' }
  ],
  objectId: '000'
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

describe('Metadata Store', () => {

  describe('fetchMetadata', () => {
    it('fetches the metadata', async () => {
      const appStore = useAppStore();
      const metadataStore = useMetadataStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const getMetadataSpy = vi.spyOn(objectService, 'getMetadata')
        .mockReturnValueOnce({ data: [meta] } as any);

      await metadataStore.fetchMetadata({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledWith(null, { objectId: '000' });
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(metadataStore.getMetadata).toStrictEqual([meta]);
    });

    it('does not change state on error', async () => {
      const appStore = useAppStore();
      const metadataStore = useMetadataStore();

      const beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
      const endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
      const getMetadataSpy = vi.spyOn(objectService, 'getMetadata')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      await metadataStore.fetchMetadata({ objectId: '000' });

      expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledTimes(1);
      expect(getMetadataSpy).toHaveBeenCalledWith(null, { objectId: '000' });
      expect(useToastSpy).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.anything());
      expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
      expect(metadataStore.getMetadata).toStrictEqual([]);
    });
  });


  describe('findMetadataByObjectId', () => {
    it('returns matching metadata', async () => {
      const metadataStore = useMetadataStore();
      metadataStore.metadata = [meta];

      const result = metadataStore.findMetadataByObjectId('000');

      expect(result).toStrictEqual(meta);
    });

    it('returns undefined when no match found', async () => {
      const metadataStore = useMetadataStore();
      metadataStore.metadata = [meta];

      const result = metadataStore.findMetadataByObjectId('111');

      expect(result).toStrictEqual(undefined);
    });
  });


  describe('findValue', () => {
    it('returns matching metadata', async () => {
      const metadataStore = useMetadataStore();
      metadataStore.metadata = [meta];

      const result = metadataStore.findValue('000', 'foo');

      expect(result).toStrictEqual('bar');
    });

    it('returns undefined when no match found', async () => {
      const metadataStore = useMetadataStore();
      metadataStore.metadata = [meta];

      const result = metadataStore.findValue('111', 'foo');

      expect(result).toStrictEqual(undefined);
    });
  });
});
