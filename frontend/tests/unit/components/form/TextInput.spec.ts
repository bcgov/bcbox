import { describe, expect, it } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

import TextInput from '@/components/form/TextInput.vue';

describe('TextInput.vue', () => {
  it('renders', async () => {
    const wrapper = mount(TextInput, {
      props: {
        name: 'test',
      },
    });

    const input = wrapper.find('input[name="test"]');
    expect(input).toBeTruthy();
  });

  // TODO: Find a way to get an updated DOM after the event change
  // The validation element is not being rendered
  it.skip('validates', async () => {
    const wrapper = mount(TextInput, {
      props: {
        name: 'test'
      },
    });

    await wrapper.find('input[name="test"]').setValue('');
    await wrapper.find('input[name="test"]').trigger('blur');
    await flushPromises();
    expect(wrapper.find('span').isVisible()).toBe(true);
  });
});
