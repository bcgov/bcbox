export const KEYCLOAK = Object.freeze({
  MIN_VALID_TIME_SEC: 70,
  REFRESH_TIME_MS: 10000,
});

export const Permissions = Object.freeze({
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  MANAGE: 'MANAGE',
});

export const Regex = Object.freeze({
  // https://emailregex.com/
  // HTML5 - Modified to require domain of at least 2 characters
  Email: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$'
});

export const RouteNames = Object.freeze({
  Home: 'home',
  CreateBucket: 'createBucket',
  Developer: 'developer',
  ListBuckets: 'listBuckets',
  ListObjects: 'listObjects',
  Logout: 'logout,',
  ObjectFileDetails: 'objectFileDetails'
});

export const ValidationMessages = Object.freeze({
  Required: 'This field is required.',
});
