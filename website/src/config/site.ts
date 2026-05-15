/** Public site URL (no trailing slash). Set VITE_SITE_URL when building for GitHub Pages. */
export const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export const siteTitle = 'FlashScore → Kalendarz — dodaj mecze do Google Calendar';
export const siteDescription =
  'Darmowe rozszerzenie Chrome: jeden klik przy meczu na FlashScore — otwórz Google Calendar, pobierz .ics lub dodaj wydarzenie przez OAuth. Instrukcja instalacji i konfiguracji.';
