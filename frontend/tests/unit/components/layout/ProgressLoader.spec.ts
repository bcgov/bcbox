import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import { ProgressBar } from '@/lib/primevue';
import PrimeVue from 'primevue/config';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('ProgressBar.vue', () => {
  it('renders', () => {
    const wrapper = mount(ProgressBar, {
      global: {
        plugins: [createTestingPinia(), PrimeVue]
      }
    });
    expect(wrapper).toBeTruthy();
  });
});
