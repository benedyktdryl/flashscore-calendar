const PL_WEEKDAY: Record<string, number> = {
  pn: 1,
  wt: 2,
  sr: 3,
  cz: 4,
  czw: 4,
  pt: 5,
  pi: 5,
  sb: 6,
  nd: 0,
};

function parseDayMonth(text: string): { day: number; month: number } | null {
  const match = text.match(/(\d{1,2})\s*[/.,-]\s*(\d{1,2})/);
  if (!match) return null;
  return { day: Number(match[1]), month: Number(match[2]) };
}

function inferYear(day: number, month: number, now = new Date()): number {
  let year = now.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const diffDays = (candidate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < -180) year += 1;
  if (diffDays > 180) year -= 1;
  return year;
}

export function parsePageDateFromText(raw: string, now = new Date()): string | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;

  const dm = parseDayMonth(text);
  if (!dm) return null;

  const year = inferYear(dm.day, dm.month, now);
  const month = String(dm.month).padStart(2, '0');
  const day = String(dm.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DATE_HINT =
  /(\d{1,2}\s*[/.,-]\s*\d{1,2})|(\d{1,2}\.\s*\d{1,2}\.)|(\d{1,2}\/\d{1,2})/;

export function readPageDate(documentRoot: Document = document): string | null {
  const candidates: Element[] = [
    documentRoot.querySelector('.calendar__datepicker'),
    documentRoot.querySelector('.calendar__navigation__today'),
    documentRoot.querySelector('[class*="calendar__navigation"]'),
    documentRoot.querySelector('[class*="datepicker"]'),
    documentRoot.querySelector('[role="combobox"]'),
  ].filter((el): el is Element => Boolean(el));

  for (const el of candidates) {
    const parsed = parsePageDateFromText(el.textContent ?? '');
    if (parsed) return parsed;
  }

  const buttons = documentRoot.querySelectorAll(
    'button, a, [role="combobox"], [class*="calendar"]',
  );
  for (const el of buttons) {
    const text = (el.textContent ?? '').trim();
    if (!DATE_HINT.test(text)) continue;
    const parsed = parsePageDateFromText(text);
    if (parsed) return parsed;
  }

  return null;
}

export function weekdayFromPolishAbbrev(text: string): number | undefined {
  const key = text.trim().toLowerCase().replace(/\./g, '');
  return PL_WEEKDAY[key];
}
