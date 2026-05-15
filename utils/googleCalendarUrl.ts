import { matchToCalendarEvent } from './calendarEvent';
import type { MatchPayload } from './types';

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

/** Google Calendar “template” URL (no OAuth). User confirms save in the UI. */
function formatGoogleDateLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

export function buildGoogleCalendarTemplateUrl(match: MatchPayload): string {
  const event = matchToCalendarEvent(match);
  const startMs = new Date(match.kickoffIso).getTime();
  const endMs = startMs + MATCH_DURATION_MS;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${formatGoogleDateLocal(startMs)}/${formatGoogleDateLocal(endMs)}`,
  });

  if (event.description) params.set('details', event.description);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
