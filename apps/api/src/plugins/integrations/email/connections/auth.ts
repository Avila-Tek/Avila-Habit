import { defaultTemplateModel, From } from '../utils/constants';
import { sendEmail } from '../utils/send';

export interface SendWelcomeEmailInput {
  email: string;
  name: string;
  authToken: string;
}
async function sendWelcomeEmail({
  email,
  name,
  authToken,
}: SendWelcomeEmailInput) {
  const emailOptions = {
    From: From,
    To: email,
    TemplateAlias: 'welcome',
    TemplateModel: {
      ...defaultTemplateModel,
      name,
      email,
      sign_in_url: `${process.env.CLIENT_URL}/auth/sign-in`,
      action_url: `${process.env.CLIENT_URL}/auth/sign-up?token=${authToken}`,
    },
  };
  return sendEmail(emailOptions);
}

export interface SendVerificationOTPInput {
  email: string;
  otp: string;
  type: string;
}

export async function sendVerificationOTP({
  email,
  otp,
}: SendVerificationOTPInput): Promise<void> {
  const emailOptions = {
    From: From,
    To: email,
    TemplateAlias: 'verify-email-otp-cima',
    TemplateModel: {
      ...defaultTemplateModel,
      otp_code: otp,
      email,
      name: email.split('@')[0],
      browser_name: '',
      operating_system: '',
    },
  };

  try {
    await sendEmail(emailOptions);
  } catch (error) {
    console.error('[OTP Email Error]', error);
  }
}

export const authConnection = Object.freeze({
  sendWelcomeEmail,
  sendVerificationOTP,
});
