// Chrome match patterns: star wildcards only in subdomains, not in TLD.
// Invalid example: www.flashscore dot-star (Chrome rejects TLD wildcards)
const FLASHSCORE_DOMAINS = [
  'flashscore.pl',
  'flashscore.com',
  'flashscore.co.uk',
  'flashscore.de',
  'flashscore.es',
  'flashscore.fr',
  'flashscore.it',
  'flashscore.nl',
  'flashscore.com.br',
  'flashscore.com.au',
  'flashscore.sk',
  'flashscore.cz',
  'flashscore.ro',
  'flashscore.hu',
  'flashscore.at',
  'flashscore.ch',
  'flashscore.be',
  'flashscore.dk',
  'flashscore.no',
  'flashscore.se',
  'flashscore.fi',
  'flashscore.pt',
  'flashscore.gr',
  'flashscore.tr',
  'flashscore.ua',
  'flashscore.in',
  'flashscore.mx',
  'flashscore.ar',
] as const;

export const FLASHSCORE_MATCHES: readonly string[] = FLASHSCORE_DOMAINS.flatMap(
  (domain) => [`*://*.${domain}/*`, `*://www.${domain}/*`],
);

export const FLASHSCORE_HOST_PERMISSIONS: readonly string[] = [...FLASHSCORE_MATCHES];
