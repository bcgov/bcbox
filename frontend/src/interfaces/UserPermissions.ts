export interface UserPermissions {
  userId: string;
  idpDescription: string;
  elevatedRights: boolean;
  fullName: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage: boolean;
}
