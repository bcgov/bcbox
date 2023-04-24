import { setActivePinia, createPinia } from 'pinia';
import { useAppStore } from '@/store';

describe('App Store', () => {
  beforeEach(() => {
    // Creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia());
  });

  it('beginDeterminateLoading', () => {
    const store = useAppStore();
    store.beginDeterminateLoading();
    expect(store.getLoadingValue).toBe(0);
    expect(store.getLoadingCalls).toBe(1);
    expect(store.getLoadingMode).toBe('determinate');
    expect(store.getIsLoading).toBeTruthy();
  });

  it('beginIndeterminateLoading', () => {
    const store = useAppStore();
    store.beginIndeterminateLoading();
    expect(store.getLoadingCalls).toBe(1);
    expect(store.getLoadingMode).toBe('indeterminate');
    expect(store.getIsLoading).toBeTruthy();
  });

  it('endDeterminateLoading', () => {
    const store = useAppStore();
    store.endDeterminateLoading();
    expect(store.getLoadingValue).toBe(100);
    setTimeout(() => {
      expect(store.getLoadingCalls).toBe(-1);
    }, 300);
  });

  it('endIndeterminateLoading', () => {
    const store = useAppStore();
    store.endIndeterminateLoading();
    setTimeout(() => {
      expect(store.getLoadingCalls).toBe(-1);
    }, 300);
  });
});
