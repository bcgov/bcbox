export type ObjectSearchPermissionsOptions = {
  bucketId?: string;
  bucketPerms?: boolean;
  objectId?: string | Array<string>;
  permCode?: string;
  userId?: string;
  limit?: number,
  sort?: string,
  order?: string,
  page?: number
};
