import { setActivePinia, createPinia } from 'pinia';

import { ConfigService } from '@/services';
import { useConfigStore } from '@/store';
import { StorageKey } from '@/utils/constants';

import type { StoreGeneric } from 'pinia';
import type { SpyInstance } from 'vitest';

beforeEach(() => {
  setActivePinia(createPinia());

  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('Config Store', () => {
  let configService: ConfigService;
  let configStore: StoreGeneric;

  let configServiceInitSpy: SpyInstance;
  let configServiceGetConfigSpy: SpyInstance;

  beforeEach(() => {
    configService = new ConfigService();
    configStore = useConfigStore();

    configServiceInitSpy = vi.spyOn(ConfigService, 'init');
    configServiceGetConfigSpy = vi.spyOn(configService, 'getConfig');
  });

  describe('init', () => {
    it('initializes the service and sets the state', async () => {
      configServiceGetConfigSpy.mockReturnValue(sessionStorage.getItem(StorageKey.CONFIG));

      await configStore.init();

      expect(configServiceInitSpy).toHaveBeenCalledTimes(1);
      expect(configServiceGetConfigSpy).toHaveBeenCalledTimes(1);
      expect(configStore.getConfig).toStrictEqual(sessionStorage.getItem(StorageKey.CONFIG));
    });
  });
});
