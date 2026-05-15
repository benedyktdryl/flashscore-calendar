import { matchToCalendarEvent } from './calendarEvent';
import type { MatchPayload } from './types';

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function formatIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function safeFilename(home: string, away: string): string {
  const slug = `${home}-vs-${away}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
  return `${slug || 'mecz'}.ics`;
}

export function buildIcsContent(match: MatchPayload): string {
  const event = matchToCalendarEvent(match);
  const startMs = new Date(match.kickoffIso).getTime();
  const endMs = startMs + MATCH_DURATION_MS;
  const uid = `${match.id}@flashscore-calendar`;
  const now = formatIcsUtc(new Date().toISOString());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FlashScore Calendar//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsUtc(match.kickoffIso)}`,
    `DTEND:${formatIcsUtc(new Date(endMs).toISOString())}`,
    `SUMMARY:${escapeIcs(event.summary)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR', '');
  return lines.join('\r\n');
}

export function downloadIcsFile(match: MatchPayload): void {
  const content = buildIcsContent(match);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeFilename(match.home, match.away);
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
