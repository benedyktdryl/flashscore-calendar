import { isOAuthConfigured } from './config';

export type CalendarMode = 'ics' | 'google-url' | 'oauth';

export const CALENDAR_MODE_KEY = 'calendarMode';

export const MODE_LABELS: Record<CalendarMode, string> = {
  ics: 'Pobierz plik .ics',
  'google-url': 'Otwórz Google Calendar (bez OAuth)',
  oauth: 'Dodaj w tle (OAuth + API)',
};

export function getDefaultMode(): CalendarMode {
  return isOAuthConfigured() ? 'google-url' : 'google-url';
}

export async function getCalendarMode(): Promise<CalendarMode> {
  const stored = await browser.storage.sync.get(CALENDAR_MODE_KEY);
  const mode = stored[CALENDAR_MODE_KEY] as CalendarMode | undefined;
  if (mode === 'oauth' && !isOAuthConfigured()) return getDefaultMode();
  if (mode && mode in MODE_LABELS) return mode;
  return getDefaultMode();
}

export async function setCalendarMode(mode: CalendarMode): Promise<void> {
  if (mode === 'oauth' && !isOAuthConfigured()) {
    throw new Error('OAuth nie jest skonfigurowany. Ustaw WXT_GOOGLE_CLIENT_ID w .env i przebuduj.');
  }
  await browser.storage.sync.set({ [CALENDAR_MODE_KEY]: mode });
}
