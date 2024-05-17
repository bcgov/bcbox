export type Email = {
  bcc?: Array<string>;
  bodyType: string;
  body: string;
  cc?: Array<string>;
  delayTS?: number;
  encoding?: string;
  from: string;
  priority?: string;
  subject: string;
  to: Array<string>;
  tag?: string;
  attachments?: Array<string>;
};
