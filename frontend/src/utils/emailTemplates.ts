/**
 * creates template html for the invite notification
 * @param {string} resourceType either 'object' or 'bucket'
 * @param {string} resourceName the object name or bucket name
 * @param {User | null} currentUser current user sending the invite
 * @returns {string} the template html
 */
export function invite(resourceType: string, resourceName: string, currentUser: any): string{
  let html;
  // eslint-disable-next-line max-len
  const currentUserEmail = `<a href="mailto:${currentUser.email}" style="color: #1a5a96 !important">${currentUser.email}</a>`;
  // alternate templates depending if resource is a file or a folder
  if (resourceType === 'object') {
    html = `<html style="color: #495057 !important;"><br>
      <h2 style="color: #495057 !important;">${currentUserEmail} invited you to access a file on BCBox</h2>
      <p style="color: #495057 !important;">Here's a link to access the file that ${currentUserEmail} shared with you:</p>`;
  }
  else if (resourceType === 'bucket') {
    html = `<html"><br>
      <h2 style="color: #495057 !important;">${currentUserEmail} invited you to access a folder on BCBox</h2>\n
      <p style="color: #495057 !important;">Here's a link to access the folder that ${currentUserEmail} shared with you:</p>`;
  }
  // eslint-disable-next-line max-len
  html = html + `<strong><a style="text-align: center; font-size: large; color: #1a5a96" href="${window.location.origin}/invite/{{token}}">
      ${resourceName }
      </a>
    </strong><br><br>
    <small style="color: #495057 !important;">
      This invite will only work for you and people with existing access.
      If you do not recognize the sender, do not click on the link above.<br>
      Only open links that you are expecting from a known sender.
    </small><br><br>
    <a style="color: #1a5a96" href="${window.location.origin}">Learn more about BCBox</a>
  </html>`;

  return html;
}
