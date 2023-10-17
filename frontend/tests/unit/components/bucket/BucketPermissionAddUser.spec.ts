import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import BucketPermissionAddUser from '@/components/bucket/BucketPermissionAddUser.vue';
import * as primevue from '@/lib/primevue';
import { StorageKey } from '@/utils/constants';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

const mockToast = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');

beforeEach(() => {
  sessionStorage.setItem(StorageKey.CONFIG, JSON.stringify(
    {
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    }
  ));

  vi.clearAllMocks();
  useToastSpy.mockImplementation(() => ({ error: mockToast, info: mockToast, success: mockToast, warn: mockToast }));
});

afterEach(() => {
  sessionStorage.clear();
});

describe('BucketPermissionAddUser.vue', async () => {
  it('renders', () => {
    const testingPinia = createTestingPinia({
      initialState: {
        auth: {
          user: {}
        }
      }
    });

    const wrapper = shallowMount(BucketPermissionAddUser, {
      global: {
        plugins: [
          testingPinia,
          PrimeVue,
          ToastService,
        ],
        stubs: ['font-awesome-icon']
      },
    });

    expect(wrapper).toBeTruthy();
  });
});
