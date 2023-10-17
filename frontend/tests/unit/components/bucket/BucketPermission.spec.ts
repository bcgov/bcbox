import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import BucketPermission from '@/components/bucket/BucketPermission.vue';
import * as primevue from '@/lib/primevue';
import { StorageKey } from '@/utils/constants';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
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

describe('BucketPermission.vue', async () => {
  it('renders', () => {
    const testingPinia = createTestingPinia({
      initialState: {
        auth: {
          user: {}
        }
      }
    });

    const wrapper = mount(BucketPermission, {
      props: {
        bucketId: 'testBucketId'
      },
      global: {
        plugins: [
          ConfirmationService,
          PrimeVue,
          testingPinia,
          ToastService,
        ],
        stubs: ['font-awesome-icon', 'DataTable']
      },
    });

    expect(wrapper).toBeTruthy();
  });
});
