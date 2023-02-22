import type { Audit } from '@/interfaces/common/Audit';

export interface Permission extends Audit {
  active: boolean;
  permCode: string;
}
