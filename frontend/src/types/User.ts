import type { IAudit } from '@/interfaces';

export type User = {
  active: boolean;
  email: string;
  firstName: string;
  fullName: string;
  identityId: string;
  idp: string;
  lastName: string;
  userId: string;
  username: string;
  elevatedRights: boolean;
} & IAudit;
