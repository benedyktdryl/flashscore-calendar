const PLACEHOLDER = 'YOUR_CLIENT_ID';

export function getGoogleClientId(): string | undefined {
  const id = import.meta.env.WXT_GOOGLE_CLIENT_ID;
  if (!id || id.includes(PLACEHOLDER)) return undefined;
  return id;
}

export function isOAuthConfigured(): boolean {
  return Boolean(getGoogleClientId());
}
