import type { Bucket } from '@/types';

export type BucketTreeNode = {
  key: string;
  data: Bucket | BucketTreeNodeDummyData;
  isRoot: boolean;
  children: Array<BucketTreeNode>;
};

export type BucketTreeNodeDummyData = {
  bucket: string;
  bucketName: string;
  dummy: boolean;
  endpoint: string;
  key: string;
};
