import { SELECTORS } from './selectors';

const TEAM_VS_TEAM = /^(.+?)\s+-\s+(.+?)$/;

function isTeamVsTeamLink(anchor: HTMLAnchorElement): boolean {
  const label = (anchor.getAttribute('aria-label') ?? anchor.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!TEAM_VS_TEAM.test(label)) return false;
  if (label.length > 70 || label.includes(':')) return false;
  const href = anchor.getAttribute('href') ?? '';
  if (!href || href === '#' || href.startsWith('javascript:')) return false;
  return anchor.classList.contains('eventRowLink') || href.includes('/mecz/');
}

export function getButtonMount(row: Element): Element {
  if (row.matches(SELECTORS.matchRow)) return row;
  return (
    row.closest(SELECTORS.matchRow) ??
    row.closest('[id^="g_"]') ??
    row.closest('[class*="event__match"]') ??
    row.parentElement ??
    row
  );
}

/** Insert before betting/live badge so the button sits with Preview / TV icons. */
export function getButtonInsertBefore(row: Element): Element | null {
  const mount = getButtonMount(row);
  const anchor =
    mount.querySelector('.liveBetWrapper') ??
    mount.querySelector(SELECTORS.actionsAnchor);
  return anchor;
}

export function findMatchRows(root: ParentNode = document): Element[] {
  const legacy = [...root.querySelectorAll(SELECTORS.matchRow)];
  if (legacy.length > 0) return legacy;

  const scope =
    root instanceof Document
      ? (root.querySelector(SELECTORS.mainFeed) ?? root.body)
      : root;

  const fromHref = [...scope.querySelectorAll(SELECTORS.matchRowFallback)].filter(
    (el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement,
  );
  if (fromHref.length > 0) {
    return [...new Set(fromHref.map((a) => getButtonMount(a)))];
  }

  const fromText = [...scope.querySelectorAll('a')].filter(
    (el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement && isTeamVsTeamLink(el),
  );
  return [...new Set(fromText.map((a) => getButtonMount(a)))];
}
