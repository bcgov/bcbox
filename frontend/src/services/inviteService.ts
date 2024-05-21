import { appAxios, comsAxios } from './interceptors';
import { invite as inviteEmailTemplate } from '@/utils/emailTemplates';

const PATH = 'permission/invite';

export default {

  /**
   * @function createInvites
   * Create an invite url with the COMS api
   * if incomming emails then send email notifications with unique invite links
   * @param {string} resourceType either 'object' or 'bucket'
   * @param {COMSObject | Bucket } resource the COMS object or bucket record
   * @param {User | null} currentUser current user sending the invite
   * @param {Array<string>} emails array of email adddresses for invitees
   * @param {string} expiresAt timestamp for invite token expiry
   * @param {Array<string>} permCodes array of permCodes for the invite
   *
   * @typedef {object} Invite
   * @property {string} email - invitee's email
   * @property {string} token - invite token
   *
   * @returns {Array<Invite>} array of invite email / token pairs
   */
  async createInvites(
    resourceType: string,
    resource: any,
    currentUser: any,
    emails: Array<string>,
    expiresAt?: number,
    permCodes?: Array<string>
  ) {

    const inviteData  ={
      bucketId: resourceType === 'bucket' ? resource?.bucketId : undefined,
      objectId: resourceType === 'object' ? resource.id : undefined,
      expiresAt: expiresAt,
      permCodes: permCodes
    };

    // if emails param exists
    if(emails && emails.length > 0){
      // create COMS invites
      const invites = await Promise.all(
        emails.map(async e => {
          const token = (await comsAxios().post(`${PATH}`, {
            ...inviteData,
            email: e,
          })).data;
          return { email: e, token: token};
        })
      );
      // send invite email notifications
      await this.emailInvites(resourceType, resource, currentUser, invites);
      return invites;
    }
    // else no emails provided so make an 'open' invite
    else {
      const token = (await comsAxios().post(`${PATH}`, inviteData)).data;
      return [{ token: token }];
    }
  },

  /**
   * @function emailInvites
   * Semd email to each invitee containing a link to the resource
   * each email needs a unique invite link url so use CHES merge feature
   * ref: https://ches.api.gov.bc.ca/api/v1/docs#tag/EmailMerge/operation/postMerge   *
   * @param {string} resourceType eg bucket or object
   * @param {COMSObject | Bucket } resource COMS object or bucket
   * @param {User | null} currentUser current user creating the invite
   * @param {Array<string>} invites array of email adddresses
   * @returns {Promise<string>} CHES TransactionId
   */
  emailInvites(resourceType: string, resource: any, currentUser: any, invites: any){
    try {
      let resourceName, subject;
      // alternate templates depending if resource is a file or a folder
      if (resourceType === 'object') {
        resourceName = resource.name;
        subject = `You have been invited to access ${resourceName} on BCBox`;
      }
      else if (resourceType === 'bucket') {
        resourceName = resource.bucketName;
        subject = `You have been invited to access ${resourceName} on BCBox`;
      }

      // build html template for email body
      const body = inviteEmailTemplate(resourceType, resourceName, currentUser);

      // define email data matching the structure required by CHES api
      const emailData:any = {
        contexts: invites.map((invite: any) => {
          return {
            to: [ invite.email ],
            context: {
              token: invite.token
            }
          };
        }),
        subject: subject,
        body: body
      };
      return appAxios().post('email', emailData);
    } catch(err) {
      console.error(`Failed to send Invite notification: ${err}`);

    }
  },

  /**
   * @function getInvite
   * Use an invite token
   * @param {string} token uuid
   * @returns {Promise} An axios response
   */
  getInvite(token: string): Promise<any> {
    return comsAxios().get(`${PATH}/${token}`);
  }
};
