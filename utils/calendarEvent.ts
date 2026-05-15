import type { MatchPayload } from './types';

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export interface GoogleCalendarEventBody {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

export function matchToCalendarEvent(match: MatchPayload): GoogleCalendarEventBody {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startMs = new Date(match.kickoffIso).getTime();
  const endMs = startMs + MATCH_DURATION_MS;

  const descriptionParts: string[] = [];
  if (match.league) descriptionParts.push(match.league);
  if (match.broadcast) descriptionParts.push(`Transmisja: ${match.broadcast}`);

  return {
    summary: `${match.home} - ${match.away}`,
    description: descriptionParts.length > 0 ? descriptionParts.join('\n') : undefined,
    start: {
      dateTime: new Date(startMs).toISOString(),
      timeZone,
    },
    end: {
      dateTime: new Date(endMs).toISOString(),
      timeZone,
    },
  };
}
