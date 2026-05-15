import { defineConfig } from 'wxt';
import { getGoogleClientId, isOAuthConfigured } from './utils/config';
import { FLASHSCORE_HOST_PERMISSIONS } from './utils/flashscoreHosts';

const googleClientId = getGoogleClientId();

export default defineConfig({
  // Visible in Finder (macOS hides dot-folders like `.output`)
  outDir: 'dist',
  manifest: {
    name: 'FlashScore → Kalendarz',
    description: 'Dodaj mecze z FlashScore do kalendarza (ICS, Google URL lub OAuth).',
    permissions: ['storage', ...(isOAuthConfigured() ? (['identity'] as const) : [])],
    host_permissions: [
      ...(isOAuthConfigured() ? ['https://www.googleapis.com/*'] : []),
      ...FLASHSCORE_HOST_PERMISSIONS,
    ],
    ...(googleClientId
      ? {
          oauth2: {
            client_id: googleClientId,
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
          },
        }
      : {}),
  },
});
