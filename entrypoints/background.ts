import { matchToCalendarEvent } from '../utils/calendarEvent';
import { isOAuthConfigured } from '../utils/config';
import { getCalendarMode } from '../utils/mode';
import type { AddEventResponse, GetConfigResponse } from '../utils/types';

const CALENDAR_EVENTS_URL =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';

async function getAuthToken(interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    browser.identity.getAuthToken({ interactive }, (result) => {
      const err = browser.runtime.lastError;
      const token = typeof result === 'string' ? result : result?.token;
      if (err || !token) {
        reject(new Error(err?.message ?? 'Nie udało się uzyskać tokenu Google.'));
        return;
      }
      resolve(token);
    });
  });
}

async function removeCachedToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    browser.identity.removeCachedAuthToken({ token }, () => resolve());
  });
}

class CalendarApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'CalendarApiError';
  }
}

async function createCalendarEvent(
  token: string,
  body: ReturnType<typeof matchToCalendarEvent>,
): Promise<{ htmlLink: string }> {
  const response = await fetch(CALENDAR_EVENTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as { htmlLink?: string; error?: { message?: string } };

  if (!response.ok) {
    throw new CalendarApiError(
      payload.error?.message ?? `Błąd API (${response.status})`,
      response.status,
    );
  }

  if (!payload.htmlLink) {
    throw new Error('Wydarzenie utworzone, ale brak linku do kalendarza.');
  }

  return { htmlLink: payload.htmlLink };
}

async function addEventWithAuth(
  body: ReturnType<typeof matchToCalendarEvent>,
  interactive: boolean,
  retried = false,
): Promise<{ htmlLink: string }> {
  const token = await getAuthToken(interactive);
  try {
    return await createCalendarEvent(token, body);
  } catch (error) {
    if (!retried && error instanceof CalendarApiError && error.status === 401) {
      await removeCachedToken(token);
      return addEventWithAuth(body, true, true);
    }
    throw error;
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'GET_CONFIG') {
      void (async () => {
        const mode = await getCalendarMode();
        sendResponse({
          oauthConfigured: isOAuthConfigured(),
          mode,
          defaultMode: 'google-url',
        } satisfies GetConfigResponse);
      })();
      return true;
    }

    if (message?.type !== 'ADD_EVENT') return;

    void (async () => {
      try {
        if (!isOAuthConfigured()) {
          sendResponse({
            ok: false,
            error:
              'Tryb OAuth nie jest skonfigurowany. Ustaw WXT_GOOGLE_CLIENT_ID lub wybierz inny tryb w ustawieniach.',
          } satisfies AddEventResponse);
          return;
        }

        const mode = await getCalendarMode();
        if (mode !== 'oauth') {
          sendResponse({
            ok: false,
            error: 'Aktualny tryb nie używa OAuth. Zmień tryb w ustawieniach rozszerzenia.',
          } satisfies AddEventResponse);
          return;
        }

        const body = matchToCalendarEvent(message.match);
        const { htmlLink } = await addEventWithAuth(body, true);
        sendResponse({ ok: true, htmlLink } satisfies AddEventResponse);
      } catch (error) {
        const text =
          error instanceof Error ? error.message : 'Nie udało się dodać do kalendarza.';
        sendResponse({ ok: false, error: text } satisfies AddEventResponse);
      }
    })();

    return true;
  });
});
