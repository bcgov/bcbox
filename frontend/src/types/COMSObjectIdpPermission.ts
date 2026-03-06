import type { IAudit } from '@/interfaces';

export type COMSObjectIdpPermission = {
  id: string;
  objectId: string;
  permCode: string;
  idp: string;
} & IAudit;
