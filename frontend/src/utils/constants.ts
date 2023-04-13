export const BucketConfig = Object.freeze({
  HEADER_NEW_BUCKET: 'Configure bucket',
  TITLE_NEW_BUCKET: 'Use this form to configure a bucket to be used in BCBox for the first time.',
  NOTICE_NEW_BUCKET: 'If you intend to share files in your bucket with BCeID users, you are required'
  + ' to email IDIM.Consulting@gov.bc.ca to share your intentions and where you intend to advertise this.'
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
  EMAIL: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$'
});

export const RouteNames = Object.freeze({
  CALLBACK: 'callback',
  CREATE_BUCKET: 'createBucket',
  DETAIL_OBJECTS: 'detailObjects',
  DEVELOPER: 'developer',
  FORBIDDEN: 'forbidden',
  HOME: 'home',
  LIST_BUCKETS: 'listBuckets',
  LIST_OBJECTS: 'listObjects',
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
