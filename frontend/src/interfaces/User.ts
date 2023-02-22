import type { Audit } from '@/interfaces/common/Audit';

export interface User extends Audit {
  active: boolean;
  email: string;
  firstName: string;
  fullName: string;
  identityId: string;
  idp: string;
  lastName: string;
  userId: string;
  username: string;
}
