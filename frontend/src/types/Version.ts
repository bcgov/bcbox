import type { IAudit } from '@/interfaces';

export type Version = {
  createdAt: string;
  deleteMarker: boolean;
  isLatest: boolean;
  id: string;
  mimeType: string;
  objectId: string;
  s3VersionId: string;
  lastModifiedDate: string;
} & IAudit;
