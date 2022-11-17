import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import BCGovHeader from '@/components/bcgov/BCGovHeader.vue';

describe('BCGovHeader.vue', () => {
  it('renders', async () => {
    const wrapper = mount(BCGovHeader, {
      global: {
        plugins: [createTestingPinia()],
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
