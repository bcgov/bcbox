export interface IdentityProvider {
  name: string;
  elevatedRights: boolean;
  identityKey: string;
  idp: string;
  searchable: boolean;
}
