export interface User {
  active: boolean;
  createdAt: string;
  createdBy: string; // guid
  elevatedRights: boolean;
  email: string;
  firstName: string;
  fullName: string;
  identityId: string;
  idp: string;
  lastName: string;
  updatedAt: string;
  updatedBy: string;
  userId: string; // guid
  username: string;
}
