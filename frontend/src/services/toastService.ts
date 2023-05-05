import type { ToastMessageOptions } from 'primevue/toast';

import { ConfigService } from '@/services/index';
import { app } from '@/main';

export const error = (title: string, msg: string, options: ToastMessageOptions = {}) => {
  app.config.globalProperties.$toast.add({
    severity: 'error',
    summary: 'Error:' + ' ' + title,
    detail: msg,
    life: new ConfigService().getConfig().toast.successTimeout,
    ...options
  });
};

export function info(msg: string, options: ToastMessageOptions = {}): void {
  app.config.globalProperties.$toast.add({
    severity: 'info',
    detail: msg,
    life: new ConfigService().getConfig().toast.successTimeout,
    ...options
  });
};

export function success(title: string, msg: string, options: ToastMessageOptions = {}): void {
  app.config.globalProperties.$toast.add({
    severity: 'success',
    summary: 'Sucess:' + ' ' + title,
    detail: msg,
    life: new ConfigService().getConfig().toast.successTimeout,
    ...options
  });
};
