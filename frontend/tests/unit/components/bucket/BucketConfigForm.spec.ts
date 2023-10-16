import { createTestingPinia } from '@pinia/testing';
import { mount, shallowMount, RouterLinkStub } from '@vue/test-utils';

import BucketConfigForm from '@/components/bucket/BucketConfigForm.vue';
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

describe('BucketConfigForm.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(BucketConfigForm, {
      global: {
        plugins: [PrimeVue, createTestingPinia(), ToastService],
        stubs: {
          RouterLink: RouterLinkStub
        },
      },
      props: {}
    });
    expect(wrapper).toBeTruthy();
  });

  it('it emits cancel config', async () => {
    const wrapper = mount(BucketConfigForm, {
      global: {
        plugins: [PrimeVue, createTestingPinia(), ToastService],
        stubs: {
          RouterLink: RouterLinkStub
        },
      },
      props: {}
    });

    const cancelButton = wrapper.get('[aria-label="Cancel"]');
    await cancelButton.trigger('click');

    expect(wrapper.emitted()).toHaveProperty('cancel-bucket-config');
  });

  it('it emits triggers onSubmit error', async () => {
    const wrapper = mount(BucketConfigForm, {
      global: {
        plugins: [PrimeVue, createTestingPinia(), ToastService],
        stubs: {
          RouterLink: RouterLinkStub
        },
      },
      props: {}
    });

    const submitBtn = wrapper.get('[aria-label="Apply"]');
    await submitBtn.trigger('click');

    expect(useToastSpy).toHaveBeenCalled();
    expect(wrapper).toBeTruthy();
  });
});
