export type SearchObjectsOptions = {
  bucketId?: string[];
  objectId?: string[];
  name?: string,
  path?: string,
  mimeType?: string,
  //tagset: type.tagset(),
  public?: boolean,
  active?: boolean,
  deleteMarker?: boolean,
  latest?: boolean,
}
