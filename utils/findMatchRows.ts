import { SELECTORS } from './selectors';

const TEAM_VS_TEAM = /^(.+?)\s+-\s+(.+?)$/;

/** Grid columns: iconStr (audio) | iconInf | iconTv | iconStd | liveIcon */
const ICON_SLOTS_NEXT_TO_TV = ['iconInf'] as const;

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

function usedGridAreas(mount: Element): Set<string> {
  const used = new Set<string>();
  for (const child of mount.children) {
    used.add(getComputedStyle(child).gridArea);
  }
  return used;
}

/** Pick an empty icon column beside TV (FlashScore CSS grid). */
export function getCalendarGridArea(mount: Element): string {
  const used = usedGridAreas(mount);
  for (const slot of ICON_SLOTS_NEXT_TO_TV) {
    if (!used.has(slot)) return slot;
  }
  return 'iconStd';
}

/** Place in the match row icon strip (same grid row as TV / LIVE). */
export function insertCalendarButton(mount: Element, button: HTMLElement): void {
  const gridArea = getCalendarGridArea(mount);
  button.style.gridArea = gridArea;

  const tv = mount.querySelector('.event__icon--tv');
  if (tv) {
    tv.insertAdjacentElement('beforebegin', button);
    return;
  }

  const audio = mount.querySelector('.event__icon--audio');
  if (audio) {
    audio.insertAdjacentElement('afterend', button);
    return;
  }

  const liveBet = mount.querySelector('.liveBetWrapper');
  if (liveBet?.parentElement) {
    liveBet.parentElement.insertBefore(button, liveBet);
    return;
  }

  mount.append(button);
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
