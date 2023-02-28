export const BucketConfig = Object.freeze({
  headerNewBucket: 'Configure bucket',
  titleNewBucket: 'Use this form to configure a bucket to be used in BCBox for the first time.'
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
  CALLBACK: 'callback',
  CREATEBUCKET: 'createBucket',
  DETAILOBJECTS: 'detailObjects',
  DEVELOPER: 'developer',
  HOME: 'home',
  LISTBUCKETS: 'listBuckets',
  LISTOBJECTS: 'listObjects',
  LOGIN: 'login',
  LOGOUT: 'logout'
});

export const StorageKey = Object.freeze({
  AUTH: 'entrypoint',
  CONFIG: 'config'
});

export const ValidationMessages = Object.freeze({
  REQUIRED: 'This field is required.',
});
