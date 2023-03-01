import { ValidationMessages } from '@/utils/constants';
import { validateRequired } from '@/utils/formValidators';

describe('validateRequired', () => {
  it.each(['', null, undefined, false])('returns error message when given %o', (str) => {
    const response = validateRequired(str);
    expect(response).toBe(ValidationMessages.REQUIRED);
  });

  it('returns true when given truthy value', async () => {
    const response = validateRequired('some text');
    expect(response).toBe(true);
  });
});
