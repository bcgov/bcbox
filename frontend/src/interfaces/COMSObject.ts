import type { Audit } from '@/interfaces/common/Audit';
export interface COMSObject extends Audit {
  active: boolean;
  bucketId: string;
  id: string;
  path: string;
  public: boolean;
}
