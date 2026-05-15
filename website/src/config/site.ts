/** Public site URL (no trailing slash). Set VITE_SITE_URL when building for GitHub Pages. */
export const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

const defaultGithubRepo = 'benedyktdryl/flashscore-calendar';
export const githubRepoSlug =
  (import.meta.env.VITE_GITHUB_REPO as string | undefined)?.replace(/^\/+|\/+$/g, '') || defaultGithubRepo;

export const githubRepoUrl = `https://github.com/${githubRepoSlug}`;

/** Rolling prerelease from `.github/workflows/release-main-zip.yml` (tag `continuous`). */
export const latestMainZipUrl = `https://github.com/${githubRepoSlug}/releases/download/continuous/flashscore-calendar-chrome-main.zip`;

export const continuousReleaseUrl = `https://github.com/${githubRepoSlug}/releases/tag/continuous`;

export const siteTitle = 'FlashScore → Kalendarz — dodaj mecze do Google Calendar';
export const siteDescription =
  'Darmowe rozszerzenie Chrome: jeden klik przy meczu na FlashScore — otwórz Google Calendar, pobierz .ics lub dodaj wydarzenie przez OAuth. Instrukcja instalacji i konfiguracji.';
