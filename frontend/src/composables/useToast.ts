import { useToast as usePrimeVueToast } from 'primevue/usetoast';

export async function useToast(callback: Function, options: any = {}) {
  const toast = usePrimeVueToast();
  try {
    await callback();
  } catch (error: any) {
    const { severity = 'error', summary = 'Unable to load data.', detail = error, life = 5000 } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  }

  return;
}
