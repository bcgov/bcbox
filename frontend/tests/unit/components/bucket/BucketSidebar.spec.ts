import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import BucketSidebar from '@/components/bucket/BucketSidebar.vue';
import * as primevue from '@/lib/primevue';
import { StorageKey } from '@/utils/constants';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

const mockToast = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');
const testSidebarInfo = {
  bucketId: '11111111-2222-3333-4444-555555555555',
  bucketName: 'Minio',
  accessKeyId: 'REDACTED',
  bucket: 'testbucket',
  endpoint: 'http://127.0.0.1:9000',
  key: '/',
  secretAccessKey: 'REDACTED',
  region: 'null',
  active: true,
  createdBy: '11111111-2222-3333-4444-555555555555',
  createdAt: '2023-09-28T21:25:38.927Z',
  updatedBy: '2023-09-28T21:25:38.927Z',
  updatedAt: '2023-09-28T21:25:38.927Z'
};
const testUserSearch = [
  {
    userId: 'ABCDEF123456789',
    identityId: '123456789ABCDEF',
    idp: 'idir',
    username: '1111111111111@idir',
    email: 'test@gov.bc.ca',
    firstName: 'wil',
    fullName: 'Wong, wil WLRS:EX',
    lastName: 'Wong',
    active: true,
    createdBy: '00000000-0000-0000-0000-000000000000',
    createdAt: '2023-08-02T22:09:21.042Z',
    updatedBy: null,
    updatedAt: null
  }
];

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
  useToastSpy.mockImplementation(() => ({ error: mockToast, info: mockToast, success: mockToast, warn: mockToast }));
});

afterEach(() => {
  sessionStorage.clear();
});

describe('BucketSidebar.vue', async () => {
  it('renders', () => {
    const testingPinia = createTestingPinia({
      initialState: {
        user: {
          userSearch: testUserSearch
        }
      }
    });

    const wrapper = shallowMount(BucketSidebar, {
      props: {
        sidebarInfo: testSidebarInfo
      },
      global: {
        plugins: [testingPinia, PrimeVue, ToastService],
        stubs: ['font-awesome-icon']
      }
    });

    expect(wrapper).toBeTruthy();
  });

  it('expect to match test data', () => {
    const testingPinia = createTestingPinia({
      initialState: {
        user: {
          userSearch: testUserSearch
        }
      }
    });

    const wrapper = shallowMount(BucketSidebar, {
      props: {
        sidebarInfo: testSidebarInfo
      },
      global: {
        plugins: [testingPinia, PrimeVue, ToastService],
        stubs: ['font-awesome-icon']
      }
    });
    const textArray: Array<string> = [];
    wrapper.findAll('div').forEach((ele) => {
      textArray.push(ele.text());
    });
    expect(textArray).toContain(`Bucket ID:${testSidebarInfo.bucketId}`);
    expect(textArray).toContain(`Bucket Name:${testSidebarInfo.bucketName}`);
  });

  it('emits close modal', async () => {
    const testingPinia = createTestingPinia({
      initialState: {
        user: {
          userSearch: testUserSearch
        }
      }
    });

    const wrapper = shallowMount(BucketSidebar, {
      props: {
        sidebarInfo: testSidebarInfo
      },
      global: {
        plugins: [testingPinia, PrimeVue, ToastService],
        stubs: ['font-awesome-icon']
      }
    });

    const btn = wrapper.get('button-stub');
    await btn.trigger('click');

    expect(wrapper.emitted()).toHaveProperty('close-sidebar-info');
  });
});
