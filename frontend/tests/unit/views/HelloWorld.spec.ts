import { mount } from '@vue/test-utils';
// import HelloWorld from '@/views/HelloWorld.vue';

// Skip until a real view test can be added in here
describe('HelloWorld.vue', () => {
  it.skip('renders', async () => {
    const wrapper = mount(HelloWorld);
    expect(wrapper.find('p').text()).toBe('Hello World!');
  });
});
