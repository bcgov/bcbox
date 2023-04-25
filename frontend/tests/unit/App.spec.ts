import { describe, expect, it } from 'vitest';

import { ValidationMessages } from '@/utils/constants';

describe('App', () => {
  it('working', () => {
    expect(ValidationMessages).toBeTruthy();
  });
});
