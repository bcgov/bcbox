import { createTestingPinia } from '@pinia/testing';
import { mount, shallowMount } from '@vue/test-utils';

import BucketList from '@/components/bucket/BucketList.vue';
import * as primevue from '@/lib/primevue';
import { usePermissionStore } from '@/store';
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

describe('BucketList.vue', async () => {
  it('renders', () => {
    const testingPinia = createTestingPinia({
      initialState: {
        auth: {
          user: {}
        }
      }
    });

    const wrapper = shallowMount(BucketList, {
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

  it('shows connect bucket button', async () => {
    // Mock isUserElevatedRights to return true
    const pinia = createTestingPinia();
    const permStore = usePermissionStore(pinia);
    vi.mocked(permStore.isUserElevatedRights).mockReturnValue(true);

    const wrapper = mount(BucketList, {
      global: {
        plugins: [
          PrimeVue,
          ToastService,
          pinia,
        ],
        stubs: [
          'font-awesome-icon',
          'BucketTable'
        ]
      },
    });

    const button = wrapper.find('[icon="fa-solid fa-plus"]');

    expect(button.isVisible()).toBeTruthy();
  });
});
