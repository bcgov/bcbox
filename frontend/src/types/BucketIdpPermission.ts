import type { IAudit } from '@/interfaces';

export type BucketIdpPermission = {
  bucketId: string;
  id: string;
  permCode: string;
  idp: string;
} & IAudit;
