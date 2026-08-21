/**
 * Admin sign-in against the Cognito User Pool (ValentCo-AdminPool — inherited
 * from the Valent & Co. clone; not yet a JARRO-specific pool, see README.md).
 * On success, the returned ID token is used to assume the "authenticated"
 * (admin) role in the Cognito Identity Pool, which grants write access to
 * DynamoDB (see aws.ts + IAM role ValentCo-AdminRole).
 */
// The Cognito Identity Provider SDK is dynamically imported inside
// adminSignIn() below rather than statically here, so its ~considerable
// bundle weight is only downloaded by visitors who actually open the admin
// sign-in form, not by every storefront visitor.

const REGION = import.meta.env.VITE_AWS_REGION as string;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID as string;

const STORAGE_KEY = 'jarro_admin_session_v1';

export interface AdminSession {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  email: string;
  expiresAt: number; // ms epoch
}

export async function adminSignIn(email: string, password: string): Promise<AdminSession> {
  if (!REGION || !CLIENT_ID) {
    throw new Error('AWS Cognito is not configured for this build.');
  }
  const { CognitoIdentityProviderClient, InitiateAuthCommand } = await import(
    '@aws-sdk/client-cognito-identity-provider'
  );
  const client = new CognitoIdentityProviderClient({ region: REGION });
  const res = await client.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    })
  );

  if (res.ChallengeName) {
    // e.g. NEW_PASSWORD_REQUIRED — surfaced to the caller to handle/display.
    throw new Error(`Sign-in requires an additional step: ${res.ChallengeName}`);
  }

  const auth = res.AuthenticationResult;
  if (!auth?.IdToken || !auth.AccessToken || !auth.RefreshToken) {
    throw new Error('Sign-in failed: no tokens returned.');
  }

  const session: AdminSession = {
    idToken: auth.IdToken,
    accessToken: auth.AccessToken,
    refreshToken: auth.RefreshToken,
    email,
    expiresAt: Date.now() + (auth.ExpiresIn ?? 3600) * 1000,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function loadAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session: AdminSession = JSON.parse(raw);
    if (!session.expiresAt || session.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function adminSignOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}
