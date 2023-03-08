export type SearchObjectsOptions = {
  bucketId?: string[];
  objId?: string[];
  name?: string,
  path?: string,
  mimeType?: string,
  //tagset: type.tagset(),
  public?: boolean,
  active?: boolean,
  deleteMarker?: boolean,
  latest?: boolean,
}
