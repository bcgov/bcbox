import { toKebabCase, formatShortUuid } from '@/utils/formatters';

describe.skip('formatters.ts toKebabCase', () => {
  it('returns the expected UUID values', () => {
    expect(toKebabCase('descriptive variable name')).toEqual('descriptive-variable-name');
    expect(toKebabCase('INTERESTING FILE')).toEqual('INTERESTING-FILE');
    expect(toKebabCase('abc')).toEqual('abc');
  });

  it('returns blanks if blank provided', () => {
    expect(toKebabCase('')).toEqual('');
    expect(toKebabCase(null)).toEqual(null);
  });
});

describe.skip('formatters.ts formatShortUuid', () => {
  it('returns the expected UUID values', () => {
    expect(formatShortUuid('f1fc407d-d6b4-4506-ae6b-9cdd52fbb1c5')).toEqual('f1fc407d');
    expect(formatShortUuid('f1fc407d')).toEqual('f1fc407d');
    expect(formatShortUuid('abc')).toEqual('abc');
    expect(formatShortUuid('')).toEqual('');
  });
});
