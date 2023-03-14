export type SearchObjectsOptions = {
  bucketId?: Array<string>;
  objectId?: Array<string>;
  name?: string,
  path?: string,
  mimeType?: string,
  //tagset: type.tagset(),
  public?: boolean,
  active?: boolean,
  deleteMarker?: boolean,
  latest?: boolean,
}
