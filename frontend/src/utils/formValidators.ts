import { ValidationMessages } from '@/utils/constants';

export function validateRequired(value: any) {
  if (!value) {
    return ValidationMessages.Required;
  }
  return true;
}
