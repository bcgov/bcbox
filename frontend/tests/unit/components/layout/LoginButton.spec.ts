import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { useRouter, useRoute } from 'vue-router';

import PrimeVue from 'primevue/config';
import LoginButton from '@/components/layout/LoginButton.vue';
import { StorageKey } from '@/utils/constants';
import { useAuthStore } from '@/store';
import { RouteNames } from '@/utils/constants';

// Mock router calls
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: () => { }
  }))
}));

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
});

afterEach(() => {
  sessionStorage.clear();
});

describe('LoginButton.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(LoginButton, {
      global: {
        plugins: [createTestingPinia(), PrimeVue],
      },
    });
    expect(wrapper).toBeTruthy();
  });

  describe('unauthenticated', () => {
    it('renders login button', async () => {
      const wrapper = mount(LoginButton, {
        global: {
          plugins: [createTestingPinia(), PrimeVue],
        },
      });

      const authStore = useAuthStore();
      authStore.isAuthenticated = false;
      await flushPromises();

      const btn = wrapper.getComponent({ name: 'Button' });
      expect(btn.text()).toBe('Log in');
    });

    it('navigates to login on click', async () => {
      (useRoute as any).mockImplementation(() => ({
        params: { name: RouteNames.LOGIN }
      }));

      const push = vi.fn();
      (useRouter as any).mockImplementation(() => ({
        push
      }));

      const wrapper = shallowMount(LoginButton, {
        global: {
          plugins: [createTestingPinia(), PrimeVue],
          stubs: ['router-link', 'router-view'],
        },
      });

      const authStore = useAuthStore();
      authStore.isAuthenticated = false;
      await flushPromises();

      const btn = wrapper.getComponent({ name: 'Button' });
      await btn.trigger('click');
      expect(push).toBeCalledTimes(1);
      expect(push).toBeCalledWith({ name: RouteNames.LOGIN });
    });
  });


  describe('authenticated', () => {
    it('renders logout button', async () => {
      const wrapper = mount(LoginButton, {
        global: {
          plugins: [createTestingPinia(), PrimeVue],
        },
      });

      const authStore = useAuthStore();
      authStore.isAuthenticated = true;
      await flushPromises();

      const btn = wrapper.getComponent({ name: 'Button' });
      expect(btn.text()).toBe('Log out');
    });

    it('navigates to logout on click', async () => {
      (useRoute as any).mockImplementation(() => ({
        params: { name: RouteNames.LOGOUT }
      }));

      const push = vi.fn();
      (useRouter as any).mockImplementation(() => ({
        push
      }));

      const wrapper = shallowMount(LoginButton, {
        global: {
          plugins: [createTestingPinia(), PrimeVue],
          stubs: ['router-link', 'router-view'],
        },
      });

      const authStore = useAuthStore();
      authStore.isAuthenticated = true;
      await flushPromises();

      const btn = wrapper.getComponent({ name: 'Button' });
      await btn.trigger('click');
      expect(push).toBeCalledTimes(1);
      expect(push).toBeCalledWith({ name: RouteNames.LOGOUT });
    });
  });
});
