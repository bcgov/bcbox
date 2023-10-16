
import { mount } from '@vue/test-utils';

import { ProgressSpinner } from '@/lib/primevue';
import PrimeVue from 'primevue/config';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('ProgressSpinner.vue', () => {
  it('renders', () => {
    const wrapper = mount(ProgressSpinner, {
      global: {
        plugins: [PrimeVue],
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
