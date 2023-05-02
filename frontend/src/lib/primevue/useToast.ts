import { useToast as useToastPrimevue } from 'primevue/usetoast';

import { app } from '@/main';
import { ConfigService } from '@/services/index';
import type { ToastMessageOptions } from 'primevue/toast';

export function success(title: string, msg: any, options: ToastMessageOptions = {}): void {
  app.config.globalProperties.$toast.add({
    severity: 'success',
    summary: title,
    detail: msg,
    life: new ConfigService().getConfig().toast.successTimeout,
    ...options
  });
};

export function info(msg: any, options: ToastMessageOptions = {}): void {
  app.config.globalProperties.$toast.add({
    severity: 'info',
    detail: msg,
    life: new ConfigService().getConfig().toast.successTimeout,
    ...options
  });
};

export const error = (title: string, msg: any, options: ToastMessageOptions = {}) => {
  app.config.globalProperties.$toast.add({
    severity: 'error',
    summary: title,
    detail: msg,
    life: new ConfigService().getConfig().toast.successTimeout,
    ...options
  });
};
