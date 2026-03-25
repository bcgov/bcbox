export type UserPermissions = {
  userId: string;
  idp?: string;
  elevatedRights?: boolean;
  fullName: string;
  create?: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage: boolean;
};
