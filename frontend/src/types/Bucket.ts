import type { IAudit } from '@/interfaces';

export type Bucket = {
  active: boolean;
  accessKeyId: string;
  bucket: string;
  bucketId: string;
  bucketName: string;
  endpoint: string;
  key: string;
  region: string;
  secretAccessKey: string;
} & IAudit;
