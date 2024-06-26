import { format, parseJSON } from 'date-fns';
import { Permissionlabels } from '@/utils/constants';

function _dateFnsFormat(value: string, formatter: string) {
  const formatted = '';
  try {
    if (value) {
      return format(parseJSON(value), formatter);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
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
 * @function toBulkResult
 * transforms an array of invite/add/remove data into an array of human-readable descriptions
 * @param {string} notFound if user not found (eg: 'invite' or 'ignore')
 * @param {string} action permission action (eg: 'add' or 'remove')
 * @param {boolean} notify whether existing users were notified
 * @param {object[]} data results invite/add/remove
 * @returns {object[]} an array of human-readable descriptions
 */
export function toBulkResult(
  notFound: string,
  action: string,
  notify: boolean = false,
  data: Array<{ email: string; chesMsgId: string; permissions: Array<{ permCode: string }> | undefined }>
) {
  const result = data.map((r) => {
    let description: string = 'No action taken';
    let status: number = 1;
    // invites
    if (r.chesMsgId && notFound === 'invite' && !r.permissions) description = 'Invite emailed';
    else if (notFound === 'ignore' && !r.permissions) {
      description = 'No invite was emailed';
      status = 0;
    }
    // adding permission
    else if (action === 'add' && r.permissions) {
      if (r.permissions.length > 0) {
        const perms = r.permissions.map((p) => {
          return Permissionlabels[p.permCode as keyof typeof Permissionlabels];
        });
        description = `Permissions added (${perms.join(' and ')})`;
      } else {
        description = 'Permissions already existed';
        status = 0;
      }
      if (notify) description += '; notification emailed';
    }
    // removing permissions
    else if (action === 'remove' && r.permissions) {
      if (r.permissions.length == 0) {
        description = 'Permissions did not exist';
        status = 0;
      } else description = 'All Permissions removed';
    }
    return new Object({
      email: r.email,
      description: description,
      status: status
    });
  });
  return result;
}
