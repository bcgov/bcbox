import { format, parseJSON } from 'date-fns';

function _dateFnsFormat(value: string, formatter: string) {
  const formatted = '';
  try {
    if (value) {
      return format(parseJSON(value), formatter);
    }
  } catch (error) {
    console.error(`_dateFnsFormat: Error parsing ${value} to ${error}`);
  }
  return formatted;
}

/**
 * @function formatDate
 * Converts a date to an 'MMMM D YYYY' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDate(value: string) {
  return _dateFnsFormat(value, 'MMMM d yyyy');
}

/**
 * @function formatDateLong
 * Converts a date to an 'MMMM D yyyy, h:mm:ss a' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDateLong(value: string) {
  return _dateFnsFormat(value, 'MMMM d yyyy, h:mm:ss a');
}

export function toKebabCase(str: string | null) {
  const strs = str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
  return strs ? strs.join('-').toLocaleLowerCase() : '';
}

/**
 * @function formatSize
 * Converts a number, in bytes, to a formatted string
 * @param {String} bytes A number representing a file size
 * @returns {number} A converted string representation of `bytes`
 */
export function formatSize(bytes: number) {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1000,
    dm = 3,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
