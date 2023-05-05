import type { ToastMessageOptions } from 'primevue/toast';
import { useToast as useToastPrimevue } from 'primevue/usetoast';

import { ToastTimeout } from '@/utils/constants';

export const useToast = () => {
  const toast = useToastPrimevue();

  const error = (title: string, msg: string, options: ToastMessageOptions = {}) => {
    const {
      severity = 'error',
      summary = 'Error: ' + title,
      detail = msg,
      life = ToastTimeout.ERROR
    } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  };
  const info = (title: string, msg: string, options: ToastMessageOptions = {}) => {
    const {
      severity = 'info',
      summary = 'Info: ' + title,
      detail = msg,
      life = ToastTimeout.SUCCESS
    } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  };
  const success = (title: string, msg: string, options: ToastMessageOptions = {}) => {
    const {
      severity = 'error',
      summary = 'Sucess: ' + title,
      detail = msg,
      life = ToastTimeout.SUCCESS
    } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  };

  return { error, info, success };
};
