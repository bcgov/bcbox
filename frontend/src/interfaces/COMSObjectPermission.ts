import type { Audit } from '@/interfaces/common/Audit';

export interface COMSObjectPermission extends Audit {
  id: string;
  objectId: string;
  permCode: string;
  userId: string;
}
