import '../assets/flashscore-button.css';
import { buildGoogleCalendarTemplateUrl } from '../utils/googleCalendarUrl';
import { downloadIcsFile } from '../utils/ics';
import { getCalendarMode, type CalendarMode } from '../utils/mode';
import { parseMatchRow } from '../utils/parseMatch';
import { readPageDate } from '../utils/parsePageDate';
import { FLASHSCORE_MATCHES } from '../utils/flashscoreHosts';
import { BUTTON_ATTR, BUTTON_CLASS, SELECTORS } from '../utils/selectors';
import type { AddEventRequest, AddEventResponse, MatchPayload } from '../utils/types';

const STORAGE_PREFIX = 'fsc-added:';

const MODE_BUTTON_LABEL: Record<CalendarMode, string> = {
  ics: '+ ICS',
  'google-url': '+ Kalendarz',
  oauth: '+ Kalendarz',
};

async function isMatchAdded(matchId: string): Promise<boolean> {
  const key = STORAGE_PREFIX + matchId;
  const stored = await browser.storage.local.get(key);
  return Boolean(stored[key]);
}

async function markMatchAdded(matchId: string, link: string): Promise<void> {
  await browser.storage.local.set({ [STORAGE_PREFIX + matchId]: link });
}

function setButtonState(
  button: HTMLButtonElement,
  state: 'idle' | 'loading' | 'added' | 'error',
  label?: string,
): void {
  button.disabled = state === 'loading' || state === 'added';
  button.classList.remove(`${BUTTON_CLASS}--added`, `${BUTTON_CLASS}--error`);

  if (state === 'added') {
    button.classList.add(`${BUTTON_CLASS}--added`);
    button.textContent = label ?? 'Dodano';
    return;
  }

  if (state === 'error') {
    button.classList.add(`${BUTTON_CLASS}--error`);
    button.textContent = label ?? 'Błąd';
    button.disabled = false;
    return;
  }

  if (state === 'loading') {
    button.textContent = '...';
    return;
  }

  const mode = button.dataset.fscMode as CalendarMode | undefined;
  button.textContent = mode ? MODE_BUTTON_LABEL[mode] : '+ Kalendarz';
}

async function addViaIcs(match: MatchPayload): Promise<string> {
  downloadIcsFile(match);
  return 'ics://downloaded';
}

async function addViaGoogleUrl(match: MatchPayload): Promise<string> {
  const url = buildGoogleCalendarTemplateUrl(match);
  window.open(url, '_blank', 'noopener,noreferrer');
  return url;
}

async function addViaOAuth(match: MatchPayload): Promise<string> {
  const response = (await browser.runtime.sendMessage({
    type: 'ADD_EVENT',
    match,
  } satisfies AddEventRequest)) as AddEventResponse | undefined;

  if (!response?.ok) {
    throw new Error(response?.error ?? 'Brak odpowiedzi rozszerzenia.');
  }

  return response.htmlLink;
}

async function handleAddClick(
  button: HTMLButtonElement,
  match: MatchPayload,
  mode: CalendarMode,
): Promise<void> {
  if (await isMatchAdded(match.id)) {
    setButtonState(button, 'added');
    return;
  }

  setButtonState(button, 'loading');

  try {
    let link: string;
    switch (mode) {
      case 'ics':
        link = await addViaIcs(match);
        break;
      case 'google-url':
        link = await addViaGoogleUrl(match);
        break;
      case 'oauth':
        link = await addViaOAuth(match);
        break;
      default:
        throw new Error('Nieznany tryb kalendarza.');
    }

    await markMatchAdded(match.id, link);
    setButtonState(button, 'added');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Błąd';
    setButtonState(button, 'error', message.slice(0, 40));
  }
}

function createButton(match: MatchPayload, mode: CalendarMode): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = BUTTON_CLASS;
  button.setAttribute(BUTTON_ATTR, 'true');
  button.dataset.fscMode = mode;
  button.title =
    mode === 'ics'
      ? 'Pobierz plik .ics (import do dowolnego kalendarza)'
      : mode === 'google-url'
        ? 'Otwórz formularz Google Calendar w nowej karcie (bez OAuth)'
        : 'Dodaj do domyślnego Google Calendar (OAuth)';
  setButtonState(button, 'idle');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    void getCalendarMode().then((currentMode) => handleAddClick(button, match, currentMode));
  });
  return button;
}

function injectButton(row: Element, pageDate: string | null, mode: CalendarMode): void {
  if (row.querySelector(`.${BUTTON_CLASS}`)) return;

  const match = parseMatchRow(row, pageDate);
  if (!match) return;

  const button = createButton(match, mode);
  row.append(button);

  void isMatchAdded(match.id).then((added) => {
    if (added) setButtonState(button, 'added');
  });
}

function scanAndInject(root: ParentNode, mode: CalendarMode): void {
  const pageDate = readPageDate();
  const rows = root.querySelectorAll(SELECTORS.matchRow);
  rows.forEach((row) => injectButton(row, pageDate, mode));
}

export default defineContentScript({
  matches: [...FLASHSCORE_MATCHES],
  runAt: 'document_idle',
  main() {
    let currentMode: CalendarMode = 'google-url';

    void getCalendarMode().then((mode) => {
      currentMode = mode;
      scanAndInject(document, currentMode);
    });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync' || !changes.calendarMode) return;
      currentMode = changes.calendarMode.newValue as CalendarMode;
      document.querySelectorAll(`.${BUTTON_CLASS}`).forEach((el) => el.remove());
      scanAndInject(document, currentMode);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTORS.matchRow)) {
            injectButton(node, readPageDate(), currentMode);
            return;
          }
          scanAndInject(node, currentMode);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});
