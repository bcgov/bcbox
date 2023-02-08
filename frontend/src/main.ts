import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import getRouter from './router';
import { AuthService, ConfigService } from './services';

import './assets/main.scss';

// PrimeVue
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/**
 * @function initializeApp
 * Initializes and mounts the Vue instance
 */
function initializeApp(): void {
  const app = createApp(App);
  library.add(fas);

  app.use(getRouter());
  app.use(createPinia());
  app.use(PrimeVue);
  app.use(ToastService);
  app.use(ConfirmationService);
  app.component('FontAwesomeIcon', FontAwesomeIcon);
  app.directive('tooltip', Tooltip);

  app.mount('#app');
}

/**
 * @function initializeServices
 * Initializes and mounts the service singletons
 * Services must blocking-load in the following order: config, auth, then app.
 */
async function initializeServices(next?: Function): Promise<void> {
  await ConfigService.init();
  await AuthService.init();
  if (next) next();
}

initializeServices(initializeApp);
