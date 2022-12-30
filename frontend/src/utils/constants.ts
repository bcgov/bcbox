export const KEYCLOAK = Object.freeze({
  MIN_VALID_TIME_SEC: 70,
  REFRESH_TIME_MS: 10000,
});

export const IDENTITY_PROVIDERS = Object.freeze({
  IDIR: 'idir',
  BCEID_BASIC: 'bceid_basic',
});

export const Permissions = Object.freeze({
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  MANAGE: 'MANAGE',
});

export const RouteNames = Object.freeze({
  Home: 'home',
  CreateBucket: 'createBucket',
  Developer: 'developer',
  ListBuckets: 'listBuckets',
  ListObjects: 'listObjects',
  Logout: 'logout,'
});

export const ValidationMessages = Object.freeze({
  Required: 'This field is required.',
});
