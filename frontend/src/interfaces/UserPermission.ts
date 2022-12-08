export interface UserPermission {
  userId: string;
  fullName: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage: boolean;
}
