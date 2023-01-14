import { getGitRevision, readIdpList } from '../../../src/components/utils';

beforeEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('getGitRevision', () => {
  it('should return a string', () => {
    expect(typeof getGitRevision()).toBe('string');
  });
});

describe('readIdpList', () => {
  it('should return an array of objects', () => {
    expect(Array.isArray(readIdpList())).toBeTruthy();
  });
});
