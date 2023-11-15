import { DELIMITER } from '@/utils/constants';
import ConfigService from '@/services/configService';
import { ExcludeTypes } from '@/utils/enums';

/**
 * @function differential
 * Create a key/value differential from source against comparer
 * @param {object} source Source object
 * @param {object} comparer The object to be compared against
 * @returns {object} Object containing the non-matching key/value pairs in the source object
 */
export function differential(source: any, comparer: any): any {
  return Object.fromEntries(Object.entries(source).filter(([key, value]) => comparer[key] !== value));
}

/**
 * @function isAtPath
 * Predicate function determining if the `path` is a non-directory member of the `prefix` path
 * @param {string} prefix The base "folder"
 * @param {string} path The "file" to check
 * @returns {boolean} True if path is member of prefix. False in all other cases.
 */
export function isAtPath(prefix: string, path: string) {
  if (prefix === path) return true; // Matching strings are always at the at the path
  if (path.endsWith(DELIMITER)) return false; // Trailing slashes references the folder

  const pathParts = path.split(DELIMITER).filter((part) => part);
  const prefixParts = prefix.split(DELIMITER).filter((part) => part);
  return (
    prefixParts.every((part, i) => pathParts[i] === part) &&
    pathParts.filter((part) => !prefixParts.includes(part)).length === 1
  );
}

/**
 * @function isDebugMode
 * Checks if the app is currently running in debug mode
 * @returns {boolean} True if in debug, false otherwise
 */
export function isDebugMode(): boolean {
  return import.meta.env.MODE.toUpperCase() === 'DEBUG';
}

/**
 * @function joinPath
 * Joins a set of string arguments to yield a string path
 * @param  {...string} items The strings to join on
 * @returns {string} A path string with the specified delimiter
 */
export function joinPath(...items: Array<string>): string {
  if (items && items.length) {
    const parts: Array<string> = [];
    items.forEach((p) => {
      if (p)
        p.split(DELIMITER).forEach((x) => {
          if (x && x.trim().length) parts.push(x);
        });
    });
    return parts.join(DELIMITER) ?? '';
  } else return '';
}

/**
 * @function partition
 * Partitions an array into two array sets depending on conditional
 * @see {@link https://stackoverflow.com/a/71247432}
 * @param {Array<T>} arr The array to partition
 * @param {Function} predicate The predicate function
 * @returns
 */
export function partition<T>(
  arr: Array<T>,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  predicate: (v: T, i: number, ar: Array<T>) => boolean
): [Array<T>, Array<T>] {
  return arr.reduce(
    (acc, item, index, array) => {
      acc[+!predicate(item, index, array)].push(item);
      return acc;
    },
    [[], []] as [Array<T>, Array<T>]
  );
}

/**
 * @function excludeMetaTag
 * Filter out a configured list of select metadata or tags from a COMS response
 * @param {string} type either 'metadata' or 'tagset'
 * @param {object} data An object with metadata/tags from COMS
 * @returns {object} The response data with select metadata/tags from a configured list removed
 */
export function excludeMetaTag(
  type: ExcludeTypes,
  data: [
    {
      objectId: string;
      metadata?: Array<{ key: string; value: string }>;
      tagset?: Array<{ key: string; value: string }>;
    }
  ]
) {
  // TODO: consider unit testing this function
  // array of selected tags/metadata (keys) to hide from UI
  const excludeArray =
    new ConfigService()
      .getConfig()
      .exclude?.[type]?.split(',')
      .map((s: string) => s.trim()) ?? [];
  // filter COMS data
  return data.map((obj: any) => {
    return {
      ...obj,
      [type]: obj[type]?.filter((el: any) => !excludeArray.includes(el.key))
    };
  });
}

/**
 * @function setDispositionHeader
 * Constructs a valid RFC 6266 'Content-Disposition' header
 * and optionally handles RFC 8187 UTF-8 encoding when necessary
 * @param  {string} filename The file name to check if encoding is needed
 * @returns {string} The value for the key 'Content-Disposition'
 */
export function setDispositionHeader(filename: string) {
  const dispositionHeader = `attachment; filename="${filename}"`;
  const encodedFilename = encodeURIComponent(filename).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );

  if (filename === encodedFilename) {
    return dispositionHeader;
  } else {
    return dispositionHeader.concat(`; filename*=UTF-8''${encodedFilename}`);
  }
}
