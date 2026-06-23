import * as postmark from 'postmark';
import { envs } from '@/config';

const client = envs.email.postmark
  ? new postmark.ServerClient(envs.email.postmark)
  : null;

export async function sendEmail(
  emailOptions: postmark.Models.TemplatedMessage
) {
  if (!client) {
    throw new Error('Postmark API key is not configured');
  }

  try {
    return await client.sendEmailWithTemplate(emailOptions);
  } catch (error) {
    throw new Error(`POSTMARK ERROR: ${String(error)}`);
  }
}
