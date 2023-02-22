import type { Audit } from '@/interfaces/common/Audit';

export interface BucketPermission extends Audit {
  bucketId: string;
  id: string;
  permCode: string;
  userId: string;
}
