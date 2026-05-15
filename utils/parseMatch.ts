import { getButtonMount } from './findMatchRows';
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

  const header = row
    .closest('.sportName, .event, [class*="tournament"], [id="live-table"]')
    ?.querySelector(SELECTORS.leagueHeader);
  if (header) return (header.textContent ?? '').trim();

  let walk: Element | null = row.parentElement;
  for (let i = 0; i < 8 && walk; i += 1) {
    const leagueLink = walk.querySelector(
      'a[class*="headerLeague"], .event__header, [class*="tournamentHeader"]',
    );
    if (leagueLink) return (leagueLink.textContent ?? '').trim();
    walk = walk.previousElementSibling ?? walk.parentElement;
  }

  return '';
}

function readBroadcast(row: Element): string | undefined {
  const root = row.closest('.event__match, [class*="event"]') ?? row.parentElement ?? row;
  const tv = root.querySelector(SELECTORS.tvIcon);
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
  const anchor = row.querySelector('a[href*="/mecz/"], a[href*="/match/"]') ?? (row.matches('a') ? row : null);
  const href = anchor?.getAttribute('href');
  if (href) return href;
  return `${home}|${away}|${kickoffIso}`;
}

function findKickoffTime(row: Element): string | null {
  const mount = getButtonMount(row);
  const timeEl = mount.querySelector(SELECTORS.matchTime);
  if (timeEl) {
    const text = (timeEl.textContent ?? '').trim();
    if (isScheduledKickoff(text)) return text;
  }

  const container = mount.closest('[class*="event"]') ?? mount.parentElement ?? mount;
  const timeCandidates = container.querySelectorAll(
    '.event__time, [class*="event__time"], [class*="time"]',
  );
  for (const el of timeCandidates) {
    const text = (el.textContent ?? '').trim();
    if (isScheduledKickoff(text)) return text;
  }

  const blockText = container.textContent ?? '';
  const match = blockText.match(/\b(\d{1,2}:\d{2})\b/);
  return match?.[1] ?? null;
}

function parseTeamsFromParticipants(row: Element): { home: string; away: string } | null {
  const mount = getButtonMount(row);
  const homeEl = mount.querySelector(SELECTORS.homeTeam);
  const awayEl = mount.querySelector(SELECTORS.awayTeam);
  if (!homeEl || !awayEl) return null;

  const home = (homeEl.textContent ?? '').trim();
  const away = (awayEl.textContent ?? '').trim();
  if (!home || !away) return null;
  return { home, away };
}

function parseTeamsFromLink(row: Element): { home: string; away: string } | null {
  const anchor =
    (row.matches('a') ? row : null) ??
    row.querySelector('a[href*="/mecz/"], a[href*="/match/"]');
  if (!anchor) return null;

  const text = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
  const parts = text.split(/\s+-\s+/);
  if (parts.length < 2) return null;

  const home = parts[0]?.trim();
  const away = parts.slice(1).join(' - ').trim();
  if (!home || !away) return null;
  return { home, away };
}

export function parseMatchRow(
  row: Element,
  pageDate: string | null = readPageDate(),
): MatchPayload | null {
  const resolvedDate = pageDate ?? readPageDate();
  if (!resolvedDate) return null;

  const timeText = findKickoffTime(row);
  if (!timeText) return null;

  const teams = parseTeamsFromParticipants(row) ?? parseTeamsFromLink(row);
  if (!teams) return null;

  const kickoffIso = buildKickoffIso(resolvedDate, timeText);
  if (!kickoffIso) return null;

  const mount = getButtonMount(row);
  const league = findLeagueName(mount);
  const broadcast = readBroadcast(mount);

  return {
    id: matchIdFromRow(mount, teams.home, teams.away, kickoffIso),
    home: teams.home,
    away: teams.away,
    league,
    kickoffIso,
    broadcast,
  };
}
