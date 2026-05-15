import { SELECTORS } from './selectors';

const TEAM_VS_TEAM = /^(.+?)\s+-\s+(.+?)$/;

function isTeamVsTeamLink(anchor: HTMLAnchorElement): boolean {
  const text = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!TEAM_VS_TEAM.test(text)) return false;
  if (text.length > 70 || text.includes(':')) return false;
  const href = anchor.getAttribute('href') ?? '';
  if (!href || href === '#' || href.startsWith('javascript:')) return false;
  return true;
}

/** Row container to attach the calendar button. */
export function getButtonMount(row: Element): Element {
  if (row.matches(SELECTORS.matchRow)) return row;
  if (row.matches('a')) {
    return (
      row.closest('.event__match') ??
      row.closest('[class*="event__"]') ??
      row.parentElement ??
      row
    );
  }
  return row;
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
    return fromHref.map((a) => getButtonMount(a));
  }

  const fromText = [...scope.querySelectorAll('a')].filter(
    (el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement && isTeamVsTeamLink(el),
  );
  return fromText.map((a) => getButtonMount(a));
}
