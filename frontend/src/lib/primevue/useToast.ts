import { ToastTimeout } from '@/utils/constants';
import type { ToastMessageOptions } from 'primevue/toast';
import { useToast as useToastPrimevue } from 'primevue/usetoast';

export const useToast = () => {
  const toast = useToastPrimevue();

  const error = (title: string, msg: string = '', options: ToastMessageOptions = {}) => {
    const { severity = 'error', summary = `Error: ${title}`, detail = msg, life = ToastTimeout.ERROR } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  };

  const info = (title: string, msg: string = '', options: ToastMessageOptions = {}) => {
    const { severity = 'info', summary = `Info: ${title}`, detail = msg, life = ToastTimeout.INFO } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  };

  const success = (title: string, msg: string = '', options: ToastMessageOptions = {}) => {
    const { severity = 'success', summary = `Success: ${title}`, detail = msg, life = ToastTimeout.SUCCESS } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  };

  const warn = (title: string, msg: string = '', options: ToastMessageOptions = {}) => {
    const { severity = 'warn', summary = `Warning: ${title}`, detail = msg, life = ToastTimeout.WARNING } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  };

  return { error, info, success, warn };
};
