import { mount } from '@vue/test-utils';
import HelloWorld from '@/views/HelloWorld.vue';

describe('HelloWorld.vue', () => {
  it('renders', async () => {
    const wrapper = mount(HelloWorld);
    expect(wrapper.find('p').text()).toBe('Hello World!');
  });
});
