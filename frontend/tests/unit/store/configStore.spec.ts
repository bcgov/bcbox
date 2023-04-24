import { setActivePinia, createPinia } from 'pinia';

import { ConfigService } from '@/services';
import { useConfigStore } from '@/store';
import { StorageKey } from '@/utils/constants';

describe('Config Store', () => {
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

  describe('init', () => {
    it('initializes the service and sets the state', async () => {
      const configService = new ConfigService();
      const configStore = useConfigStore();

      const configServiceInitSpy = vi.spyOn(ConfigService, 'init');
      const configServiceGetConfigSpy = vi.spyOn(configService, 'getConfig').mockReturnValueOnce(sessionStorage.getItem(StorageKey.CONFIG));

      await configStore.init();

      expect(configServiceInitSpy).toHaveBeenCalledTimes(1);
      expect(configServiceGetConfigSpy).toHaveBeenCalledTimes(1);
      expect(configStore.getConfig).toStrictEqual(sessionStorage.getItem(StorageKey.CONFIG));
    });
  });
});
