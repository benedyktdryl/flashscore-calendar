import type { CalendarMode } from './mode';

export interface MatchPayload {
  id: string;
  home: string;
  away: string;
  league: string;
  kickoffIso: string;
  broadcast?: string;
}

export type AddEventRequest = {
  type: 'ADD_EVENT';
  match: MatchPayload;
};

export type AddEventResponse =
  | { ok: true; htmlLink: string }
  | { ok: false; error: string };

export type GetConfigResponse = {
  oauthConfigured: boolean;
  mode: CalendarMode;
  defaultMode: CalendarMode;
};
