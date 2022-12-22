import type { Metadata } from '@/interfaces';

export interface COMSObject {
  // Object columns
  active: boolean;
  bucketId: string;
  createdAt: string;
  createdBy: string;
  id: string;
  path: string;
  public: boolean;
  updatedAt: string;
  updatedBy: string;

  // Additional
  metadata: Metadata;
  tags: Object;

  // Filled from metadata if available for easier reference
  name: string;
}
