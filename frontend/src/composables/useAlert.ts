import { useConfirm } from '@/lib/primevue';

export function useAlert(header: string, message: string) {
  const confirm = useConfirm();

  const show = () => {
    confirm.require({
      header: header,
      message: message,
      acceptLabel: 'OK',
      rejectClass: 'hidden'
    });
  };

  return { show };
}
