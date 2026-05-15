import '../assets/flashscore-button.css';
import { calendarIconSvg } from '../utils/calendarIcon';
import { findMatchRows, getButtonMount, insertCalendarButton } from '../utils/findMatchRows';
import { buildGoogleCalendarTemplateUrl } from '../utils/googleCalendarUrl';
import { downloadIcsFile } from '../utils/ics';
import { getCalendarMode, type CalendarMode } from '../utils/mode';
import { parseMatchRow } from '../utils/parseMatch';
import { readPageDate } from '../utils/parsePageDate';
import { FLASHSCORE_MATCHES } from '../utils/flashscoreHosts';
import { BUTTON_ATTR, BUTTON_CLASS, SELECTORS } from '../utils/selectors';
import type { AddEventRequest, AddEventResponse, MatchPayload } from '../utils/types';

const RESCAN_MS = [0, 400, 1200, 3000, 6000];

const MODE_LABEL: Record<CalendarMode, string> = {
  ics: 'Pobierz plik .ics',
  'google-url': 'Dodaj do Google Calendar',
  oauth: 'Dodaj do kalendarza (OAuth)',
};

function setButtonState(
  button: HTMLButtonElement,
  state: 'idle' | 'loading' | 'error',
): void {
  button.disabled = state === 'loading';
  button.classList.remove(`${BUTTON_CLASS}--error`);

  if (state === 'error') {
    button.classList.add(`${BUTTON_CLASS}--error`);
    button.setAttribute('aria-label', 'Błąd — kliknij ponownie');
    button.style.opacity = '';
    button.innerHTML = calendarIconSvg();
    return;
  }

  if (state === 'loading') {
    button.setAttribute('aria-label', 'Otwieranie kalendarza…');
    button.style.opacity = '0.45';
    button.innerHTML = calendarIconSvg();
    return;
  }

  const mode = button.dataset.fscMode as CalendarMode | undefined;
  button.setAttribute('aria-label', mode ? MODE_LABEL[mode] : 'Dodaj do kalendarza');
  button.style.opacity = '';
  button.innerHTML = calendarIconSvg();
}

async function addViaIcs(match: MatchPayload): Promise<void> {
  downloadIcsFile(match);
}

async function addViaGoogleUrl(match: MatchPayload): Promise<void> {
  const url = buildGoogleCalendarTemplateUrl(match);
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function addViaOAuth(match: MatchPayload): Promise<void> {
  const response = (await browser.runtime.sendMessage({
    type: 'ADD_EVENT',
    match,
  } satisfies AddEventRequest)) as AddEventResponse | undefined;

  if (!response?.ok) {
    throw new Error(response?.error ?? 'Brak odpowiedzi rozszerzenia.');
  }
}

async function handleAddClick(
  button: HTMLButtonElement,
  match: MatchPayload,
  mode: CalendarMode,
): Promise<void> {
  setButtonState(button, 'loading');

  try {
    switch (mode) {
      case 'ics':
        await addViaIcs(match);
        break;
      case 'google-url':
        await addViaGoogleUrl(match);
        break;
      case 'oauth':
        await addViaOAuth(match);
        break;
      default:
        throw new Error('Nieznany tryb kalendarza.');
    }
    setButtonState(button, 'idle');
  } catch {
    setButtonState(button, 'error');
  }
}

function createButton(match: MatchPayload, mode: CalendarMode): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `event__icon ${BUTTON_CLASS}`;
  button.setAttribute(BUTTON_ATTR, 'true');
  button.dataset.fscMode = mode;
  button.title = MODE_LABEL[mode];
  setButtonState(button, 'idle');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    void getCalendarMode().then((currentMode) => handleAddClick(button, match, currentMode));
  });
  return button;
}

function injectButton(row: Element, pageDate: string | null, mode: CalendarMode): void {
  const mount = getButtonMount(row);
  if (mount.querySelector(`.${BUTTON_CLASS}`)) return;

  const match = parseMatchRow(row, pageDate);
  if (!match) return;

  const button = createButton(match, mode);
  insertCalendarButton(mount, button);
}

function scanAndInject(root: ParentNode, mode: CalendarMode): number {
  const pageDate = readPageDate();
  const rows = findMatchRows(root);
  rows.forEach((row) => injectButton(row, pageDate, mode));
  return rows.length;
}

function scheduleRescans(mode: CalendarMode): void {
  for (const ms of RESCAN_MS) {
    window.setTimeout(() => {
      scanAndInject(document, mode);
    }, ms);
  }
}

export default defineContentScript({
  matches: [...FLASHSCORE_MATCHES],
  runAt: 'document_idle',
  main() {
    console.info('[flashscore-calendar] Content script active on', location.href);

    let currentMode: CalendarMode = 'google-url';

    const start = (mode: CalendarMode) => {
      currentMode = mode;
      scheduleRescans(mode);
    };

    void getCalendarMode().then(start).catch(() => scheduleRescans('google-url'));

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync' || !changes.calendarMode) return;
      currentMode = changes.calendarMode.newValue as CalendarMode;
      document.querySelectorAll(`.${BUTTON_CLASS}`).forEach((el) => el.remove());
      scheduleRescans(currentMode);
    });

    const observer = new MutationObserver(() => {
      scanAndInject(document, currentMode);
    });

    const observeTarget =
      document.querySelector('#live-table') ??
      document.querySelector(SELECTORS.mainFeed) ??
      document.body;

    observer.observe(observeTarget, { childList: true, subtree: true });
  },
});
