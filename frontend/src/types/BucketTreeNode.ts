import type { Bucket } from '@/types';

export type BucketTreeNode = {
  key: string;
  data: BucketTreeNodeData;
  isRoot: boolean;
  children: Array<BucketTreeNode>;
};

export type BucketTreeNodeData = {
  dummy: boolean;
} & Bucket;
