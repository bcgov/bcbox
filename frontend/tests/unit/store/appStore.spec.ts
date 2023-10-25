import { setActivePinia, createPinia } from 'pinia';

import { useAppStore } from '@/store';

import type { StoreGeneric } from 'pinia';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe('App Store', () => {
  let appStore: StoreGeneric;

  beforeEach(() => {
    appStore = useAppStore();
  });

  it('beginDeterminateLoading', () => {
    appStore.beginDeterminateLoading();
    expect(appStore.getLoadingValue).toBe(0);
    expect(appStore.getLoadingCalls).toBe(1);
    expect(appStore.getLoadingMode).toBe('determinate');
    expect(appStore.getIsLoading).toBeTruthy();
  });

  it('beginIndeterminateLoading', () => {
    appStore.beginIndeterminateLoading();
    expect(appStore.getLoadingCalls).toBe(1);
    expect(appStore.getLoadingMode).toBe('indeterminate');
    expect(appStore.getIsLoading).toBeTruthy();
  });

  it('endDeterminateLoading', () => {
    appStore.endDeterminateLoading();
    expect(appStore.getLoadingValue).toBe(100);
    setTimeout(() => {
      expect(appStore.getLoadingCalls).toBe(-1);
    }, 300);
  });

  it('endIndeterminateLoading', () => {
    appStore.endIndeterminateLoading();
    setTimeout(() => {
      expect(appStore.getLoadingCalls).toBe(-1);
    }, 300);
  });
});
