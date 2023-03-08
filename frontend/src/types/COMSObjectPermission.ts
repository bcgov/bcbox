import type { IAudit } from '@/interfaces';

export type COMSObjectPermission = {
  id: string;
  objectId: string;
  permCode: string;
  userId: string;
} & IAudit;
