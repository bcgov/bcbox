export interface Metadata {
  createddAt: string;
  createdBy: string;
  deleteMarker: boolean;
  id: string;
  metadata: Array<{ id: string; key: string; value: string }>;
  mimeType: string;
  objectId: string;
  updatedAt: string;
  updatedBy: string;
  versionId: string;
}
