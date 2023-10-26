import { createTestingPinia } from '@pinia/testing';
import { mount, RouterLinkStub } from '@vue/test-utils';

import BucketTable from '@/components/bucket/BucketTable.vue';
import * as primevue from '@/lib/primevue';
import { StorageKey } from '@/utils/constants';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

const mockToast = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');

beforeEach(() => {
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
  useToastSpy.mockImplementation(() => ({ error: mockToast, info: mockToast, success: mockToast, warn: mockToast }));
});

afterEach(() => {
  sessionStorage.clear();
});

describe('BucketList.vue', async () => {
  it('renders', () => {
    const testingPinia = createTestingPinia({
      initialState: {
        auth: {
          user: {}
        }
      }
    });

    const wrapper = mount(BucketTable, {
      global: {
        plugins: [ConfirmationService, testingPinia, PrimeVue, ToastService],
        stubs: {
          RouterLink: RouterLinkStub,
          'font-awesome-icon': true
        },
        directives: {
          Tooltip: Tooltip
        }
      }
    });

    expect(wrapper).toBeTruthy();
  });
});
