import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import Header from '@/components/layout/Header.vue';

// TODO: Figure out Config/Auth service mocking
describe.skip('Header.vue', () => {
  it('renders', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createTestingPinia()],
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
