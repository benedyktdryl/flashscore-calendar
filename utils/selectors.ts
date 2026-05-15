export const SELECTORS = {
  matchRow: '.event__match',
  matchRowLink: 'a.eventRowLink',
  matchRowFallback: 'a.eventRowLink, a[href*="/mecz/"], a[href*="/match/"]',
  matchTime: '.event__time',
  homeTeam: '.event__participant--home, .event__homeParticipant',
  awayTeam: '.event__participant--away, .event__awayParticipant',
  teamName: '[data-testid="wcl-scores-simple-text-01"], .wcl-name_jjfMf',
  leagueHeader: '.event__header, .headerLeague__title, a[class*="headerLeague"]',
  datePickerButton: '.calendar__datepicker',
  datePickerText:
    '.calendar__datepicker .calendar__navigation__today, .calendar__navigation__today',
  tvIcon: '.event__icon--tv, .icon__tv, [class*="icon__tv"]',
  mainFeed: '#live-table, #detail, .sportName',
  actionsAnchor: '.liveBetWrapper, .event__icon--tv, a.icon--preview',
} as const;

export const BUTTON_CLASS = 'fsc-add-calendar-btn';
export const BUTTON_ATTR = 'data-fsc-injected';
