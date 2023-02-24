import type { IAudit } from '@/interfaces';

export type BucketPermission = {
  bucketId: string;
  id: string;
  permCode: string;
  userId: string;
} & IAudit;
