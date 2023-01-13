export interface UserPermissions {
  userId: string;
  elevatedRights: boolean;
  fullName: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage: boolean;
}
