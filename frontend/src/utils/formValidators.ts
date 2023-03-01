import { ValidationMessages } from '@/utils/constants';

export function validateRequired(value: any): boolean | string {
  if (!value) {
    return ValidationMessages.REQUIRED;
  }
  return true;
}
