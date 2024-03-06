import { createTestingPinia } from '@pinia/testing';
import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils';

import * as primevue from '@/lib/primevue';
import { inviteService } from '@/services';
import { StorageKey } from '@/utils/constants';
import InviteView from '@/views/invite/InviteView.vue';

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

type errorResponse = {
  response: {
    data: {
      type: string;
      title: string;
      status: number;
      detail: string;
      instance: string;
    };
  };
};

const BUCKET_ID = 'bucketId';
const mockToast = vi.fn();
const useToastSpy = vi.spyOn(primevue, 'useToast');
const useInviteService = vi.spyOn(inviteService, 'getInvite');

const emptyTestPinia = () => {
  return createTestingPinia({
    initialState: {
      auth: {
        user: {}
      }
    }
  });
};

const inviteViewWrapperSettings = () => {
  return {
    props: {
      token: 'placeholder'
    },
    global: {
      plugins: [emptyTestPinia(), PrimeVue, ToastService],
      stubs: {
        RouterLink: RouterLinkStub,
        'font-awesome-icon': true
      }
    }
  };
};

const unAuthError: errorResponse = {
  response: {
    data: {
      type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid authorization credentials',
      instance: 'string'
    }
  }
};

const forbiddenError: errorResponse = {
  response: {
    data: {
      type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403',
      title: 'Forbidden',
      status: 403,
      detail: 'User lacks permission to complete this action',
      instance: 'string'
    }
  }
};

const notFoundInviteError: errorResponse = {
  response: {
    data: {
      type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404',
      title: 'Not found',
      status: 404,
      detail: 'Not found',
      instance: 'string'
    }
  }
};

const notFoundBucketOrObjectError: errorResponse = {
  response: {
    data: {
      type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409',
      title: 'Not found',
      status: 409,
      detail: 'Not found',
      instance: 'string'
    }
  }
};

const mockRouter = {
  replace: vi.fn()
};

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
  useInviteService.mockImplementation(() =>
    Promise.resolve({ data: { type: BUCKET_ID, resource: 'placeholderUUID' } })
  );
});

afterEach(() => {
  sessionStorage.clear();
});

describe('InviteView.vue', async () => {
  it('renders', () => {
    const wrapper = shallowMount(InviteView, inviteViewWrapperSettings());

    expect(wrapper).toBeTruthy();
    expect(wrapper.find('h1').text()).toBe('Processing...');
    expect(useInviteService).toHaveBeenCalledTimes(1);
  });

  it('renders unauthorized error', async () => {
    // set type of error
    useInviteService.mockImplementation(() => Promise.reject(unAuthError));

    const wrapper = shallowMount(InviteView, inviteViewWrapperSettings());

    await flushPromises();
    expect(wrapper.find('h1').text()).toBe(unAuthError.response.data.title);
  });

  it('renders forbidden error', async () => {
    useInviteService.mockImplementation(() => Promise.reject(forbiddenError));

    const wrapper = shallowMount(InviteView, inviteViewWrapperSettings());

    await flushPromises();
    expect(wrapper.find('h1').text()).toBe(forbiddenError.response.data.title);
  });

  it('renders not found invite error', async () => {
    useInviteService.mockImplementation(() => Promise.reject(notFoundInviteError));

    const wrapper = shallowMount(InviteView, inviteViewWrapperSettings());

    await flushPromises();
    expect(wrapper.find('h1').text()).toBe(notFoundInviteError.response.data.title);
  });

  it('renders not found bucket/object error', async () => {
    useInviteService.mockImplementation(() => Promise.reject(notFoundBucketOrObjectError));

    const wrapper = shallowMount(InviteView, inviteViewWrapperSettings());

    await flushPromises();
    expect(wrapper.find('h1').text()).toBe(notFoundBucketOrObjectError.response.data.title);
  });

  it('redirects on valid response', async () => {
    useInviteService.mockImplementation(
      () => new Promise((resolve) => resolve({ type: BUCKET_ID, resource: 'placeholderUUID' }))
    );

    const wrapper = shallowMount(InviteView, {
      props: {
        token: 'placeholder'
      },
      global: {
        plugins: [emptyTestPinia(), PrimeVue, ToastService],
        stubs: {
          RouterLink: RouterLinkStub,
          'font-awesome-icon': true
        },
        mocks: {
          $router: mockRouter
        }
      }
    });
    expect(wrapper.find('h1').text()).toBe('Processing...');

    await flushPromises();

    expect(wrapper).toBeTruthy();
  });
});
