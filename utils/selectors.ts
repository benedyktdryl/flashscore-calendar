export const SELECTORS = {
  matchRow: '.event__match',
  matchRowFallback: 'a[href*="/mecz/"], a[href*="/match/"]',
  matchTime: '.event__time',
  homeTeam: '.event__participant--home',
  awayTeam: '.event__participant--away',
  leagueHeader: '.event__header, .headerLeague__title, a[class*="headerLeague"]',
  datePickerButton: '.calendar__datepicker',
  datePickerText:
    '.calendar__datepicker .calendar__navigation__today, .calendar__navigation__today',
  tvIcon: '.icon__tv, [class*="icon__tv"]',
  mainFeed: '#live-table, #detail, .sportName, [class*="event__match"]',
} as const;

export const BUTTON_CLASS = 'fsc-add-calendar-btn';
export const BUTTON_ATTR = 'data-fsc-injected';
