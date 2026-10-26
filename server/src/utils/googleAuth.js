import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

export class InvalidGoogleCredentialError extends Error {
  constructor() {
    super('Invalid Google credential');
    this.name = 'InvalidGoogleCredentialError';
  }
}

export async function verifyGoogleCredential(credential) {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) throw new Error('Google authentication is not configured');

  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience });
    return ticket.getPayload();
  } catch (error) {
    if (error && typeof error === 'object' && ('code' in error || 'response' in error || 'status' in error)) {
      throw error;
    }
    throw new InvalidGoogleCredentialError();
  }
}
