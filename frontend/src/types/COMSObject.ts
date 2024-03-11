import type { IAudit } from '@/interfaces';

export type COMSObject = {
  active: boolean;
  bucketId: string;
  id: string;
  lastSyncedDate?: string;
  name: string;
  path: string;
  public: boolean;
} & IAudit;
