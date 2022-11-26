import { useToast } from 'primevue/usetoast';

export async function useToaster(callback: Function, options: any = {}) {
  const toast = useToast();
  try {
    await callback();
  } catch (error: any) {
    const { severity = 'error', summary = 'Unable to load data.', detail = error, life = 5000 } = options;
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
  }

  return;
}
