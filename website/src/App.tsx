import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Calendar,
  Chrome,
  Download,
  ExternalLink,
  Github,
  Puzzle,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { siteDescription, siteTitle, siteUrl, githubRepoUrl, latestMainZipUrl, continuousReleaseUrl } from '@/config/site';

export default function App() {
  const canonical = siteUrl ? `${siteUrl}/` : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FlashScore → Kalendarz',
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: siteDescription,
    url: canonical ?? githubRepoUrl,
    codeRepository: githubRepoUrl,
    downloadUrl: latestMainZipUrl,
  };

  return (
    <>
      <Helmet>
        <html lang="pl" />
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta
          name="keywords"
          content="FlashScore, Google Calendar, rozszerzenie Chrome, kalendarz, piłka nożna, .ics, OAuth"
        />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        {canonical ? <meta property="og:url" content={canonical} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="font-normal">
                  Chrome
                </Badge>
                <Badge variant="secondary">MV3</Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                FlashScore → Kalendarz
              </h1>
              <p className="max-w-xl text-muted-foreground">
                Dodawaj mecze z FlashScore do kalendarza — bez rejestracji w sklepie, z trybem „otwórz
                Google Calendar” od pierwszego dnia.
              </p>
            </div>
            <a
              href={`${githubRepoUrl}#readme`}
              className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'no-underline')}
            >
              <Github className="size-4" aria-hidden />
              Kod źródłowy
            </a>
          </div>
        </header>

        <main className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-12">
          <section className="flex flex-col gap-4 text-left" aria-labelledby="install-heading">
            <h2 id="install-heading" className="text-xl font-semibold">
              Instalacja (Chrome)
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="size-5 text-primary" aria-hidden />
                  Gotowa paczka z ostatniego <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">main</code>
                </CardTitle>
                <CardDescription>
                  Po każdym zielonym buildzie na gałęzi <code className="rounded bg-muted px-1 font-mono">main</code>{' '}
                  publikujemy ten sam plik pod stałym adresem — bez Bun i bez klonowania repozytorium.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  <a
                    href={latestMainZipUrl}
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'lg' }),
                      'no-underline inline-flex items-center gap-2',
                    )}
                  >
                    <Download className="size-4" aria-hidden />
                    Pobierz ZIP (Chrome)
                  </a>
                  <a
                    href={continuousReleaseUrl}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'no-underline inline-flex items-center gap-2',
                    )}
                  >
                    <Github className="size-4" aria-hidden />
                    Wydanie „continuous”
                  </a>
                </div>
                <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
                  <li>
                    Pobierz plik{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                      flashscore-calendar-chrome-main.zip
                    </code>{' '}
                    (link powyżej).
                  </li>
                  <li>
                    Rozpakuj archiwum — powstanie folder z plikiem{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">manifest.json</code> w korzeniu (bez
                    dodatkowego podfolderu typu <code className="rounded bg-muted px-1 font-mono">chrome-mv3</code>).
                  </li>
                  <li>
                    Otwórz{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">chrome://extensions</code>, włącz{' '}
                    <strong>Tryb deweloperski</strong>.
                  </li>
                  <li>
                    <strong>Wczytaj rozpakowane</strong> → wskaż <strong>ten</strong> rozpakowany katalog (nie sam plik
                    ZIP).
                  </li>
                  <li>
                    Wejdź na{' '}
                    <a className="text-primary underline" href="https://www.flashscore.pl/">
                      flashscore.pl
                    </a>{' '}
                    — przy zaplanowanym meczu zobaczysz ikonę kalendarza obok TV.
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Chrome className="size-5 text-primary" aria-hidden />
                  Z kodu źródłowego (deweloper)
                </CardTitle>
                <CardDescription>
                  Jeśli zmieniasz kod: zbuduj lokalnie i wskaż folder{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dist/chrome-mv3</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
                  <li>
                    Zainstaluj{' '}
                    <a className="text-primary underline" href="https://bun.sh">
                      Bun
                    </a>
                    , sklonuj repozytorium.
                  </li>
                  <li>
                    W katalogu projektu:{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                      bun install && bun run build
                    </code>
                  </li>
                  <li>
                    Otwórz{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">chrome://extensions</code>, włącz{' '}
                    <strong>Tryb deweloperski</strong>.
                  </li>
                  <li>
                    <strong>Wczytaj rozpakowane</strong> → wybierz{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">dist/chrome-mv3</code>.
                  </li>
                </ol>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Szybki podgląd z HMR:{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">bun run dev</code> →
                  wczytaj{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono">dist/chrome-mv3-dev</code>.
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="flex flex-col gap-4 text-left" aria-labelledby="modes-heading">
            <h2 id="modes-heading" className="text-xl font-semibold">
              Tryby i konfiguracja
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ExternalLink className="size-4" aria-hidden />
                    Google URL
                  </CardTitle>
                  <CardDescription>Domyślny — bez Google Cloud.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Otwiera formularz Google Calendar w nowej karcie; zapisujesz wydarzenie samodzielnie.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Download className="size-4" aria-hidden />
                    Plik .ics
                  </CardTitle>
                  <CardDescription>Import do dowolnej aplikacji.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Pobierasz plik kalendarza i importujesz go w Outlook / Apple Calendar itd.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="size-4" aria-hidden />
                    OAuth (opcjonalnie)
                  </CardTitle>
                  <CardDescription>Wymaga klienta OAuth w manifeście.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Ustaw <code className="rounded bg-muted px-1 font-mono">WXT_GOOGLE_CLIENT_ID</code> w{' '}
                  <code className="rounded bg-muted px-1 font-mono">.env</code>, przebuduj rozszerzenie.
                  Szczegóły w README repozytorium.
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings2 className="size-5" aria-hidden />
                  Ustawienia rozszerzenia
                </CardTitle>
                <CardDescription>
                  Kliknij ikonę puzzla w Chrome → przypnij rozszerzenie → Opcje (lub Szczegóły → Opcje
                  rozszerzenia).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <Puzzle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  Wybierz tryb: Google URL, .ics lub OAuth (jeśli zbudowano z klientem OAuth).
                </p>
                <p className="flex items-start gap-2">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  Strefa czasowa i czas trwania wydarzenia biorą się z przeglądarki (domyślnie 2 h).
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-lg border border-border bg-muted/40 p-6 text-left">
            <h2 className="mb-2 text-lg font-semibold">Prywatność</h2>
            <p className="text-sm text-muted-foreground">
              Rozszerzenie działa lokalnie na stronach FlashScore; w trybach URL i .ics dane meczu nie są
              wysyłane na zewnętrzny serwer autora rozszerzenia. Tryb OAuth komunikuje się wyłącznie z
              Google (kalendarz na koncie, na którym jesteś zalogowany w Chrome). Szczegóły polityki —
              w repozytorium (README / kod).
            </p>
          </section>
        </main>

        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          <a href={githubRepoUrl} className="text-primary underline">
            GitHub — flashscore-calendar
          </a>
          {canonical ? (
            <>
              {' '}
              ·{' '}
              <a href={`${canonical}sitemap.xml`} className="underline">
                mapa strony
              </a>
            </>
          ) : null}
        </footer>
      </div>
    </>
  );
}
