import type { Permission } from '@/interfaces';

export interface Bucket {
  bucketId: string;
  bucketName: string;
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  key: string;
  secretAccessKey: string;
  region: string;
  active: boolean;

  // Optional array of current user permissions to the bucket
  userPermissions?: Array<Permission>;
}
