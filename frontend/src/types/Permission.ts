import type { IAudit } from '@/interfaces';

export type Permission = {
  active: boolean;
  permCode: string;
} & IAudit;
