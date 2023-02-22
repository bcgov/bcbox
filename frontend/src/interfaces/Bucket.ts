import type { Audit } from '@/interfaces/common/Audit';

export interface Bucket extends Audit {
  bucketId: string;
  bucketName: string;
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  key: string;
  secretAccessKey: string;
  region: string;
  active: boolean;
}
