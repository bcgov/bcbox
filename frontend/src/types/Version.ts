import type { IAudit } from '@/interfaces';

export type Version = {
  deleteMarker: boolean;
  id: string;
  mimeType: string;
  objectId: string;
  s3VersionId: string;
} & IAudit;
