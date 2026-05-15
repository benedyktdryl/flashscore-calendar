import { SELECTORS } from './selectors';
import type { MatchPayload } from './types';
import { readPageDate } from './parsePageDate';

function findLeagueName(row: Element): string {
  let current: Element | null = row.previousElementSibling;
  while (current) {
    if (current.matches(SELECTORS.leagueHeader)) {
      return (current.textContent ?? '').trim();
    }
    current = current.previousElementSibling;
  }

  const header = row.closest('.sportName, .event')?.querySelector(SELECTORS.leagueHeader);
  return (header?.textContent ?? '').trim();
}

function readBroadcast(row: Element): string | undefined {
  const tv = row.querySelector(SELECTORS.tvIcon);
  if (!tv) return undefined;

  const title = tv.getAttribute('title')?.trim();
  if (title) return title;

  const aria = tv.getAttribute('aria-label')?.trim();
  if (aria) return aria;

  const parentTitle = tv.parentElement?.getAttribute('title')?.trim();
  return parentTitle || undefined;
}

function isScheduledKickoff(timeText: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(timeText.trim());
}

function buildKickoffIso(pageDate: string, timeText: string): string | null {
  const [hours, minutes] = timeText.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const [year, month, day] = pageDate.split('-').map(Number);
  const local = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

function matchIdFromRow(row: Element, home: string, away: string, kickoffIso: string): string {
  if (row.id) return row.id;
  return `${home}|${away}|${kickoffIso}`;
}

export function parseMatchRow(row: Element, pageDate = readPageDate()): MatchPayload | null {
  const timeEl = row.querySelector(SELECTORS.matchTime);
  const homeEl = row.querySelector(SELECTORS.homeTeam);
  const awayEl = row.querySelector(SELECTORS.awayTeam);
  if (!timeEl || !homeEl || !awayEl) return null;

  const timeText = (timeEl.textContent ?? '').trim();
  if (!isScheduledKickoff(timeText)) return null;

  const home = (homeEl.textContent ?? '').trim();
  const away = (awayEl.textContent ?? '').trim();
  if (!home || !away) return null;

  if (!pageDate) return null;

  const kickoffIso = buildKickoffIso(pageDate, timeText);
  if (!kickoffIso) return null;

  const league = findLeagueName(row);
  const broadcast = readBroadcast(row);

  return {
    id: matchIdFromRow(row, home, away, kickoffIso),
    home,
    away,
    league,
    kickoffIso,
    broadcast,
  };
}
