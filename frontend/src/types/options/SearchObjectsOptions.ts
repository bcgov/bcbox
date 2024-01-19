export type SearchObjectsOptions = {
  bucketId?: Array<string>;
  objectId?: Array<string>;
  name?: string;
  path?: string;
  mimeType?: string;
  tagset?: any;
  public?: boolean;
  active?: boolean;
  deleteMarker?: boolean;
  latest?: boolean;
  permissions?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
};
