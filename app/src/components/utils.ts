import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { getLogger } from './log';
const log = getLogger(module.filename);

/**
 * @function getGitRevision
 * Gets the current git revision hash
 * @see {@link https://stackoverflow.com/a/34518749}
 * @returns {string} The git revision hash, or empty string
 */
export function getGitRevision(): string {
  try {
    const gitDir = (() => {
      let dir = '.git', i = 0;
      while (!existsSync(join(__dirname, dir)) && i < 5) {
        dir = '../' + dir;
        i++;
      }
      return dir;
    })();

    const head = readFileSync(join(__dirname, `${gitDir}/HEAD`))
      .toString().trim();
    return (head.indexOf(':') === -1)
      ? head
      : readFileSync(join(__dirname, `${gitDir}/${head.substring(5)}`))
        .toString().trim();
  } catch (err: unknown) {
    log.warn(err.message, { function: 'getGitRevision' });
    return '';
  }
}

/**
* @function readIdpList
* Acquires the list of identity providers to be used
* @returns {object[]} A promise resolving to an array of idp provider objects
*/
export function readIdpList(): object[] {
  const configDir = '../../config';
  const defaultFile = 'idplist-default.json';
  const overrideFile = 'idplist-local.json';

  let idpList = [];

  if (existsSync(join(__dirname, configDir, overrideFile))) {
    idpList = JSON.parse(readFileSync(join(__dirname, configDir, overrideFile)));
  } else if (existsSync(join(__dirname, configDir, defaultFile))) {
    idpList = JSON.parse(readFileSync(join(__dirname, configDir, defaultFile)));
  }

  return idpList;
}

