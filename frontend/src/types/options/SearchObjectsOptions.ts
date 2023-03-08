export type SearchObjectsOptions = {
  bucketId?: string[];
  objId?: string[];
  name?: string,
  path?: string,
  mimeTyp?: string,
  //tagset: type.tagset(),
  public?: boolean,
  active?: boolean,
  deleteMarker?: boolean,
  latest?: boolean,
}
