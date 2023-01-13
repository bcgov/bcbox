import { getGitRevision } from '../../../src/components/utils';

beforeEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('getGitRevision', () => {
  expect(typeof getGitRevision()).toBe('string');
});
