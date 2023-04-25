import { describe, expect, it } from 'vitest';
import { toKebabCase } from '@/utils/formatters';

describe('formatters.ts toKebabCase', () => {
  it('returns the expected UUID values', () => {
    expect(toKebabCase('descriptive Variable name')).toEqual('descriptive-variable-name');
    expect(toKebabCase('INTERESTING FILE')).toEqual('interesting-file');
    expect(toKebabCase('abc')).toEqual('abc');
  });

  it('returns blanks if blank provided', () => {
    expect(toKebabCase('')).toEqual('');
    expect(toKebabCase(null)).toEqual('');
  });
});
