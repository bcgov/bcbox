export type IdpPermissions = {
  idp: string;
  create?: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage: boolean;
};
