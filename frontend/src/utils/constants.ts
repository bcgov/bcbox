export const BucketConfig = Object.freeze({
  HEADER_NEW_BUCKET: 'Connect Storage',
  TITLE_NEW_BUCKET: 'Use this form to configure a bucket to be used in BCBox for the first time.'
});

/**
 * Default string delimiter
 */
export const DELIMITER = '/';

/**
 * Max allowable tags to be added to an object
 * S3 max is 10, but one is reserved for the COMS `coms-id`
 */
export const MAX_TAGS = 9;

export const Permissions = Object.freeze({
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  MANAGE: 'MANAGE'
});

export const Permissionlabels = Object.freeze({
  CREATE: 'Upload',
  READ: 'Read',
  UPDATE: 'Update',
  DELETE: 'Delete',
  MANAGE: 'manage'
});

export const Regex = Object.freeze({
  // https://emailregex.com/
  // HTML5 - Modified to require domain of at least 2 characters
  EMAIL: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$'
});

export const RouteNames = Object.freeze({
  CALLBACK: 'callback',
  CREATE_BUCKET: 'createBucket',
  DETAIL_OBJECTS: 'detailObjects',
  DEVELOPER: 'developer',
  FORBIDDEN: 'forbidden',
  HOME: 'home',
  INVITE: 'invite',
  LIST_BUCKETS: 'listBuckets',
  LIST_OBJECTS: 'listObjects',
  LIST_OBJECTS_DELETED: 'listObjectsDeleted',
  LIST_OBJECTS_PUBLIC: 'listObjectsPublic',
  LOGIN: 'login',
  LOGOUT: 'logout'
});

export const StorageKey = Object.freeze({
  AUTH: 'entrypoint',
  CONFIG: 'config'
});

/**
 * Default COMS System User ID
 */
export const SYSTEM_USER = '00000000-0000-0000-0000-000000000000';

export const ToastTimeout = Object.freeze({
  ERROR: 5000,
  INFO: 3000,
  SUCCESS: 3000,
  WARNING: 5000
});

export const ValidationMessages = Object.freeze({
  REQUIRED: 'This field is required.'
});
