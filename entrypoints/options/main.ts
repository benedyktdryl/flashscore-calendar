import { isOAuthConfigured } from '../../utils/config';
import {
  CALENDAR_MODE_KEY,
  getCalendarMode,
  MODE_LABELS,
  setCalendarMode,
  type CalendarMode,
} from '../../utils/mode';

const statusEl = document.getElementById('status')!;
const oauthRadio = document.getElementById('oauth-radio') as HTMLInputElement;
const oauthLabel = document.getElementById('oauth-label')!;

function setStatus(text: string): void {
  statusEl.textContent = text;
}

async function loadMode(): Promise<void> {
  const oauthOk = isOAuthConfigured();
  oauthRadio.disabled = !oauthOk;
  oauthLabel.classList.toggle('disabled', !oauthOk);

  const mode = await getCalendarMode();
  const input = document.querySelector<HTMLInputElement>(
    `input[name="mode"][value="${mode}"]`,
  );
  if (input) input.checked = true;

  if (!oauthOk) {
    setStatus('Tryb OAuth wyłączony — brak WXT_GOOGLE_CLIENT_ID. Użyj Google URL lub ICS.');
  } else {
    setStatus(`Aktywny tryb: ${MODE_LABELS[mode]}`);
  }
}

document.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    const mode = radio.value as CalendarMode;
    void setCalendarMode(mode)
      .then(() => setStatus(`Zapisano: ${MODE_LABELS[mode]}`))
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : 'Błąd zapisu');
        void loadMode();
      });
  });
});

void loadMode();

browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[CALENDAR_MODE_KEY]) {
    void loadMode();
  }
});
